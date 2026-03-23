'use client';

import Image from 'next/image';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  AboutPageLanguageContentDTO,
  AdminOrganizationPersonDTO,
  LocalizedAboutContentDTO,
  LocalizedOrganizationPersonContentDTO,
} from '@hss/domain';
import AdminDrawer from '@/components/admin/AdminDrawer';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useRouteTransition } from '@/components/providers/RouteTransitionProvider';
import { pickLanguage } from '@/lib/i18n';
import { createEmptyPersonContent, resolveLocalizedPersonContent } from '@/lib/person-content';

interface AdminAboutUsManagerProps {
  about: LocalizedAboutContentDTO;
  people: AdminOrganizationPersonDTO[];
}

type DraftLanguageContent = Omit<
  AboutPageLanguageContentDTO,
  'mainWorkPoints' | 'futureObjectivesPoints' | 'whyJoinPoints'
> & {
  mainWorkPoints: string;
  futureObjectivesPoints: string;
  whyJoinPoints: string;
};

type DraftState = Record<'en' | 'hi' | 'mr', DraftLanguageContent>;

type DrawerState =
  | { mode: 'create' }
  | { mode: 'edit'; person: AdminOrganizationPersonDTO }
  | null;

const textFieldKeys: Array<{
  key: keyof Omit<
    AboutPageLanguageContentDTO,
    'mainWorkPoints' | 'futureObjectivesPoints' | 'whyJoinPoints'
  >;
  label: string;
  multiline?: boolean;
}> = [
  { key: 'eyebrow', label: 'Eyebrow' },
  { key: 'title', label: 'Title', multiline: true },
  { key: 'description', label: 'Description', multiline: true },
  { key: 'intro', label: 'Intro', multiline: true },
  { key: 'motto', label: 'Motto' },
  { key: 'mainWorkTitle', label: 'Main Work Title' },
  { key: 'futureObjectivesTitle', label: 'Future Objectives Title' },
  { key: 'whyJoinTitle', label: 'Why Join Title' },
  { key: 'conclusionTitle', label: 'Conclusion Title' },
  { key: 'conclusion', label: 'Conclusion', multiline: true },
  { key: 'leadershipEyebrow', label: 'People Eyebrow' },
  { key: 'leadershipTitle', label: 'People Title' },
];

const pointFieldKeys: Array<{
  key: 'mainWorkPoints' | 'futureObjectivesPoints' | 'whyJoinPoints';
  label: string;
}> = [
  { key: 'mainWorkPoints', label: 'Main Work Points' },
  { key: 'futureObjectivesPoints', label: 'Future Objective Points' },
  { key: 'whyJoinPoints', label: 'Why Join Points' },
];

const languageLabels = {
  en: 'English',
  hi: 'हिन्दी',
  mr: 'मराठी',
} as const;

