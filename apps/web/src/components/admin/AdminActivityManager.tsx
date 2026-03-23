'use client';

import Image from 'next/image';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { GalleryAlbumDTO } from '@hss/domain';
import { useRouter } from 'next/navigation';
import AdminDrawer from '@/components/admin/AdminDrawer';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useRouteTransition } from '@/components/providers/RouteTransitionProvider';
import { formatDisplayDate } from '@/lib/format';
import { pickLanguage } from '@/lib/i18n';

interface ActivityRow extends GalleryAlbumDTO {
  itemCount: number;
}

interface AdminActivityManagerProps {
  activities: ActivityRow[];
}

type DrawerState =
  | { mode: 'create' }
  | { mode: 'edit'; activity: ActivityRow }
  | null;

const copy = {
  en: {
    title: 'Activity albums',
    description: 'Manage public activity albums in a compact table and open a focused editor only when needed.',
    newActivity: 'New activity',
    hint: 'Click a row to open the activity editor.',
    tableTitle: 'Saved activity albums',
    preview: 'Preview',
    album: 'Activity',
    count: 'Media count',
    created: 'Created',
    frontend: 'Frontend',
    noData: 'No activity albums found.',
    createTitle: 'Create activity album',
    editTitle: 'Edit activity album',
    titleLabel: 'Activity title',
    descriptionLabel: 'Activity description',
    coverLabel: 'Cover image',
    imagesLabel: 'Add activity images',
    titlePlaceholder: 'Hanuman Jayanti Seva Camp',
    descriptionPlaceholder: 'Short summary of the service work or organisational activity captured in this album.',
    requiredHint: 'Select one or more images',
    optional: 'Optional',
    create: 'Create activity',
    update: 'Save changes',
    remove: 'Remove',
    view: 'View',
    successCreate: 'Activity created successfully.',
    successUpdate: 'Activity updated successfully.',
    successRemove: 'Activity removed successfully.',
    error: 'Unable to update the activity.',
  },
  hi: {
    title: 'गतिविधि एल्बम',
    description: 'सार्वजनिक गतिविधि एल्बम को कॉम्पैक्ट तालिका में प्रबंधित करें और जरूरत पड़ने पर ही संपादक खोलें।',
    newActivity: 'नई गतिविधि',
    hint: 'संपादन खोलने के लिए किसी पंक्ति पर क्लिक करें।',
    tableTitle: 'सहेजे गए गतिविधि एल्बम',
    preview: 'पूर्वावलोकन',
    album: 'गतिविधि',
    count: 'मीडिया संख्या',
    created: 'बनाया गया',
    frontend: 'फ्रंटएंड',
    noData: 'कोई गतिविधि एल्बम नहीं मिला।',
    createTitle: 'गतिविधि एल्बम बनाएं',
    editTitle: 'गतिविधि एल्बम संपादित करें',
    titleLabel: 'गतिविधि शीर्षक',
    descriptionLabel: 'गतिविधि विवरण',
    coverLabel: 'कवर छवि',
    imagesLabel: 'गतिविधि छवियाँ जोड़ें',
    titlePlaceholder: 'हनुमान जयंती सेवा शिविर',
    descriptionPlaceholder: 'इस एल्बम में शामिल सेवा कार्य या संगठनात्मक गतिविधि का संक्षिप्त सार लिखें।',
    requiredHint: 'एक या अधिक छवियाँ चुनें',
    optional: 'वैकल्पिक',
    create: 'गतिविधि बनाएं',
    update: 'परिवर्तन सहेजें',
    remove: 'हटाएँ',
    view: 'देखें',
    successCreate: 'गतिविधि सफलतापूर्वक बनाई गई।',
    successUpdate: 'गतिविधि सफलतापूर्वक अपडेट हुई।',
    successRemove: 'गतिविधि सफलतापूर्वक हटाई गई।',
    error: 'गतिविधि अपडेट नहीं हो सकी।',
  },
  mr: {
    title: 'उपक्रम अल्बम',
    description: 'सार्वजनिक उपक्रम अल्बम संक्षिप्त तक्त्यात व्यवस्थापित करा आणि गरज असेल तेव्हाच संपादक उघडा.',
    newActivity: 'नवा उपक्रम',
    hint: 'संपादन उघडण्यासाठी कोणत्याही रांगेवर क्लिक करा.',
    tableTitle: 'जतन केलेले उपक्रम अल्बम',
    preview: 'पूर्वदृश्य',
    album: 'उपक्रम',
    count: 'मीडिया संख्या',
    created: 'तयार केले',
    frontend: 'फ्रंटएंड',
    noData: 'एकही उपक्रम अल्बम सापडला नाही.',
    createTitle: 'उपक्रम अल्बम तयार करा',
    editTitle: 'उपक्रम अल्बम संपादित करा',
    titleLabel: 'उपक्रम शीर्षक',
    descriptionLabel: 'उपक्रम वर्णन',
    coverLabel: 'कव्हर प्रतिमा',
    imagesLabel: 'उपक्रम प्रतिमा जोडा',
    titlePlaceholder: 'हनुमान जयंती सेवा शिबिर',
    descriptionPlaceholder: 'या अल्बममध्ये समाविष्ट सेवा कार्य किंवा संघटनात्मक उपक्रमाचा छोटा सारांश लिहा.',
    requiredHint: 'एक किंवा अधिक प्रतिमा निवडा',
    optional: 'ऐच्छिक',
    create: 'उपक्रम तयार करा',
    update: 'बदल जतन करा',
    remove: 'काढा',
    view: 'पहा',
    successCreate: 'उपक्रम यशस्वीरित्या तयार झाला.',
    successUpdate: 'उपक्रम यशस्वीरित्या अद्यतनित झाला.',
    successRemove: 'उपक्रम यशस्वीरित्या काढला गेला.',
    error: 'उपक्रम अद्यतनित करता आला नाही.',
  },
} as const;

