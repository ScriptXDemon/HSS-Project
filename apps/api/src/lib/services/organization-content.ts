import type {
  AdminOrganizationPersonDTO,
  AboutPageLanguageContentDTO,
  BannerDTO,
  LocalizedAboutContentDTO,
  LocalizedOrganizationPersonContentDTO,
  OrganizationPersonDTO,
  OrganizationPersonLanguageContentDTO,
} from '@hss/domain';
import type { Language } from '@/lib/i18n';

export const HOME_BANNERS_KEY = 'home_banners';
export const ABOUT_PAGE_COPY_KEY = 'about_page_copy';
export const ORGANIZATION_ROSTER_KEY = 'organization_roster';

function normalizeOptionalString(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

function createLocalizedPersonContent(
  en: OrganizationPersonLanguageContentDTO,
  hi?: OrganizationPersonLanguageContentDTO,
  mr?: OrganizationPersonLanguageContentDTO
): LocalizedOrganizationPersonContentDTO {
  return {
    en,
    ...(hi ? { hi } : {}),
    ...(mr ? { mr } : {}),
  };
}

export function resolveLocalizedOrganizationPersonContent(
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

export function resolveOrganizationPerson(
  person: AdminOrganizationPersonDTO,
  language: Language
): OrganizationPersonDTO {
  const content = resolveLocalizedOrganizationPersonContent(person.content, language);

  return {
    id: person.id,
    name: content.name,
    role: content.role,
    bio: content.bio,
    photoUrl: person.photoUrl,
    photoKey: person.photoKey,
    showOnAbout: person.showOnAbout,
    showOnHome: person.showOnHome,
    aboutOrder: person.aboutOrder,
    homeOrder: person.homeOrder,
  };
}

function getSortablePersonName(person: AdminOrganizationPersonDTO) {
  return resolveLocalizedOrganizationPersonContent(person.content, 'en').name;
}

function sortPeople(people: AdminOrganizationPersonDTO[]) {
  return people
    .slice()
    .sort((left, right) => {
      if (left.aboutOrder !== right.aboutOrder) {
        return left.aboutOrder - right.aboutOrder;
      }

      return getSortablePersonName(left).localeCompare(getSortablePersonName(right));
    });
}

export function getDefaultBanners(): BannerDTO[] {
  return [
    {
      id: 'seed-banner-1',
      imageUrl: '/banners/HSSSBanner1.jpeg',
      title: 'हिंदू सुरक्षा सेवा संघ',
      subtitle: 'धर्म, सेवा और संगठन के लिए समर्पित जनआंदोलन',
      ctaLabel: 'हमसे जुड़ें',
      ctaHref: '/member-apply',
      sortOrder: 1,
    },
    {
      id: 'seed-banner-2',
      imageUrl: '/banners/HSSSBanner2.jpeg',
      title: 'सनातन हिंदू एकता और समाज सेवा',
      subtitle: 'राष्ट्र, धर्म और समाज के लिए जागरण, संगठन और सेवा का अभियान',
      ctaLabel: 'कार्यक्रम देखें',
      ctaHref: '/events',
      sortOrder: 2,
    },
    {
      id: 'seed-banner-3',
      imageUrl: '/banners/HSSSBanner3.jpeg',
      title: 'सेवा, संस्कार और समाज सुरक्षा',
      subtitle: 'युवा, संत और समाज को जोड़कर संगठित हिंदू समाज का निर्माण',
      ctaLabel: 'दान करें',
      ctaHref: '/donate',
      sortOrder: 3,
    },
  ];
}

export function getDefaultRoster(): AdminOrganizationPersonDTO[] {
  return [
    {
      id: 'seed-person-1',
      content: createLocalizedPersonContent(
        {
          name: 'Mahant Raju Das Maharaj',
          role: 'National President',
          bio: 'Leads the Sangh’s ideological direction, nationwide expansion, and public-awareness campaigns.',
        },
        {
          name: 'महंत राजू दास महाराज',
          role: 'राष्ट्रीय अध्यक्ष',
          bio: 'संघ की वैचारिक दिशा, राष्ट्रव्यापी विस्तार और समाज जागरण अभियानों का नेतृत्व करते हैं।',
        },
        {
          name: 'महंत राजू दास महाराज',
          role: 'राष्ट्रीय अध्यक्ष',
          bio: 'संघाच्या वैचारिक दिशेला, देशव्यापी विस्ताराला आणि समाजजागृती मोहिमांना नेतृत्व देतात.',
        }
      ),
      showOnAbout: true,
      showOnHome: true,
      aboutOrder: 1,
      homeOrder: 1,
    },
    {
      id: 'seed-person-2',
      content: createLocalizedPersonContent(
        {
          name: 'Sunil Maharaj',
          role: 'State In-Charge',
          bio: 'Handles state-level organisation building, seva programmes, and regional coordination.',
        },
        {
          name: 'सुनील महाराज',
          role: 'प्रदेश प्रभारी',
          bio: 'प्रदेश स्तर पर संगठन, सेवा कार्यक्रम और क्षेत्रीय समन्वय की जिम्मेदारी संभालते हैं।',
        },
        {
          name: 'सुनील महाराज',
          role: 'प्रदेश प्रभारी',
          bio: 'राज्यस्तरीय संघटन, सेवा कार्यक्रम आणि प्रादेशिक समन्वयाची जबाबदारी सांभाळतात.',
        }
      ),
      showOnAbout: true,
      showOnHome: true,
      aboutOrder: 2,
      homeOrder: 2,
    },
    {
      id: 'seed-person-3',
      content: createLocalizedPersonContent(
        {
          name: 'Seva Coordinator',
          role: 'Social Service Cell',
          bio: 'Coordinates bhandara, relief work, religious events, and local service activities.',
        },
        {
          name: 'सेवा संयोजक',
          role: 'समाज सेवा प्रकोष्ठ',
          bio: 'भंडारा, राहत कार्य, धार्मिक आयोजन और स्थानीय सेवा गतिविधियों का संचालन करते हैं।',
        },
        {
          name: 'सेवा संयोजक',
          role: 'समाजसेवा प्रकोष्ठ',
          bio: 'भंडारा, मदतकार्य, धार्मिक आयोजन आणि स्थानिक सेवा उपक्रमांचे समन्वयन करतात.',
        }
      ),
      showOnAbout: true,
      showOnHome: true,
      aboutOrder: 3,
      homeOrder: 3,
    },
    {
      id: 'seed-person-4',
      content: createLocalizedPersonContent(
        {
          name: 'Youth Wing Lead',
          role: 'Youth Organisation',
          bio: 'Runs training programmes and campaigns that connect youth with dharma, nation, and service.',
        },
        {
          name: 'युवा प्रकोष्ठ प्रमुख',
          role: 'युवा संगठन',
          bio: 'युवाओं को राष्ट्र, धर्म और समाज सेवा से जोड़ने वाले प्रशिक्षण और अभियानों को संभालते हैं।',
        },
        {
          name: 'युवा प्रकोष्ठ प्रमुख',
          role: 'युवा संघटन',
          bio: 'युवकांना राष्ट्र, धर्म आणि समाजसेवेशी जोडणारे प्रशिक्षण व अभियानांचे नेतृत्व करतात.',
        }
      ),
      showOnAbout: true,
      showOnHome: true,
      aboutOrder: 4,
      homeOrder: 4,
    },
  ];
}

export function getDefaultAboutContent(): LocalizedAboutContentDTO {
  return {
    en: {
      eyebrow: 'About Us',
      title: 'A social and nationalist organisation dedicated to Hindu unity, service, and protection',
      description:
        'Hindu Shuraksha Seva Sangh works to strengthen Hindu society through organisation, seva, cultural protection, and social awareness.',
      intro:
        'Hindu Shuraksha Seva Sangh is a social and nationalist organisation whose primary purpose is to protect the unity, security, culture, and dharma of Hindu society.',
      motto: 'Dharmo Rakshati Rakshitah',
      mainWorkTitle: 'Core Work',
      mainWorkPoints: [
        'Organise Hindu society and strengthen mutual unity.',
        'Protect dharma, culture, and traditions.',
        'Work to remove discrimination, caste hierarchy, and divisive regionalism from society.',
        'Organise social service initiatives such as helping the poor, religious programmes, katha, bhandara, and community support drives.',
        'Raise a voice against injustice and anti-dharmic activities in society.',
        'Inspire youth toward dharma, nation, and service.',
        'Work to oppose love jihad, land jihad, drug jihad, infiltration jihad, conversion jihad, and population jihad.',
      ],
      futureObjectivesTitle: 'Future Objectives',
      futureObjectivesPoints: [
        'Strengthen and expand the organisation across the country.',
        'Play an active role in protecting the rights and dignity of Hindu society.',
        'Organise youth and increase both social service and national service work.',
        'Build a stronger society through education, service, and values.',
      ],
      whyJoinTitle: 'Why Stay Connected',
      whyJoinPoints: [
        'Because the Sangh offers a direct path to serve dharma, society, and nation.',
        'It increases unity, security, and awareness in society.',
        'Only an organised society can protect its rights and culture.',
      ],
      conclusionTitle: 'Conclusion',
      conclusion:
        'The purpose of Hindu Shuraksha Seva Sangh is not merely to form an organisation, but to build an aware, united, and empowered Hindu society. Staying connected to the Sangh is important for meaningful service to society and dharma.',
      leadershipEyebrow: 'People of the Sangh',
      leadershipTitle: 'Leadership and field organisers',
      leadershipDescription:
        'This shared roster powers both the About Us page and the featured people section on the homepage.',
    },
    hi: {
      eyebrow: 'हमारे बारे में',
      title: 'हिंदू समाज की एकता, सुरक्षा, संस्कृति और धर्म रक्षा के लिए समर्पित सामाजिक और राष्ट्रवादी संगठन',
      description:
        'हिंदू सुरक्षा सेवा संघ सेवा, संगठन, संस्कृति संरक्षण और सामाजिक जागरूकता के माध्यम से हिंदू समाज को सशक्त बनाने का कार्य करता है।',
      intro:
        'हिंदू सुरक्षा सेवा संघ एक सामाजिक और राष्ट्रवादी संगठन है, जिसका मुख्य उद्देश्य हिंदू समाज की एकता, सुरक्षा, संस्कृति और धर्म की रक्षा करना है।',
      motto: 'धर्मो रक्षति रक्षिता:',
      mainWorkTitle: 'मुख्य कार्य',
      mainWorkPoints: [
        'हिंदू समाज को संगठित करना और आपसी एकता बढ़ाना।',
        'धर्म, संस्कृति और परंपराओं की रक्षा करना।',
        'समाज में भेद भाव उच्च,नीच जातिवाद, प्रांत वाद को जड़ से खत्म करना।',
        'सामाजिक सेवा कार्य जैसे – गरीबों की मदद, धार्मिक कार्यक्रम, कथा, भंडारा आदि का आयोजन।',
        'समाज में होने वाले अन्याय और धर्म विरोधी गतिविधियों के खिलाफ आवाज उठाना।',
        'युवाओं को धर्म, राष्ट्र और समाज सेवा के लिए प्रेरित करना।',
        'लव जिहाद, लैंड जिहाद, ड्रग जिहाद, घुसपैठ जिहाद, धर्मांतरण जिहाद और जनसंख्या जिहाद को खत्म करना।',
      ],
      futureObjectivesTitle: 'भविष्य में उद्देश्य',
      futureObjectivesPoints: [
        'पूरे देश में संगठन को मजबूत और विस्तारित करना।',
        'हिंदू समाज के अधिकारों और सम्मान की रक्षा के लिए सक्रिय भूमिका निभाना।',
        'युवाओं को संगठित कर समाज सेवा और राष्ट्र सेवा के कार्य बढ़ाना।',
        'शिक्षा, सेवा और संस्कार के माध्यम से मजबूत समाज बनाना।',
      ],
      whyJoinTitle: 'हमें क्यों जुड़े रहना चाहिए',
      whyJoinPoints: [
        'क्योंकि यह संगठन धर्म, समाज और राष्ट्र सेवा का अवसर देता है।',
        'इससे समाज में एकता, सुरक्षा और जागरूकता बढ़ती है।',
        'संगठित समाज ही अपने अधिकारों और संस्कृति की रक्षा कर सकता है।',
      ],
      conclusionTitle: 'निष्कर्ष',
      conclusion:
        'हिंदू सुरक्षा सेवा संघ का उद्देश्य केवल संगठन बनाना नहीं, बल्कि हिंदू समाज को जागरूक, संगठित और सशक्त बनाना है। इसलिए समाज और धर्म की सेवा के लिए इससे जुड़े रहना महत्वपूर्ण है।',
      leadershipEyebrow: 'संघ के प्रमुख लोग',
      leadershipTitle: 'नेतृत्व और प्रमुख कार्यकर्ता',
      leadershipDescription:
        'इन प्रोफाइलों को होम पेज और हमारे बारे में पृष्ठ पर प्रमुख रूप से दिखाया जा सकता है और एडमिन पैनल से अपडेट किया जा सकता है।',
    },
    mr: {
      eyebrow: 'आमच्याविषयी',
      title: 'हिंदू समाजाच्या एकता, सुरक्षा, संस्कृती आणि धर्मरक्षणासाठी कार्य करणारी सामाजिक व राष्ट्रवादी संघटना',
      description:
        'हिंदू सुरक्षा सेवा संघ सेवा, संघटन, संस्कृती संरक्षण आणि सामाजिक जागृतीच्या माध्यमातून हिंदू समाजाला सक्षम बनवण्याचे कार्य करतो.',
      intro:
        'हिंदू सुरक्षा सेवा संघ ही एक सामाजिक आणि राष्ट्रवादी संघटना आहे. हिंदू समाजाची एकता, सुरक्षा, संस्कृती आणि धर्म यांचे रक्षण करणे हा तिचा मुख्य उद्देश आहे.',
      motto: 'धर्मो रक्षति रक्षितः',
      mainWorkTitle: 'मुख्य कार्य',
      mainWorkPoints: [
        'हिंदू समाजाचे संघटन करणे आणि परस्पर एकात्मता वाढवणे.',
        'धर्म, संस्कृती आणि परंपरांचे संरक्षण करणे.',
        'समाजातील भेदभाव, उच्च-नीच, जातीयवाद आणि प्रांतीयवाद नष्ट करण्यासाठी काम करणे.',
        'गरीबांना मदत, धार्मिक कार्यक्रम, कथा, भंडारा आणि समाजोपयोगी उपक्रम आयोजित करणे.',
        'समाजातील अन्याय आणि धर्मविरोधी कारवायांविरोधात आवाज उठवणे.',
        'युवकांना धर्म, राष्ट्र आणि समाजसेवेसाठी प्रेरित करणे.',
        'लव्ह जिहाद, लँड जिहाद, ड्रग जिहाद, घुसखोरी जिहाद, धर्मांतरण जिहाद आणि लोकसंख्या जिहादाविरोधात जनजागृती करणे.',
      ],
      futureObjectivesTitle: 'भविष्यातील उद्दिष्टे',
      futureObjectivesPoints: [
        'देशभर संघटना अधिक मजबूत आणि विस्तारित करणे.',
        'हिंदू समाजाच्या अधिकार आणि सन्मानाच्या रक्षणासाठी सक्रिय भूमिका बजावणे.',
        'युवकांना संघटित करून समाजसेवा आणि राष्ट्रसेवा उपक्रम वाढवणे.',
        'शिक्षण, सेवा आणि संस्कारांच्या माध्यमातून सक्षम समाज उभारणे.',
      ],
      whyJoinTitle: 'आपण का जोडलेले राहावे',
      whyJoinPoints: [
        'कारण ही संघटना धर्म, समाज आणि राष्ट्रसेवेची संधी देते.',
        'यामुळे समाजात एकता, सुरक्षा आणि जागरूकता वाढते.',
        'संघटित समाजच आपले हक्क, संस्कृती आणि परंपरा जपू शकतो.',
      ],
      conclusionTitle: 'निष्कर्ष',
      conclusion:
        'हिंदू सुरक्षा सेवा संघाचे ध्येय केवळ संघटना उभारणे नाही, तर हिंदू समाजाला जागृत, संघटित आणि सक्षम बनवणे आहे. त्यामुळे समाज आणि धर्मसेवेसाठी या संघटनेशी जोडलेले राहणे महत्त्वाचे आहे.',
      leadershipEyebrow: 'संघातील प्रमुख व्यक्ती',
      leadershipTitle: 'नेतृत्व आणि प्रमुख कार्यकर्ते',
      leadershipDescription:
        'ही प्रोफाइल्स होम पेज आणि आमच्याविषयी पृष्ठावर दाखवली जातात आणि अॅडमिन पॅनलमधून अद्ययावत करता येतात.',
    },
  };
}

function isAboutLanguageContent(value: unknown): value is AboutPageLanguageContentDTO {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    typeof record.eyebrow === 'string' &&
    typeof record.title === 'string' &&
    typeof record.description === 'string' &&
    typeof record.intro === 'string' &&
    typeof record.motto === 'string' &&
    typeof record.mainWorkTitle === 'string' &&
    Array.isArray(record.mainWorkPoints) &&
    typeof record.futureObjectivesTitle === 'string' &&
    Array.isArray(record.futureObjectivesPoints) &&
    typeof record.whyJoinTitle === 'string' &&
    Array.isArray(record.whyJoinPoints) &&
    typeof record.conclusionTitle === 'string' &&
    typeof record.conclusion === 'string' &&
    typeof record.leadershipEyebrow === 'string' &&
    typeof record.leadershipTitle === 'string' &&
    typeof record.leadershipDescription === 'string'
  );
}

export function parseAboutContent(body?: string | null): LocalizedAboutContentDTO {
  const fallback = getDefaultAboutContent();

  if (!body) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(body) as Partial<LocalizedAboutContentDTO>;

    if (
      isAboutLanguageContent(parsed.en) &&
      isAboutLanguageContent(parsed.hi) &&
      isAboutLanguageContent(parsed.mr)
    ) {
      return {
        en: parsed.en,
        hi: parsed.hi,
        mr: parsed.mr,
      };
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function parseBanners(body?: string | null): BannerDTO[] {
  const fallback = getDefaultBanners();

  if (!body) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(body);

    if (!Array.isArray(parsed)) {
      return fallback;
    }

    const banners = parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = item as Record<string, unknown>;
        return {
          id: String(record.id || '').trim(),
          imageUrl: String(record.imageUrl || '').trim(),
          imageKey: typeof record.imageKey === 'string' ? record.imageKey : undefined,
          title: typeof record.title === 'string' ? record.title : undefined,
          subtitle: typeof record.subtitle === 'string' ? record.subtitle : undefined,
          ctaLabel: typeof record.ctaLabel === 'string' ? record.ctaLabel : undefined,
          ctaHref: typeof record.ctaHref === 'string' ? record.ctaHref : undefined,
          sortOrder: Number(record.sortOrder || 0),
        } satisfies BannerDTO;
      })
      .filter((banner) => banner.id && banner.imageUrl)
      .sort((left, right) => left.sortOrder - right.sortOrder);

    return banners.length ? banners : fallback;
  } catch {
    return fallback;
  }
}

