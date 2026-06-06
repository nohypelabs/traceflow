'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { api } from '@/lib/api-provider';
import { MapPin } from 'lucide-react';
import { FadeIn, ScaleIn } from '@/components/ui/animation';
import { Card, Flex, Heading, Text, Button } from '@radix-ui/themes';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const registerMutation = api.auth.register.useMutation({
    onSuccess: async () => {
      // Auto-login setelah registrasi
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Registrasi berhasil tetapi auto-login gagal');
        router.push('/login');
      } else {
        router.push('/');
      }
    },
    onError: (err) => {
      setError(err.message);
      setLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    registerMutation.mutate({ name, email, password });
  };

  return (
    <FadeIn>
      <ScaleIn>
        <Card className="p-8">
          <Flex align="center" justify="center" gap="2" mb="6">
            <MapPin className="h-8 w-8 text-blue-600" />
            <Heading size="6">TraceFlow</Heading>
          </Flex>

          <Text size="2" color="gray" align="center" mb="6">
            Buat akun baru
          </Text>

          {error && (
            <Card className="mb-4 bg-red-50 p-4 dark:bg-red-950">
              <Text color="red" size="2">{error}</Text>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Nama
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="Nama Anda"
              />
            </div>

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
                placeholder="email@anda.com"
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
                minLength={8}
                className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
                placeholder="••••••••"
              />
              <Text size="1" color="gray" mt="1">
                Minimal 8 karakter
              </Text>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Membuat akun...' : 'Daftar'}
            </Button>
          </form>

          <Text size="2" color="gray" align="center" mt="4">
            Sudah punya akun?{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              Masuk
            </a>
          </Text>
        </Card>
      </ScaleIn>
    </FadeIn>
  );
}
