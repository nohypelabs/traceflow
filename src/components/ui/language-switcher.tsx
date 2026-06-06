'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { Card, Flex, Box, Heading, Text } from '@radix-ui/themes';
import { useTranslations, type Locale } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslations();
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);

  const handleLocaleChange = (newLocale: Locale) => {
    setCurrentLocale(newLocale);
    setLocale(newLocale);
    // Reload page to apply changes
    window.location.reload();
  };

  const languages = [
    { code: 'id' as Locale, name: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'en' as Locale, name: 'English', flag: '🇬🇧' },
  ];

  return (
    <Card className="p-6">
      <Flex align="center" gap="2" mb="4">
        <Globe className="h-5 w-5 text-blue-500" />
        <Heading size="4">Bahasa</Heading>
      </Flex>

      <div className="space-y-3">
        {languages.map((lang) => (
          <Flex
            key={lang.code}
            align="center"
            justify="between"
            className="cursor-pointer rounded-lg border p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            onClick={() => handleLocaleChange(lang.code)}
          >
            <Flex align="center" gap="3">
              <Text size="4">{lang.flag}</Text>
              <Box>
                <Text weight="medium">{lang.name}</Text>
                <Text size="1" color="gray">
                  {lang.code === 'id' ? 'Indonesia' : 'English'}
                </Text>
              </Box>
            </Flex>
            {currentLocale === lang.code && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </Flex>
        ))}
      </div>

      <Text size="1" color="gray" className="mt-4">
        Perubahan bahasa akan diterapkan setelah refresh halaman.
      </Text>
    </Card>
  );
}
