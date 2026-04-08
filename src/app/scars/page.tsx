import Link from 'next/link';

export const metadata = {
  title: 'The Scars System - ScarsHQ',
  description: 'Scars are permanent character modifications earned through gameplay. They cannot be respecced and sit on top of your class, talent, and gear choices.',
};

export default function ScarsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-text-muted mb-6">
        <Link href="/" className="hover:text-honor-gold transition-colors">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-text-secondary">The Scars System</span>
      </nav>

      <h1 className="font-heading text-3xl md:text-4xl text-honor-gold mb-4">
        The Scars System
      </h1>
      <p className="text-text-secondary mb-12 max-w-6xl">
        Scars are the game&apos;s namesake mechanic. They are permanent modifications to your character
        that you earn through gameplay. Unlike talents, they cannot be respecced. Unlike gear,
        they cannot be swapped out. Once you have a Scar, it stays.
      </p>

      {/* What they are */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-honor-gold rotate-45" />
          <h2 className="font-heading text-2xl text-honor-gold">What Scars Do</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-honor-gold rotate-45 shrink-0" />
              <h3 className="font-heading text-lg text-text-primary">Permanent</h3>
            </div>
            <p className="text-sm text-text-secondary">
              You cannot undo a Scar. Talents can be respecced, gear can be replaced, but Scars
              are locked in once earned. That is the whole point.
            </p>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-honor-gold rotate-45 shrink-0" />
              <h3 className="font-heading text-lg text-text-primary">Earned, Not Bought</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Scars come from gameplay milestones. PvE clears, PvP wins, crafting mastery,
              exploration. They are not in the shop and they do not drop from mobs.
            </p>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-honor-gold rotate-45 shrink-0" />
              <h3 className="font-heading text-lg text-text-primary">On Top of Everything Else</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Scars sit on a separate layer from your class, talents, and gear. Two players with
              the exact same build and equipment will still differ because of their Scars.
            </p>
          </div>
          <div className="bg-card-bg border border-border-subtle rounded-lg p-6 hover:border-honor-gold-dim transition-colors glow-gold-hover">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-3 h-3 bg-honor-gold rotate-45 shrink-0" />
              <h3 className="font-heading text-lg text-text-primary">Choices That Matter</h3>
            </div>
            <p className="text-sm text-text-secondary">
              Because Scars are permanent, picking one is a real decision. You are not
              collecting all of them. You are choosing which ones define your character.
            </p>
          </div>
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Why it matters */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-3 h-3 bg-honor-gold rotate-45" />
          <h2 className="font-heading text-2xl text-honor-gold">Why This Matters</h2>
        </div>
        <div className="bg-card-bg border border-border-subtle rounded-lg p-6">
          <p className="text-sm text-text-secondary mb-4">
            In most MMOs, if two players pick the same class with the same gear, they play
            identically. Scars of Honor adds a layer that prevents that. Your Scars reflect
            what you actually did in the game, not just what build guide you followed.
          </p>
          <p className="text-sm text-text-secondary mb-4">
            The talent tree handles your combat role. Scars handle long term character identity.
            They work alongside each other, not in competition. You do not pick Scars instead
            of talents. You pick them on top of talents.
          </p>
          <p className="text-sm text-text-secondary">
            Whether your Scars came from dungeon clears, arena wins, or hitting crafting
            milestones, they are permanent and they are yours.
          </p>
        </div>
      </section>

      <div className="diamond-divider mb-12">
        <span className="diamond" />
      </div>

      {/* Disclaimer */}
      <section className="mb-12">
        <div className="bg-card-bg border border-honor-gold/20 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <span className="text-honor-gold text-lg mt-0.5">*</span>
            <div>
              <h3 className="font-heading text-sm text-honor-gold mb-2">Still in Development</h3>
              <p className="text-sm text-text-secondary">
                The Scars system has not been fully revealed yet. The devs have talked about
                the concept publicly but specific mechanics, categories, and rewards are still
                being worked on. We will update this page as more details come out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center">
        <p className="text-text-secondary mb-4">Explore more about building your character.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/talents"
            className="px-8 py-3 bg-honor-gold text-void-black font-heading font-semibold rounded-lg hover:bg-honor-gold-light transition-colors"
          >
            Talent Calculator
          </Link>
          <Link
            href="/classes"
            className="px-8 py-3 border border-border-subtle text-text-secondary font-heading font-semibold rounded-lg hover:border-honor-gold-dim hover:text-honor-gold transition-colors"
          >
            View Classes
          </Link>
        </div>
      </div>
    </div>
  );
}
