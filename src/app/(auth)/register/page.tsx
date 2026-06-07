'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { 
  UserPlus, Eye, EyeOff, Loader2, AlertTriangle, Shield, 
  Check, X 
} from 'lucide-react';
import { FadeIn, ScaleIn } from '@/components/ui/animation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Simple password strength (visual only)
  const passwordStrength = (() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 3);
  })();

  const strengthLabel = ['Sangat lemah', 'Lemah', 'Cukup', 'Kuat'][passwordStrength] || '';
  const strengthColor = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-emerald-400'][passwordStrength] || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Register via tRPC (raw fetch — matches current implementation)
      const res = await fetch('/api/trpc/auth.register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          0: { json: { name, email, password } },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data[0]?.error?.message ?? 'Registration failed');
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registrasi berhasil tapi auto-login gagal');
        router.push('/login');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FadeIn>
      <ScaleIn>
        {/* Matching holographic card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_70px_-15px_rgb(0,0,0)] backdrop-blur-2xl">
          {/* Holographic gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(6,182,212,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_85%,rgba(139,92,246,0.05),transparent_60%)]" />

          {/* Subtle scan lines */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_3px)]" />

          <div className="relative p-8">
            {/* Header */}
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <UserPlus className="h-7 w-7 text-cyan-400" />
              </div>
              <div className="font-mono text-2xl font-semibold tracking-[4px] text-zinc-900 dark:text-white">TRACEFLOW</div>
              <div className="mt-0.5 text-[10px] tracking-[3px] text-cyan-400/70">NEW OPERATOR REGISTRATION</div>
            </div>

            <div className="mb-6 text-center">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Buat akun untuk bergabung dengan jaringan pelacakan real-time</div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label htmlFor="name" className="mb-1.5 block text-[10px] font-medium tracking-[1.5px] text-zinc-400">
                  OPERATOR NAME
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Nama lengkap"
                  className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-cyan-500/60 focus:bg-white dark:focus:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="mb-1.5 block text-[10px] font-medium tracking-[1.5px] text-zinc-400">
                  OPERATOR EMAIL
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="email@anda.com"
                  className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-cyan-500/60 focus:bg-white dark:focus:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
              </div>

              {/* Password + strength indicator */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-[10px] font-medium tracking-[1.5px] text-zinc-400">
                    SECURE PASSCODE
                  </label>
                  <span className="text-[10px] text-zinc-500">Min 8 karakter</span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="••••••••"
                    className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-3 pr-12 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-600 focus:border-cyan-500/60 focus:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-500 hover:text-cyan-400 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${i < passwordStrength ? 'bg-current' : 'bg-white/10'}`}
                          style={{ color: i < passwordStrength ? (passwordStrength === 3 ? '#10b981' : passwordStrength === 2 ? '#eab308' : '#f97316') : undefined }}
                        />
                      ))}
                    </div>
                    <span className={`text-[10px] font-medium tabular-nums ${strengthColor}`}>
                      {strengthLabel}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="neon-button group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 font-medium text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>CREATING SECURE PROFILE...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>JOIN TRACKING NETWORK</span>
                  </>
                )}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Sudah punya akun?{' '}
              <a 
                href="/login" 
                className="font-medium text-cyan-400 transition hover:text-cyan-300 hover:underline underline-offset-4"
              >
                Masuk ke command center
              </a>
            </div>
          </div>
        </div>
      </ScaleIn>
    </FadeIn>
  );
}