function parseRequiredPersonLanguageContent(
  value: unknown
): OrganizationPersonLanguageContentDTO | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const record = value as Record<string, unknown>;
  const name = typeof record.name === 'string' ? record.name.trim() : '';
  const role = typeof record.role === 'string' ? record.role.trim() : '';

  if (!name || !role) {
    return null;
  }

  return {
    name,
    role,
    bio: normalizeOptionalString(record.bio),
  };
}

function parseOptionalPersonLanguageContent(
  value: unknown
): Partial<OrganizationPersonLanguageContentDTO> | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const record = value as Record<string, unknown>;
  const nextValue: Partial<OrganizationPersonLanguageContentDTO> = {};

  if (typeof record.name === 'string' && record.name.trim()) {
    nextValue.name = record.name.trim();
  }

  if (typeof record.role === 'string' && record.role.trim()) {
    nextValue.role = record.role.trim();
  }

  if (typeof record.bio === 'string' && record.bio.trim()) {
    nextValue.bio = record.bio.trim();
  }

  return Object.keys(nextValue).length ? nextValue : undefined;
}

function parsePersonContent(
  record: Record<string, unknown>
): LocalizedOrganizationPersonContentDTO | null {
  if (record.content && typeof record.content === 'object') {
    const contentRecord = record.content as Record<string, unknown>;
    const english = parseRequiredPersonLanguageContent(contentRecord.en);

    if (english) {
      return {
        en: english,
        hi: parseOptionalPersonLanguageContent(contentRecord.hi),
        mr: parseOptionalPersonLanguageContent(contentRecord.mr),
      };
    }
  }

  const legacyName = typeof record.name === 'string' ? record.name.trim() : '';
  const legacyRole = typeof record.role === 'string' ? record.role.trim() : '';

  if (!legacyName || !legacyRole) {
    return null;
  }

  return {
    en: {
      name: legacyName,
      role: legacyRole,
      bio: normalizeOptionalString(record.bio),
    },
  };
}

