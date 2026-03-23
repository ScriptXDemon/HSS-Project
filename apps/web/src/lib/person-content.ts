import type {
  AdminOrganizationPersonDTO,
  LocalizedOrganizationPersonContentDTO,
  OrganizationPersonLanguageContentDTO,
} from '@hss/domain';
import type { Language } from '@/lib/i18n';

function normalizeOptionalString(value?: string) {
  const normalized = value?.trim();
  return normalized || undefined;
}

export function resolveLocalizedPersonContent(
  content: LocalizedOrganizationPersonContentDTO,
  language: Language
): OrganizationPersonLanguageContentDTO {
  const english = {
    name: content.en.name.trim(),
    role: content.en.role.trim(),
    bio: normalizeOptionalString(content.en.bio),
  };
  const hindi = content.hi ?? {};
  const marathi = content.mr ?? {};

  if (language === 'mr') {
    return {
      name: marathi.name?.trim() || hindi.name?.trim() || english.name,
      role: marathi.role?.trim() || hindi.role?.trim() || english.role,
      bio: normalizeOptionalString(marathi.bio) ?? normalizeOptionalString(hindi.bio) ?? english.bio,
    };
  }

  if (language === 'hi') {
    return {
      name: hindi.name?.trim() || english.name,
      role: hindi.role?.trim() || english.role,
      bio: normalizeOptionalString(hindi.bio) ?? english.bio,
    };
  }

  return english;
}

export function getPersonDisplayName(person: AdminOrganizationPersonDTO, language: Language) {
  return resolveLocalizedPersonContent(person.content, language).name;
}

export function createEmptyPersonContent(): LocalizedOrganizationPersonContentDTO {
  return {
    en: {
      name: '',
      role: '',
      bio: '',
    },
    hi: {},
    mr: {},
  };
}
