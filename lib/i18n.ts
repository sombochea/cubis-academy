import { i18n } from '@lingui/core';

export const locales = {
  km: 'ភាសាខ្មែរ',
  en: 'English',
};

export const defaultLocale = 'km';

export async function loadCatalog(locale: string) {
  const { messages } = await import(`../locales/${locale}/messages.po`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}

export { i18n };
