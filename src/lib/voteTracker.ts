// In-memory vote tracker for fast voting
// Persists to Sanity periodically in the background

import { sanityClient, sanityWriteClient } from '@/lib/sanity';

interface VoteState {
  upvotes: number;
  downvotes: number;
  // voter key → vote (1 or -1)
  voters: Map<string, number>;
  dirty: boolean; // needs Sanity sync
  buildId: string;
}

const cache = new Map<string, VoteState>();
let syncInterval: ReturnType<typeof setInterval> | null = null;

function ensureSync() {
  if (syncInterval) return;
  syncInterval = setInterval(syncToSanity, 30_000); // sync every 30s
}

async function syncToSanity() {
  for (const [code, state] of cache) {
    if (!state.dirty) continue;
    try {
      await sanityWriteClient.patch(state.buildId)
        .set({ upvotes: state.upvotes, downvotes: state.downvotes })
        .commit();
      state.dirty = false;
    } catch {
      // retry next cycle
    }
  }
}

async function loadBuild(code: string): Promise<VoteState | null> {
  if (cache.has(code)) return cache.get(code)!;

  const build = await sanityClient.fetch<{ _id: string; upvotes: number; downvotes: number } | null>(
    `*[_type == "talentBuild" && code == $code][0]{ _id, upvotes, downvotes }`,
    { code },
  );
  if (!build) return null;

  const state: VoteState = {
    upvotes: build.upvotes || 0,
    downvotes: build.downvotes || 0,
    voters: new Map(),
    dirty: false,
    buildId: build._id,
  };

  // Load existing votes into memory
  const votes = await sanityClient.fetch<{ visitorKey: string; vote: number }[]>(
    `*[_type == "buildVote" && build._ref == $buildId]{
      "visitorKey": coalesce(string(user._ref), voterIp),
      vote
    }`,
    { buildId: build._id },
  );
  for (const v of votes) {
    if (v.visitorKey) state.voters.set(v.visitorKey, v.vote);
  }

  cache.set(code, state);
  ensureSync();
  return state;
}

export async function getVote(code: string, voterKey: string): Promise<{ score: number; userVote: number } | null> {
  const state = await loadBuild(code);
  if (!state) return null;
  return {
    score: state.upvotes - state.downvotes,
    userVote: state.voters.get(voterKey) || 0,
  };
}

export async function castVote(code: string, voterKey: string, vote: 0 | 1 | -1): Promise<{ score: number; userVote: number } | null> {
  const state = await loadBuild(code);
  if (!state) return null;

  const oldVote = state.voters.get(voterKey) || 0;

  // Remove old vote from counts
  if (oldVote === 1) state.upvotes = Math.max(0, state.upvotes - 1);
  if (oldVote === -1) state.downvotes = Math.max(0, state.downvotes - 1);

  // Apply new vote
  if (vote === 0) {
    state.voters.delete(voterKey);
  } else {
    state.voters.set(voterKey, vote);
    if (vote === 1) state.upvotes++;
    if (vote === -1) state.downvotes++;
  }

  state.dirty = true;

  // Persist vote document to Sanity in background (non-blocking)
  persistVoteDoc(state.buildId, voterKey, vote, oldVote).catch(() => {});

  return {
    score: state.upvotes - state.downvotes,
    userVote: vote,
  };
}

async function persistVoteDoc(buildId: string, voterKey: string, vote: number, oldVote: number) {
  const isUserId = voterKey.startsWith('user-');

  // Find existing vote doc
  const filter = isUserId
    ? `*[_type == "buildVote" && build._ref == $buildId && user._ref == $voterKey][0]{ _id }`
    : `*[_type == "buildVote" && build._ref == $buildId && voterIp == $voterKey][0]{ _id }`;

  const existing = await sanityWriteClient.fetch<{ _id: string } | null>(filter, { buildId, voterKey });

  if (vote === 0) {
    if (existing) await sanityWriteClient.delete(existing._id);
  } else if (existing) {
    if (oldVote !== vote) await sanityWriteClient.patch(existing._id).set({ vote }).commit();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc: any = { _type: 'buildVote', build: { _type: 'reference', _ref: buildId }, vote };
    if (isUserId) doc.user = { _type: 'reference', _ref: voterKey };
    else doc.voterIp = voterKey;
    await sanityWriteClient.create(doc);
  }
}