export function parseRoster(body?: string | null): AdminOrganizationPersonDTO[] {
  const fallback = getDefaultRoster();

  if (!body) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(body);

    if (!Array.isArray(parsed)) {
      return fallback;
    }

    const people = parsed
      .filter((item) => item && typeof item === 'object')
      .map((item) => {
        const record = item as Record<string, unknown>;
        const content = parsePersonContent(record);

        return {
          id: String(record.id || '').trim(),
          content,
          photoUrl: typeof record.photoUrl === 'string' ? record.photoUrl : undefined,
          photoKey: typeof record.photoKey === 'string' ? record.photoKey : undefined,
          showOnAbout: record.showOnAbout !== false,
          showOnHome: record.showOnHome !== false,
          aboutOrder: Number(record.aboutOrder || 0),
          homeOrder: Number(record.homeOrder || 0),
        };
      })
      .filter((person) => person.id && person.content)
      .map(
        (person) =>
          ({
            id: person.id,
            content: person.content!,
            photoUrl: person.photoUrl,
            photoKey: person.photoKey,
            showOnAbout: person.showOnAbout,
            showOnHome: person.showOnHome,
            aboutOrder: person.aboutOrder,
            homeOrder: person.homeOrder,
          }) satisfies AdminOrganizationPersonDTO
      );

    return people.length ? sortPeople(people) : fallback;
  } catch {
    return fallback;
  }
}

export function getResolvedAboutContent(
  localizedContent: LocalizedAboutContentDTO,
  language: Language
): AboutPageLanguageContentDTO {
  if (language === 'mr') {
    return localizedContent.mr;
  }

  if (language === 'hi') {
    return localizedContent.hi;
  }

  return localizedContent.en;
}

export function getFeaturedPeople(
  people: AdminOrganizationPersonDTO[],
  language: Language
) {
  return people
    .filter((person) => person.showOnHome)
    .slice()
    .sort((left, right) => left.homeOrder - right.homeOrder)
    .slice(0, 4)
    .map((person) => resolveOrganizationPerson(person, language));
}

export function getAboutPeople(people: AdminOrganizationPersonDTO[], language: Language) {
  return sortPeople(people.filter((person) => person.showOnAbout)).map((person) =>
    resolveOrganizationPerson(person, language)
  );
}
