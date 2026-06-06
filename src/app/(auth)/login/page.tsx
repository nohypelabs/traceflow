'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Copy, Check } from 'lucide-react';
import { FadeIn, ScaleIn } from '@/components/ui/animation';
import { Card, Flex, Heading, Text, Button } from '@radix-ui/themes';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError('Email atau kata sandi salah');
    } else {
      router.push('/');
    }
  };

  const fillDemo = () => {
    setEmail('admin@traceflow.com');
    setPassword('admin112233');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <FadeIn>
      <ScaleIn>
        <Card className="p-8">
          {/* Logo */}
          <Flex align="center" justify="center" gap="2" mb="6">
            <MapPin className="h-8 w-8 text-blue-600" />
            <Heading size="6">TraceFlow</Heading>
          </Flex>

          <Text size="2" color="gray" align="center" mb="6">
            Masuk ke akun Anda
          </Text>

          {/* Demo Credentials */}
          <Card className="mb-6 bg-blue-50 dark:bg-blue-950 p-4">
            <Text size="2" weight="medium" className="mb-2 block">
              Akun Demo
            </Text>
            <div className="space-y-2">
              <Flex align="center" justify="between">
                <Text size="1" color="gray">Email:</Text>
                <Flex align="center" gap="2">
                  <code className="text-xs bg-white dark:bg-zinc-800 px-2 py-1 rounded">
                    admin@traceflow.com
                  </code>
                  <button
                    onClick={() => copyToClipboard('admin@traceflow.com', 'email')}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {copied === 'email' ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </Flex>
              </Flex>
              <Flex align="center" justify="between">
                <Text size="1" color="gray">Kata Sandi:</Text>
                <Flex align="center" gap="2">
                  <code className="text-xs bg-white dark:bg-zinc-800 px-2 py-1 rounded">
                    admin112233
                  </code>
                  <button
                    onClick={() => copyToClipboard('admin112233', 'password')}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    {copied === 'password' ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </button>
                </Flex>
              </Flex>
            </div>
            <Button
              variant="soft"
              size="2"
              className="mt-3 w-full"
              onClick={fillDemo}
            >
              Isi Kredensial Demo
            </Button>
          </Card>

          {error && (
            <Card className="mb-4 bg-red-50 p-4 dark:bg-red-950">
              <Text color="red" size="2">{error}</Text>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="admin@traceflow.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Kata Sandi
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </Button>
          </form>

          <Text size="2" color="gray" align="center" mt="4">
            Belum punya akun?{' '}
            <a href="/register" className="text-blue-600 hover:underline">
              Daftar
            </a>
          </Text>
        </Card>
      </ScaleIn>
    </FadeIn>
  );
}
