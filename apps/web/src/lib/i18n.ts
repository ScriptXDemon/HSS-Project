export type Language = 'en' | 'hi' | 'mr';

export const LANGUAGE_COOKIE_NAME = 'hss-language';

export const languageLabels: Record<Language, string> = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
};

export function isLanguage(value: string | null | undefined): value is Language {
  return value === 'en' || value === 'hi' || value === 'mr';
}

export function normalizeLanguage(value: string | null | undefined): Language {
  return isLanguage(value) ? value : 'en';
}

export function getLanguageFromCookiesStore(cookieStore: {
  get: (name: string) => { value: string } | undefined;
}): Language {
  return normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE_NAME)?.value);
}

export function pickLanguage<TEn, THi = TEn, TMr = THi | TEn>(
  language: Language,
  copy: { en: TEn; hi?: THi; mr?: TMr }
): TEn | THi | TMr {
  if (language === 'mr') {
    return (copy.mr ?? copy.hi ?? copy.en) as TEn | THi | TMr;
  }

  if (language === 'hi') {
    return (copy.hi ?? copy.en) as TEn | THi | TMr;
  }

  return copy.en as TEn | THi | TMr;
}

export function getIntlLocale(language: Language) {
  if (language === 'hi') {
    return 'hi-IN';
  }

  if (language === 'mr') {
    return 'mr-IN';
  }

  return 'en-IN';
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
    PENDING: { en: 'Pending', hi: 'लंबित', mr: 'प्रलंबित' },
    APPROVED: { en: 'Approved', hi: 'स्वीकृत', mr: 'मंजूर' },
    REJECTED: { en: 'Rejected', hi: 'अस्वीकृत', mr: 'नामंजूर' },
    SUSPENDED: { en: 'Suspended', hi: 'निलंबित', mr: 'निलंबित' },
    SUCCESS: { en: 'Success', hi: 'सफल', mr: 'यशस्वी' },
    FAILED: { en: 'Failed', hi: 'असफल', mr: 'अयशस्वी' },
    REFUNDED: { en: 'Refunded', hi: 'रिफंड', mr: 'परतावले' },
    READ: { en: 'Read', hi: 'पढ़ा गया', mr: 'वाचले' },
    UNREAD: { en: 'Unread', hi: 'अपठित', mr: 'न वाचलेले' },
    PUBLISHED: { en: 'Published', hi: 'प्रकाशित', mr: 'प्रकाशित' },
    DRAFT: { en: 'Draft', hi: 'ड्राफ्ट', mr: 'मसुदा' },
  };

  return labels[status]?.[language] || status;
}

export function getRoleLabel(role: string, language: Language) {
  const labels: Record<string, Record<Language, string>> = {
    SUPER_ADMIN: { en: 'Super Admin', hi: 'सुपर एडमिन', mr: 'सुपर अॅडमिन' },
    ADMIN: { en: 'Admin', hi: 'एडमिन', mr: 'अॅडमिन' },
    MEMBER: { en: 'Member', hi: 'सदस्य', mr: 'सदस्य' },
  };

  return labels[role]?.[language] || role;
}
