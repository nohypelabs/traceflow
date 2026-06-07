'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, Copy, Check, Eye, EyeOff, Loader2, AlertTriangle, 
  Shield 
} from 'lucide-react';
import { FadeIn, ScaleIn } from '@/components/ui/animation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Kredensial tidak valid. Periksa email dan kata sandi Anda.');
    } else {
      router.push('/');
    }
  };

  const fillDemo = () => {
    setEmail('admin@traceflow.com');
    setPassword('admin112233');
    setError(null);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1600);
  };

  return (
    <FadeIn>
      <ScaleIn>
        {/* Main holographic card */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_70px_-15px_rgb(0,0,0)] backdrop-blur-2xl">
          {/* Holographic gradient overlays */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_15%,rgba(6,182,212,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_85%,rgba(139,92,246,0.05),transparent_60%)]" />

          {/* Subtle scan lines */}
          <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_3px)]" />

          <div className="relative p-8">
            {/* Header / Logo */}
            <div className="mb-7 flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10">
                <div className="relative">
                  <Target className="h-8 w-8 text-cyan-400" />
                  <div className="absolute -inset-1 rounded-full border border-cyan-400/40" />
                </div>
              </div>
              <div className="font-mono text-2xl font-semibold tracking-[4px] text-zinc-900 dark:text-white">TRACEFLOW</div>
              <div className="mt-0.5 text-[10px] tracking-[3px] text-cyan-400/70">COMMAND CENTER ACCESS</div>
            </div>

            <div className="mb-6 text-center">
              <div className="text-sm text-zinc-500 dark:text-zinc-400">Autentikasi untuk mengakses jaringan pelacakan waktu nyata</div>
            </div>

            {/* Demo Access Panel — sleek telemetry style */}
            <div className="mb-6 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/40 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-medium tracking-[1.5px] text-emerald-400/90">
                  <Shield className="h-3.5 w-3.5" />
                  QUICK ACCESS — DEMO OPERATOR
                </div>
                <button
                  type="button"
                  onClick={fillDemo}
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] font-medium text-cyan-400 transition hover:bg-cyan-500/10 hover:text-cyan-300 active:scale-[0.985]"
                >
                  AUTO-FILL
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/60 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <span className="font-mono text-[10px]">EMAIL</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                    admin@traceflow.com
                    <button
                      type="button"
                      onClick={() => copyToClipboard('admin@traceflow.com', 'email')}
                      className="ml-0.5 rounded p-1 text-zinc-500 transition hover:bg-white/5 hover:text-cyan-400"
                    >
                      {copied === 'email' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-white/5 bg-white dark:bg-zinc-950/60 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <span className="font-mono text-[10px]">PASS</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                    admin112233
                    <button
                      type="button"
                      onClick={() => copyToClipboard('admin112233', 'password')}
                      className="ml-0.5 rounded p-1 text-zinc-500 transition hover:bg-white/5 hover:text-cyan-400"
                    >
                      {copied === 'password' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error state — glowing red */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-300">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
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
                  placeholder="admin@traceflow.com"
                  className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-cyan-500/60 focus:bg-white dark:focus:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
                />
              </div>

              {/* Password Field with toggle */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="password" className="block text-[10px] font-medium tracking-[1.5px] text-zinc-400">
                    SECURE PASSCODE
                  </label>
                  <a href="#" className="text-[10px] text-zinc-500 hover:text-cyan-400 transition-colors">Forgot passcode?</a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="futuristic-input w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/60 px-4 py-3 pr-12 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-cyan-500/60 focus:bg-white dark:focus:bg-zinc-950/80 focus:outline-none focus:ring-1 focus:ring-cyan-500/40"
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
              </div>

              {/* Neon Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="neon-button group relative mt-2 flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-cyan-400/30 bg-gradient-to-r from-cyan-500/90 to-blue-600/90 font-medium text-white shadow-[0_0_20px_rgba(6,182,212,0.15)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AUTHENTICATING...</span>
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4" />
                    <span>ACCESS TRACKING NETWORK</span>
                  </>
                )}
                {/* Hover light sweep */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>

            {/* Footer link */}
            <div className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
              Tidak memiliki clearance?{' '}
              <a 
                href="/register" 
                className="font-medium text-cyan-400 transition hover:text-cyan-300 hover:underline underline-offset-4"
              >
                Daftarkan operator baru
              </a>
            </div>
          </div>
        </div>
      </ScaleIn>
    </FadeIn>
  );
}
