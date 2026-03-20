'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
  AboutPageLanguageContentDTO,
  LocalizedAboutContentDTO,
  OrganizationPersonDTO,
} from '@hss/domain';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface AdminAboutUsManagerProps {
  about: LocalizedAboutContentDTO;
  people: OrganizationPersonDTO[];
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
    description: 'Edit the multilingual About Us copy and manage the shared people roster used on both About Us and the homepage.',
    contentTitle: 'About Us copy',
    peopleTitle: 'Shared people roster',
    saveCopy: 'Save About Us content',
    addPerson: 'Add person',
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
  },
  hi: {
    title: 'हमारे बारे में सामग्री और लोग',
    description: 'बहुभाषी About Us सामग्री संपादित करें और वही साझा लोगों की सूची प्रबंधित करें जो About पेज और होम पेज दोनों पर दिखती है।',
    contentTitle: 'About Us सामग्री',
    peopleTitle: 'साझा लोगों की सूची',
    saveCopy: 'About Us सामग्री सहेजें',
    addPerson: 'नया व्यक्ति जोड़ें',
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
  },
  mr: {
    title: 'आमच्याविषयी मजकूर आणि प्रमुख व्यक्ती',
    description: 'बहुभाषिक About Us मजकूर संपादित करा आणि About व होम पेजवर वापरली जाणारी समान व्यक्ती सूची व्यवस्थापित करा.',
    contentTitle: 'About Us मजकूर',
    peopleTitle: 'सामायिक व्यक्ती सूची',
    saveCopy: 'About Us मजकूर जतन करा',
    addPerson: 'नवी व्यक्ती जोडा',
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

export default function AdminAboutUsManager({ about, people }: AdminAboutUsManagerProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [draft, setDraft] = useState<DraftState>(() => createInitialDraft(about));
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

    setFeedback(result?.message || text.successCopy);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleCreatePerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey('create-person');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch('/api/admin/about/people', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    form.reset();
    setFeedback(result?.message || text.successPerson);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleUpdatePerson(event: FormEvent<HTMLFormElement>, personId: string) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey(`person-${personId}`);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/about/people/${personId}`, {
      method: 'PUT',
      body: formData,
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    setFeedback(result?.message || text.successPerson);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleDeletePerson(personId: string) {
    if (!window.confirm(text.removePerson + '?')) {
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

    setFeedback(result?.message || text.successPerson);
    setLoadingKey(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel px-6 py-6">
        <h2 className="section-title">{text.title}</h2>
        <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

        {feedback ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p> : null}
        {error ? <p className="mt-5 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}

        <div className="mt-8 space-y-8">
          <section>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-brown-dark">{text.contentTitle}</h3>
              <button type="button" onClick={handleSaveContent} disabled={loadingKey === 'content'} className="btn-primary disabled:opacity-60">
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
            <h3 className="text-xl font-semibold text-brown-dark">{text.peopleTitle}</h3>
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <form onSubmit={handleCreatePerson} className="rounded-3xl border border-stone-temple bg-stone-temple/25 p-5">
                <h4 className="text-lg font-semibold text-brown-dark">{text.addPerson}</h4>
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="field-label">{text.name}</label>
                    <input name="name" required className="input-field" />
                  </div>
                  <div>
                    <label className="field-label">{text.role}</label>
                    <input name="role" required className="input-field" />
                  </div>
                  <div>
                    <label className="field-label">{text.bio}</label>
                    <textarea name="bio" rows={4} className="input-field min-h-[120px]" />
                  </div>
                  <div>
                    <label className="field-label">{text.photo}</label>
                    <input name="photo" type="file" accept="image/*" className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label">{text.aboutOrder}</label>
                      <input name="aboutOrder" type="number" min="1" defaultValue={people.length + 1} className="input-field" />
                    </div>
                    <div>
                      <label className="field-label">{text.homeOrder}</label>
                      <input name="homeOrder" type="number" min="1" defaultValue={people.length + 1} className="input-field" />
                    </div>
                  </div>
                  <label className="flex items-center gap-3 rounded-xl border border-stone-temple bg-white px-4 py-3 text-sm text-brown-dark">
                    <input type="checkbox" name="showOnAbout" value="true" defaultChecked className="h-4 w-4" />
                    {text.showOnAbout}
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-stone-temple bg-white px-4 py-3 text-sm text-brown-dark">
                    <input type="checkbox" name="showOnHome" value="true" defaultChecked className="h-4 w-4" />
                    {text.showOnHome}
                  </label>
                  <button type="submit" disabled={loadingKey === 'create-person'} className="btn-primary disabled:opacity-60">
                    {loadingKey === 'create-person' ? '...' : text.addPerson}
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {people.map((person) => (
                  <form key={person.id} onSubmit={(event) => handleUpdatePerson(event, person.id)} className="rounded-3xl border border-stone-temple bg-white p-5 shadow-sm">
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="field-label">{text.name}</label>
                          <input name="name" defaultValue={person.name} required className="input-field" />
                        </div>
                        <div>
                          <label className="field-label">{text.role}</label>
                          <input name="role" defaultValue={person.role} required className="input-field" />
                        </div>
                      </div>
                      <div>
                        <label className="field-label">{text.bio}</label>
                        <textarea name="bio" defaultValue={person.bio || ''} rows={4} className="input-field min-h-[120px]" />
                      </div>
                      <div>
                        <label className="field-label">{text.photo}</label>
                        <input name="photo" type="file" accept="image/*" className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="field-label">{text.aboutOrder}</label>
                          <input name="aboutOrder" type="number" min="1" defaultValue={person.aboutOrder} className="input-field" />
                        </div>
                        <div>
                          <label className="field-label">{text.homeOrder}</label>
                          <input name="homeOrder" type="number" min="1" defaultValue={person.homeOrder} className="input-field" />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="flex items-center gap-3 rounded-xl border border-stone-temple bg-stone-temple/25 px-4 py-3 text-sm text-brown-dark">
                          <input type="checkbox" name="showOnAbout" value="true" defaultChecked={person.showOnAbout} className="h-4 w-4" />
                          {text.showOnAbout}
                        </label>
                        <label className="flex items-center gap-3 rounded-xl border border-stone-temple bg-stone-temple/25 px-4 py-3 text-sm text-brown-dark">
                          <input type="checkbox" name="showOnHome" value="true" defaultChecked={person.showOnHome} className="h-4 w-4" />
                          {text.showOnHome}
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button type="submit" disabled={loadingKey === `person-${person.id}`} className="btn-primary disabled:opacity-60">
                          {loadingKey === `person-${person.id}` ? '...' : text.savePerson}
                        </button>
                        <button type="button" disabled={loadingKey === `delete-${person.id}`} onClick={() => handleDeletePerson(person.id)} className="rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                          {loadingKey === `delete-${person.id}` ? '...' : text.removePerson}
                        </button>
                      </div>
                    </div>
                  </form>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
