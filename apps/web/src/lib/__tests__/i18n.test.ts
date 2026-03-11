import { describe, expect, it } from 'vitest';
import {
  formatTemplate,
  getIntlLocale,
  getStatusLabel,
  languageLabels,
  normalizeLanguage,
  pickLanguage,
} from '../i18n';

describe('web i18n', () => {
  it('supports Marathi labels and locale selection', () => {
    expect(languageLabels.mr).toBe('मराठी');
    expect(getIntlLocale('mr')).toBe('mr-IN');
    expect(normalizeLanguage('mr')).toBe('mr');
  });

  it('falls back to Hindi or English when Marathi copy is missing', () => {
    expect(pickLanguage('mr', { en: 'Donate', hi: 'दान करें' })).toBe('दान करें');
    expect(pickLanguage('mr', { en: 'Donate' })).toBe('Donate');
  });

  it('returns Marathi when Marathi copy exists', () => {
    expect(pickLanguage('mr', { en: 'Donate', hi: 'दान करें', mr: 'देणगी द्या' })).toBe('देणगी द्या');
  });

  it('formats translated status and templates', () => {
    expect(getStatusLabel('APPROVED', 'mr')).toBe('मंजूर');
    expect(formatTemplate('पान {page} / {total}', { page: 2, total: 5 })).toBe('पान 2 / 5');
  });
});
