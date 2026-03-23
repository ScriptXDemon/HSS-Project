import { describe, expect, it } from 'vitest';
import { resolveLocalizedPersonContent } from '../person-content';

describe('person content resolution', () => {
  it('falls back from Marathi to Hindi to English per field', () => {
    const content = {
      en: {
        name: 'Raju Das',
        role: 'National President',
        bio: 'English bio',
      },
      hi: {
        name: 'राजू दास',
        role: 'राष्ट्रीय अध्यक्ष',
      },
      mr: {
        role: 'राष्ट्रीय अध्यक्ष',
      },
    };

    expect(resolveLocalizedPersonContent(content, 'mr')).toEqual({
      name: 'राजू दास',
      role: 'राष्ट्रीय अध्यक्ष',
      bio: 'English bio',
    });
  });
});
