'use client';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { ReactNode, useEffect, useState } from 'react';
import { defaultLocale } from '@/lib/i18n';

type Props = {
  children: ReactNode;
  locale?: string;
};

export function LanguageProvider({ children, locale = defaultLocale }: Props) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      const { messages } = await import(`../locales/${locale}/messages.po`);
      i18n.load(locale, messages);
      i18n.activate(locale);
      setIsLoading(false);
    }
    
    loadMessages();
  }, [locale]);

  if (isLoading) {
    return null;
  }

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}
