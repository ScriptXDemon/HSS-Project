import { describe, expect, it } from 'vitest';
import {
  getAboutPeople,
  getFeaturedPeople,
  parseBanners,
  parseRoster,
} from '../services/organization-content';

describe('organization roster content', () => {
  it('supports legacy flat person records as English defaults', () => {
    const roster = parseRoster(
      JSON.stringify([
        {
          id: 'legacy-person',
          name: 'Aditi Sharma',
          role: 'State Convenor',
          bio: 'Coordinates state initiatives.',
          showOnAbout: true,
          showOnHome: true,
          aboutOrder: 1,
          homeOrder: 1,
        },
      ])
    );

    const aboutPeople = getAboutPeople(roster, 'en');
    expect(aboutPeople[0]).toMatchObject({
      name: 'Aditi Sharma',
      role: 'State Convenor',
      bio: 'Coordinates state initiatives.',
    });
  });

  it('falls back from Marathi to Hindi to English for localized roster fields', () => {
    const roster = parseRoster(
      JSON.stringify([
        {
          id: 'localized-person',
          content: {
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
          },
          showOnAbout: true,
          showOnHome: true,
          aboutOrder: 1,
          homeOrder: 1,
        },
      ])
    );

    const featuredPeople = getFeaturedPeople(roster, 'mr');
    expect(featuredPeople[0]).toMatchObject({
      name: 'राजू दास',
      role: 'राष्ट्रीय अध्यक्ष',
      bio: 'English bio',
    });
  });
  it('keeps every stored banner instead of truncating to three', () => {
    const banners = parseBanners(
      JSON.stringify([
        { id: 'banner-4', imageUrl: '/banner-4.jpg', sortOrder: 4 },
        { id: 'banner-2', imageUrl: '/banner-2.jpg', sortOrder: 2 },
        { id: 'banner-1', imageUrl: '/banner-1.jpg', sortOrder: 1 },
        { id: 'banner-3', imageUrl: '/banner-3.jpg', sortOrder: 3 },
      ])
    );

    expect(banners.map((banner) => banner.id)).toEqual([
      'banner-1',
      'banner-2',
      'banner-3',
      'banner-4',
    ]);
  });
});