const copy = {
  en: {
    title: 'About Us content and people',
    description: 'Edit the multilingual About Us copy and manage the shared roster used on both About Us and the homepage.',
    contentTitle: 'About Us copy',
    peopleTitle: 'Shared people roster',
    saveCopy: 'Save About Us content',
    newPerson: 'New person',
    createPerson: 'Create person',
    editPerson: 'Edit person',
    savePerson: 'Save person',
    removePerson: 'Remove person',
    successCopy: 'About Us content updated successfully.',
    successPerson: 'Roster updated successfully.',
    error: 'Unable to update About Us settings.',
    name: 'Name',
    role: 'Role / designation',
    bio: 'Bio',
    photo: 'Photo',
    showOnHome: 'Show on home page',
    showOnAbout: 'Show on About Us page',
    aboutOrder: 'About order',
    homeOrder: 'Home order',
    rowPhoto: 'Photo',
    rowName: 'Name',
    rowRole: 'Role',
    rowVisibility: 'Visibility',
    rowOrder: 'Order',
    visibilityHome: 'Home',
    visibilityAbout: 'About',
    clickHint: 'Click a row to open the person editor.',
    empty: 'No people found yet.',
  },
  hi: {
    title: 'About Us सामग्री और लोग',
    description: 'बहुभाषी About Us सामग्री संपादित करें और वही साझा लोगों की सूची प्रबंधित करें जो About पेज और होम पेज दोनों पर दिखती है।',
    contentTitle: 'About Us सामग्री',
    peopleTitle: 'साझा लोगों की सूची',
    saveCopy: 'About Us सामग्री सहेजें',
    newPerson: 'नया व्यक्ति',
    createPerson: 'व्यक्ति बनाएं',
    editPerson: 'व्यक्ति संपादित करें',
    savePerson: 'व्यक्ति सहेजें',
    removePerson: 'हटाएँ',
    successCopy: 'About Us सामग्री सफलतापूर्वक अपडेट हुई।',
    successPerson: 'लोगों की सूची सफलतापूर्वक अपडेट हुई।',
    error: 'About Us सेटिंग अपडेट नहीं हो सकीं।',
    name: 'नाम',
    role: 'भूमिका / पद',
    bio: 'परिचय',
    photo: 'फोटो',
    showOnHome: 'होम पेज पर दिखाएँ',
    showOnAbout: 'About Us पेज पर दिखाएँ',
    aboutOrder: 'About क्रम',
    homeOrder: 'होम क्रम',
    rowPhoto: 'फोटो',
    rowName: 'नाम',
    rowRole: 'भूमिका',
    rowVisibility: 'दृश्यता',
    rowOrder: 'क्रम',
    visibilityHome: 'होम',
    visibilityAbout: 'About',
    clickHint: 'संपादन खोलने के लिए किसी पंक्ति पर क्लिक करें।',
    empty: 'अभी कोई व्यक्ति उपलब्ध नहीं है।',
  },
  mr: {
    title: 'About Us मजकूर आणि प्रमुख व्यक्ती',
    description: 'बहुभाषिक About Us मजकूर संपादित करा आणि About व होम पेजवर वापरली जाणारी समान व्यक्ती सूची व्यवस्थापित करा.',
    contentTitle: 'About Us मजकूर',
    peopleTitle: 'सामायिक व्यक्ती सूची',
    saveCopy: 'About Us मजकूर जतन करा',
    newPerson: 'नवी व्यक्ती',
    createPerson: 'व्यक्ती तयार करा',
    editPerson: 'व्यक्ती संपादित करा',
    savePerson: 'व्यक्ती जतन करा',
    removePerson: 'काढा',
    successCopy: 'About Us मजकूर यशस्वीरित्या अद्यतनित झाला.',
    successPerson: 'व्यक्ती सूची यशस्वीरित्या अद्यतनित झाली.',
    error: 'About Us सेटिंग अद्यतनित करता आली नाही.',
    name: 'नाव',
    role: 'भूमिका / पद',
    bio: 'परिचय',
    photo: 'छायाचित्र',
    showOnHome: 'होम पेजवर दाखवा',
    showOnAbout: 'About Us पेजवर दाखवा',
    aboutOrder: 'About क्रम',
    homeOrder: 'होम क्रम',
    rowPhoto: 'छायाचित्र',
    rowName: 'नाव',
    rowRole: 'भूमिका',
    rowVisibility: 'दृश्यता',
    rowOrder: 'क्रम',
    visibilityHome: 'होम',
    visibilityAbout: 'About',
    clickHint: 'संपादन उघडण्यासाठी कोणत्याही रांगेवर क्लिक करा.',
    empty: 'अद्याप कोणतीही व्यक्ती उपलब्ध नाही.',
  },
} as const;

function createDraft(content: AboutPageLanguageContentDTO): DraftLanguageContent {
  return {
    ...content,
    mainWorkPoints: content.mainWorkPoints.join('\n'),
    futureObjectivesPoints: content.futureObjectivesPoints.join('\n'),
    whyJoinPoints: content.whyJoinPoints.join('\n'),
  };
}

