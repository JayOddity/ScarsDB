'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setStatus('success');
      setMessage(data.message || 'Successfully subscribed!');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }

  return (
    <div className="rounded-lg border border-subtle bg-dark-surface p-6">
      <h3 className="mb-1 text-lg font-bold text-honor-gold">
        The Scarred Herald
      </h3>
      <p className="mb-4 text-sm text-gray-400">
        Subscribe for the latest Scars of Honor news, guides, and updates.
      </p>

      {status === 'success' ? (
        <div className="rounded border border-green-700 bg-green-900/30 px-4 py-3 text-sm text-green-300">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={status === 'loading'}
            className="flex-1 rounded border border-subtle bg-dark-surface px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-honor-gold disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="rounded bg-honor-gold px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-honor-gold/80 disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="mt-2 text-sm text-red-400">{message}</p>
      )}
    </div>
  );
}
