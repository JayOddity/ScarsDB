'use client';

import { useRef, useState } from 'react';

interface Props {
  buildCode: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  large?: boolean;
}

// Vote version — bump this to wipe all users' local votes
const VOTE_VERSION = 1;
const VOTE_KEY = 'scarshq-votes';
const VOTE_VER_KEY = 'scarshq-votes-version';

function checkVersion() {
  try {
    const v = Number(localStorage.getItem(VOTE_VER_KEY) || 0);
    if (v < VOTE_VERSION) {
      localStorage.removeItem(VOTE_KEY);
      localStorage.setItem(VOTE_VER_KEY, String(VOTE_VERSION));
    }
  } catch { /* */ }
}

function readVote(code: string): number {
  checkVersion();
  try { return JSON.parse(localStorage.getItem(VOTE_KEY) || '{}')[code] || 0; } catch { return 0; }
}
function writeVote(code: string, v: number) {
  try {
    const all = JSON.parse(localStorage.getItem(VOTE_KEY) || '{}');
    if (v === 0) delete all[code]; else all[code] = v;
    localStorage.setItem(VOTE_KEY, JSON.stringify(all));
  } catch { /* */ }
}

export default function VoteButton({ buildCode, initialUpvotes = 0, initialDownvotes = 0, large }: Props) {
  const lock = useRef(false);
  const serverScore = initialUpvotes - initialDownvotes;
  const [myVote, setMyVote] = useState(() => {
    const saved = readVote(buildCode);
    // If server score is 0 but we have a saved vote, votes were reset — clear it
    if (saved !== 0 && initialUpvotes === 0 && initialDownvotes === 0) {
      writeVote(buildCode, 0);
      return 0;
    }
    return saved;
  });
  const [score, setScore] = useState(serverScore);

  // Entirely synchronous click handler — no async, no await
  function click(dir: 1 | -1) {
    // Ref check is synchronous and immediate
    if (lock.current) return;
    lock.current = true;

    const old = myVote;
    const next = old === dir ? 0 : dir;
    const delta = next - old; // e.g. 0→1 = +1, 1→0 = -1, 1→-1 = -2, -1→1 = +2

    // Update everything synchronously
    setMyVote(next);
    setScore(s => s + delta);
    writeVote(buildCode, next);

    // Fire and forget — server just adjusts the score
    fetch(`/api/builds/${buildCode}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta }),
    })
    .catch(() => {
      // Rollback on network failure
      setMyVote(old);
      setScore(s => s - delta);
      writeVote(buildCode, old);
    })
    .finally(() => { lock.current = false; });
  }

  const btnSize = large ? 'w-10 h-10' : 'w-7 h-7';
  const iconSize = large ? 20 : 14;
  const scoreSize = large ? 'text-sm' : 'text-xs';

  return (
    <div className="flex flex-col items-center gap-0.5" onClick={e => e.stopPropagation()}>
      <button
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); click(1); }}
        className={`${btnSize} flex items-center justify-center rounded transition-colors ${
          myVote === 1 ? 'text-green-400 bg-green-500/15' : 'text-text-muted hover:text-green-400 hover:bg-green-500/10'
        }`}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h5v8h6v-8h5z" /></svg>
      </button>
      <span className={`${scoreSize} font-bold tabular-nums ${score > 0 ? 'text-green-400' : score < 0 ? 'text-scar-red-light' : 'text-text-muted'}`}>
        {score}
      </span>
      <button
        onMouseDown={e => { e.preventDefault(); e.stopPropagation(); click(-1); }}
        className={`${btnSize} flex items-center justify-center rounded transition-colors ${
          myVote === -1 ? 'text-scar-red-light bg-scar-red/15' : 'text-text-muted hover:text-scar-red-light hover:bg-scar-red/10'
        }`}
      >
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8h-5V4H9v8H4z" /></svg>
      </button>
    </div>
  );
}