function normalisePoints(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createInitialDraft(about: LocalizedAboutContentDTO): DraftState {
  return {
    en: createDraft(about.en),
    hi: createDraft(about.hi),
    mr: createDraft(about.mr),
  };
}

function buildPersonFieldName(
  field: keyof LocalizedOrganizationPersonContentDTO['en'],
  language: 'en' | 'hi' | 'mr'
) {
  const suffix = language === 'en' ? 'En' : language === 'hi' ? 'Hi' : 'Mr';
  return `${field}${suffix}`;
}

function PersonLanguageFields({
  language,
  content,
  text,
}: {
  language: 'en' | 'hi' | 'mr';
  content: LocalizedOrganizationPersonContentDTO;
  text: (typeof copy)['en'];
}) {
  const values =
    language === 'en'
      ? content.en
      : language === 'hi'
        ? content.hi ?? {}
        : content.mr ?? {};

  return (
    <div className="rounded-3xl border border-stone-temple bg-white/80 p-5">
      <h4 className="text-lg font-semibold text-brown-dark">{languageLabels[language]}</h4>
      <div className="mt-5 space-y-4">
        <div>
          <label className="field-label">{text.name}</label>
          <input
            name={buildPersonFieldName('name', language)}
            defaultValue={values.name || ''}
            required={language === 'en'}
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">{text.role}</label>
          <input
            name={buildPersonFieldName('role', language)}
            defaultValue={values.role || ''}
            required={language === 'en'}
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">{text.bio}</label>
          <textarea
            name={buildPersonFieldName('bio', language)}
            defaultValue={values.bio || ''}
            rows={4}
            className="input-field min-h-[130px]"
          />
        </div>
      </div>
    </div>
  );
}

function PersonFormFields({
  person,
  peopleCount,
  text,
}: {
  person?: AdminOrganizationPersonDTO;
  peopleCount: number;
  text: (typeof copy)['en'];
}) {
  const content = person?.content ?? createEmptyPersonContent();

  return (
    <div className="space-y-6">
      {person?.photoUrl ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-temple/70 bg-white">
          <div className="relative aspect-[5/4] max-w-sm bg-stone-temple/20">
            <Image
              src={person.photoUrl}
              alt={person.content.en.name}
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        {(['en', 'hi', 'mr'] as const).map((lang) => (
          <PersonLanguageFields key={lang} language={lang} content={content} text={text} />
        ))}
      </div>

      <div>
        <label className="field-label">{text.photo}</label>
        <input
          name="photo"
          type="file"
          accept="image/*"
          className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">{text.aboutOrder}</label>
          <input
            name="aboutOrder"
            type="number"
            min="1"
            defaultValue={person?.aboutOrder ?? peopleCount + 1}
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">{text.homeOrder}</label>
          <input
            name="homeOrder"
            type="number"
            min="1"
            defaultValue={person?.homeOrder ?? peopleCount + 1}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-xl border border-stone-temple bg-white px-4 py-3 text-sm text-brown-dark">
          <input
            type="checkbox"
            name="showOnAbout"
            value="true"
            defaultChecked={person?.showOnAbout ?? true}
            className="h-4 w-4"
          />
          {text.showOnAbout}
        </label>

        <label className="flex items-center gap-3 rounded-xl border border-stone-temple bg-white px-4 py-3 text-sm text-brown-dark">
          <input
            type="checkbox"
            name="showOnHome"
            value="true"
            defaultChecked={person?.showOnHome ?? true}
            className="h-4 w-4"
          />
          {text.showOnHome}
        </label>
      </div>
    </div>
  );
}

export default function AdminAboutUsManager({ about, people }: AdminAboutUsManagerProps) {
  const router = useRouter();
  const { startLoading } = useRouteTransition();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy) as (typeof copy)['en'], [language]);
  const [draft, setDraft] = useState<DraftState>(() => createInitialDraft(about));
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  function updateDraftValue(
    lang: 'en' | 'hi' | 'mr',
    key: keyof DraftLanguageContent,
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      [lang]: {
        ...current[lang],
        [key]: value,
      },
    }));
  }

  async function handleSaveContent() {
    setFeedback(null);
    setError(null);
    setLoadingKey('content');

    const payload: LocalizedAboutContentDTO = {
      en: {
        ...draft.en,
        mainWorkPoints: normalisePoints(draft.en.mainWorkPoints),
        futureObjectivesPoints: normalisePoints(draft.en.futureObjectivesPoints),
        whyJoinPoints: normalisePoints(draft.en.whyJoinPoints),
      },
      hi: {
        ...draft.hi,
        mainWorkPoints: normalisePoints(draft.hi.mainWorkPoints),
        futureObjectivesPoints: normalisePoints(draft.hi.futureObjectivesPoints),
        whyJoinPoints: normalisePoints(draft.hi.whyJoinPoints),
      },
      mr: {
        ...draft.mr,
        mainWorkPoints: normalisePoints(draft.mr.mainWorkPoints),
        futureObjectivesPoints: normalisePoints(draft.mr.futureObjectivesPoints),
        whyJoinPoints: normalisePoints(draft.mr.whyJoinPoints),
      },
    };

    const response = await fetch('/api/admin/about', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ about: payload }),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    startLoading();
    setFeedback(result?.message || text.successCopy);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleCreatePerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey('create-person');

    const response = await fetch('/api/admin/about/people', {
      method: 'POST',
      body: new FormData(event.currentTarget),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    startLoading();
    setDrawerState(null);
    setFeedback(result?.message || text.successPerson);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleUpdatePerson(event: FormEvent<HTMLFormElement>, personId: string) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey(`person-${personId}`);

    const response = await fetch(`/api/admin/about/people/${personId}`, {
      method: 'PUT',
      body: new FormData(event.currentTarget),
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    startLoading();
    setDrawerState(null);
    setFeedback(result?.message || text.successPerson);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleDeletePerson(personId: string) {
    if (!window.confirm(`${text.removePerson}?`)) {
      return;
    }

    setFeedback(null);
    setError(null);
    setLoadingKey(`delete-${personId}`);

    const response = await fetch(`/api/admin/about/people/${personId}`, {
      method: 'DELETE',
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    startLoading();
    setDrawerState(null);
    setFeedback(result?.message || text.successPerson);
    setLoadingKey(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel px-6 py-6">
        <h2 className="section-title">{text.title}</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-brown-dark/70">{text.description}</p>

        {feedback ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p> : null}
        {error ? <p className="mt-5 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}

        <div className="mt-8 space-y-10">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-brown-dark">{text.contentTitle}</h3>
              <button
                type="button"
                onClick={handleSaveContent}
                disabled={loadingKey === 'content'}
                className="btn-primary disabled:opacity-60"
              >
                {loadingKey === 'content' ? '...' : text.saveCopy}
              </button>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              {(['en', 'hi', 'mr'] as const).map((lang) => (
                <div key={lang} className="rounded-3xl border border-stone-temple bg-stone-temple/25 p-5">
                  <h4 className="text-lg font-semibold text-brown-dark">{languageLabels[lang]}</h4>
                  <div className="mt-5 space-y-4">
                    {textFieldKeys.map((field) => (
                      <div key={`${lang}-${field.key}`}>
                        <label className="field-label">{field.label}</label>
                        {field.multiline ? (
                          <textarea
                            value={draft[lang][field.key] as string}
                            onChange={(event) => updateDraftValue(lang, field.key, event.target.value)}
                            rows={field.key === 'title' ? 3 : 4}
                            className="input-field min-h-[110px]"
                          />
                        ) : (
                          <input
                            value={draft[lang][field.key] as string}
                            onChange={(event) => updateDraftValue(lang, field.key, event.target.value)}
                            className="input-field"
                          />
                        )}
                      </div>
                    ))}

                    {pointFieldKeys.map((field) => (
                      <div key={`${lang}-${field.key}`}>
                        <label className="field-label">{field.label}</label>
                        <textarea
                          value={draft[lang][field.key]}
                          onChange={(event) => updateDraftValue(lang, field.key, event.target.value)}
                          rows={6}
                          className="input-field min-h-[160px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-brown-dark">{text.peopleTitle}</h3>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-brown-dark/55">{text.clickHint}</p>
              </div>

              <button type="button" onClick={() => setDrawerState({ mode: 'create' })} className="btn-primary">
                {text.newPerson}
              </button>
            </div>

            {people.length ? (
              <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-stone-temple/70 bg-white">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-temple/60 bg-stone-temple/20 text-left text-brown-dark/70">
                        <th className="px-4 py-3">{text.rowPhoto}</th>
                        <th className="px-4 py-3">{text.rowName}</th>
                        <th className="px-4 py-3">{text.rowRole}</th>
                        <th className="px-4 py-3">{text.rowVisibility}</th>
                        <th className="px-4 py-3">{text.rowOrder}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((person) => {
                        const resolved = resolveLocalizedPersonContent(person.content, language);

                        return (
                          <tr
                            key={person.id}
                            className="cursor-pointer border-b border-stone-temple/40 align-top transition hover:bg-saffron/5"
                            onClick={() => setDrawerState({ mode: 'edit', person })}
                          >
                            <td className="px-4 py-4">
                              <div className="relative h-14 w-14 overflow-hidden rounded-full border border-stone-temple/50 bg-stone-temple/20">
                                {person.photoUrl ? (
                                  <Image
                                    src={person.photoUrl}
                                    alt={resolved.name}
                                    fill
                                    sizes="56px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-sm font-semibold text-brown-dark/55">
                                    {resolved.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-brown-dark">
                              <p className="font-semibold">{resolved.name}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-brown-dark/45">
                                {languageLabels[language]}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-brown-dark/70">{resolved.role}</td>
                            <td className="px-4 py-4">
                              <div className="flex flex-wrap gap-2">
                                {person.showOnHome ? (
                                  <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                    {text.visibilityHome}
                                  </span>
                                ) : null}
                                {person.showOnAbout ? (
                                  <span className="inline-flex rounded-full bg-saffron/10 px-3 py-1 text-xs font-semibold text-saffron">
                                    {text.visibilityAbout}
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-4 py-4 text-brown-dark/70">
                              <p>{text.aboutOrder}: {person.aboutOrder}</p>
                              <p className="mt-1">{text.homeOrder}: {person.homeOrder}</p>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="mt-6 text-sm text-brown-dark/70">{text.empty}</p>
            )}
          </section>
        </div>
      </section>

      <AdminDrawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? text.editPerson : text.createPerson}
        description={text.description}
      >
        {drawerState?.mode === 'create' ? (
          <form onSubmit={handleCreatePerson} className="space-y-6">
            <PersonFormFields peopleCount={people.length} text={text} />
            <button
              type="submit"
              disabled={loadingKey === 'create-person'}
              className="btn-primary disabled:opacity-60"
            >
              {loadingKey === 'create-person' ? '...' : text.createPerson}
            </button>
          </form>
        ) : null}

        {drawerState?.mode === 'edit' ? (
          <form
            key={drawerState.person.id}
            onSubmit={(event) => handleUpdatePerson(event, drawerState.person.id)}
            className="space-y-6"
          >
            <PersonFormFields person={drawerState.person} peopleCount={people.length} text={text} />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loadingKey === `person-${drawerState.person.id}`}
                className="btn-primary disabled:opacity-60"
              >
                {loadingKey === `person-${drawerState.person.id}` ? '...' : text.savePerson}
              </button>
              <button
                type="button"
                disabled={loadingKey === `delete-${drawerState.person.id}`}
                onClick={() => handleDeletePerson(drawerState.person.id)}
                className="rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loadingKey === `delete-${drawerState.person.id}` ? '...' : text.removePerson}
              </button>
            </div>
          </form>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
