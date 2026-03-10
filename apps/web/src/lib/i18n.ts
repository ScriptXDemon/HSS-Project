export type Language = 'en' | 'hi';

export const LANGUAGE_COOKIE_NAME = 'hss-language';

export const languageLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
};

export function isLanguage(value: string | null | undefined): value is Language {
  return value === 'en' || value === 'hi';
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return isLanguage(value) ? value : 'en';
}

export function getLanguageFromCookiesStore(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): Language {
  return normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value);
}

export function pickLanguage<TEn, THi>(
  language: Language,
  copy: { en: TEn; hi: THi }
): TEn | THi {
  return (language === 'hi' ? copy.hi : copy.en) as TEn | THi;
}

export function getIntlLocale(language: Language) {
  return language === 'hi' ? 'hi-IN' : 'en-IN';
}

export function formatTemplate(
  template: string,
  values: Record<string, string | number>
) {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    template
  );
}

export function getStatusLabel(status: string, language: Language) {
  const labels: Record<string, Record<Language, string>> = {
    PENDING: { en: 'Pending', hi: 'लंबित' },
    APPROVED: { en: 'Approved', hi: 'स्वीकृत' },
    REJECTED: { en: 'Rejected', hi: 'अस्वीकृत' },
    SUSPENDED: { en: 'Suspended', hi: 'निलंबित' },
    SUCCESS: { en: 'Success', hi: 'सफल' },
    FAILED: { en: 'Failed', hi: 'असफल' },
    REFUNDED: { en: 'Refunded', hi: 'रिफंड' },
    READ: { en: 'Read', hi: 'पढ़ा गया' },
    UNREAD: { en: 'Unread', hi: 'अपठित' },
    PUBLISHED: { en: 'Published', hi: 'प्रकाशित' },
    DRAFT: { en: 'Draft', hi: 'ड्राफ्ट' },
  };

  return labels[status]?.[language] || status;
}

export function getRoleLabel(role: string, language: Language) {
  const labels: Record<string, Record<Language, string>> = {
    SUPER_ADMIN: { en: 'Super Admin', hi: 'सुपर एडमिन' },
    ADMIN: { en: 'Admin', hi: 'एडमिन' },
    MEMBER: { en: 'Member', hi: 'सदस्य' },
  };

  return labels[role]?.[language] || role;
}