function ActivityFormFields({
  activity,
  text,
}: {
  activity?: ActivityRow;
  text: (typeof copy)['en'];
}) {
  const mediaUploadHint = 'Select one or more images or videos';

  return (
    <div className="space-y-5">
      {activity?.coverImage ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-temple/70 bg-white">
          <div className="relative aspect-[16/8] bg-stone-temple/20">
            <Image
              src={activity.coverImage}
              alt={activity.title}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="field-label">{text.titleLabel}</label>
        <input
          name="title"
          required
          defaultValue={activity?.title || ''}
          className="input-field"
          placeholder={text.titlePlaceholder}
        />
      </div>

      <div>
        <label className="field-label">
          {text.coverLabel} <span className="text-brown-dark/50">({text.optional})</span>
        </label>
        <input
          name="coverImage"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>

      <div>
        <label className="field-label">{text.descriptionLabel}</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={activity?.description || ''}
          className="input-field min-h-[160px]"
          placeholder={text.descriptionPlaceholder}
        />
      </div>

      <div>
        <label className="field-label">
          {text.imagesLabel} <span className="text-brown-dark/50">({mediaUploadHint})</span>
        </label>
        <input
          name="images"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>

      <div>
        <label className="field-label">
          Add activity videos <span className="text-brown-dark/50">({mediaUploadHint})</span>
        </label>
        <input
          name="videos"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          multiple
          className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </div>
    </div>
  );
}

export default function AdminActivityManager({ activities }: AdminActivityManagerProps) {
  const router = useRouter();
  const { startLoading } = useRouteTransition();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy) as (typeof copy)['en'], [language]);
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function submitTo(url: string, method: 'POST' | 'PUT', formData: FormData) {
    const response = await fetch(url, { method, body: formData });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(result?.error || text.error);
    }

    return result;
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey('create');

    try {
      const result = await submitTo('/api/admin/activity', 'POST', new FormData(event.currentTarget));
      startLoading();
      setDrawerState(null);
      setFeedback(result?.message || text.successCreate);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : text.error);
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleUpdate(submitEvent: FormEvent<HTMLFormElement>, activityId: string) {
    submitEvent.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey(`update-${activityId}`);

    try {
      const result = await submitTo(`/api/admin/activity/${activityId}`, 'PUT', new FormData(submitEvent.currentTarget));
      startLoading();
      setDrawerState(null);
      setFeedback(result?.message || text.successUpdate);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : text.error);
    } finally {
      setLoadingKey(null);
    }
  }

  async function handleDelete(activityId: string) {
    if (!window.confirm(`${text.remove}?`)) {
      return;
    }

    setFeedback(null);
    setError(null);
    setLoadingKey(`delete-${activityId}`);

    try {
      const response = await fetch(`/api/admin/activity/${activityId}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || text.error);
      }

      startLoading();
      setDrawerState(null);
      setFeedback(result?.message || text.successRemove);
      router.refresh();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : text.error);
    } finally {
      setLoadingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="section-title">{text.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brown-dark/70">{text.description}</p>
          </div>

          <button type="button" onClick={() => setDrawerState({ mode: 'create' })} className="btn-primary">
            {text.newActivity}
          </button>
        </div>

        {feedback ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p> : null}
        {error ? <p className="mt-5 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-brown-dark">{text.tableTitle}</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-brown-dark/55">{text.hint}</p>
          </div>

          {activities.length ? (
            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-stone-temple/70 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-temple/60 bg-stone-temple/20 text-left text-brown-dark/70">
                      <th className="px-4 py-3">{text.preview}</th>
                      <th className="px-4 py-3">{text.album}</th>
                      <th className="px-4 py-3">{text.count}</th>
                      <th className="px-4 py-3">{text.created}</th>
                      <th className="px-4 py-3">{text.frontend}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr
                        key={activity.id}
                        className="cursor-pointer border-b border-stone-temple/40 align-top transition hover:bg-saffron/5"
                        onClick={() => setDrawerState({ mode: 'edit', activity })}
                      >
                        <td className="px-4 py-4">
                          <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-stone-temple/50 bg-stone-temple/20">
                            {activity.coverImage ? (
                              <Image
                                src={activity.coverImage}
                                alt={activity.title}
                                fill
                                sizes="140px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs font-semibold text-brown-dark/50">
                                {text.preview}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-brown-dark">
                          <p className="font-semibold">{activity.title}</p>
                          <p className="mt-1 max-w-xl text-sm text-brown-dark/65">{activity.description || '-'}</p>
                        </td>
                        <td className="px-4 py-4 text-brown-dark/70">{activity.itemCount}</td>
                        <td className="px-4 py-4 text-brown-dark/70">{formatDisplayDate(activity.createdAt)}</td>
                        <td className="px-4 py-4 text-brown-dark/70">
                          <Link
                            href={`/activity/${activity.id}`}
                            target="_blank"
                            onClick={(clickEvent) => clickEvent.stopPropagation()}
                            className="text-sm font-semibold text-saffron"
                          >
                            {text.view}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-brown-dark/70">{text.noData}</p>
          )}
        </div>
      </section>

      <AdminDrawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? text.editTitle : text.createTitle}
        description={text.description}
      >
        {drawerState?.mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-6">
            <ActivityFormFields text={text} />
            <button type="submit" disabled={loadingKey === 'create'} className="btn-primary disabled:opacity-60">
              {loadingKey === 'create' ? '...' : text.create}
            </button>
          </form>
        ) : null}

        {drawerState?.mode === 'edit' ? (
          <form
            key={drawerState.activity.id}
            onSubmit={(event) => handleUpdate(event, drawerState.activity.id)}
            className="space-y-6"
          >
            <ActivityFormFields activity={drawerState.activity} text={text} />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loadingKey === `update-${drawerState.activity.id}`}
                className="btn-primary disabled:opacity-60"
              >
                {loadingKey === `update-${drawerState.activity.id}` ? '...' : text.update}
              </button>
              <button
                type="button"
                disabled={loadingKey === `delete-${drawerState.activity.id}`}
                onClick={() => handleDelete(drawerState.activity.id)}
                className="rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loadingKey === `delete-${drawerState.activity.id}` ? '...' : text.remove}
              </button>
            </div>
          </form>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
