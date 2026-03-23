'use client';

import Image from 'next/image';
import type { EventDTO } from '@hss/domain';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminDrawer from '@/components/admin/AdminDrawer';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useRouteTransition } from '@/components/providers/RouteTransitionProvider';
import { formatDisplayDateTime } from '@/lib/format';
import { getIntlLocale, getStatusLabel, pickLanguage } from '@/lib/i18n';

interface AdminEventsManagerProps {
  events: EventDTO[];
}

type DrawerState =
  | { mode: 'create' }
  | { mode: 'edit'; event: EventDTO }
  | null;

const copy = {
  en: {
    title: 'Event catalogue',
    description: 'Manage published and draft event records from one workspace.',
    newEvent: 'New event',
    hint: 'Click a row to open the event editor.',
    tableTitle: 'Saved events',
    preview: 'Preview',
    event: 'Event',
    date: 'Date',
    venue: 'Venue',
    published: 'Published',
    frontend: 'Frontend',
    video: 'Video',
    noData: 'No events found.',
    createTitle: 'Create event',
    editTitle: 'Edit event',
    titleLabel: 'Title',
    descriptionLabel: 'Description',
    dateLabel: 'Date and time',
    venueLabel: 'Location',
    coverLabel: 'Cover image',
    videoLabel: 'Event video',
    publishLabel: 'Publish on the public website immediately',
    titlePlaceholder: 'Ram Navami Shobha Yatra',
    descriptionPlaceholder: 'Enter full programme details, timing, and instructions for attendees.',
    venuePlaceholder: 'Main Temple Ground, Lucknow',
    optional: 'Optional',
    create: 'Create event',
    update: 'Save changes',
    remove: 'Remove',
    view: 'View',
    uploaded: 'Uploaded',
    draft: 'Draft',
    successCreate: 'Event created successfully.',
    successUpdate: 'Event updated successfully.',
    successRemove: 'Event removed successfully.',
    error: 'Unable to update the event.',
  },
  hi: {
    title: 'कार्यक्रम सूची',
    description: 'प्रकाशित और ड्राफ्ट कार्यक्रम रिकॉर्ड को एक ही कार्यक्षेत्र से प्रबंधित करें।',
    newEvent: 'नया कार्यक्रम',
    hint: 'संपादन खोलने के लिए किसी पंक्ति पर क्लिक करें।',
    tableTitle: 'सहेजे गए कार्यक्रम',
    preview: 'पूर्वावलोकन',
    event: 'कार्यक्रम',
    date: 'तारीख',
    venue: 'स्थान',
    published: 'प्रकाशित',
    frontend: 'फ्रंटएंड',
    video: 'वीडियो',
    noData: 'कोई कार्यक्रम नहीं मिला।',
    createTitle: 'कार्यक्रम बनाएं',
    editTitle: 'कार्यक्रम संपादित करें',
    titleLabel: 'शीर्षक',
    descriptionLabel: 'विवरण',
    dateLabel: 'तारीख और समय',
    venueLabel: 'स्थान',
    coverLabel: 'कवर छवि',
    videoLabel: 'कार्यक्रम वीडियो',
    publishLabel: 'इसे तुरंत सार्वजनिक वेबसाइट पर प्रकाशित करें',
    titlePlaceholder: 'राम नवमी शोभा यात्रा',
    descriptionPlaceholder: 'पूरा कार्यक्रम विवरण, समय और प्रतिभागियों के लिए निर्देश लिखें।',
    venuePlaceholder: 'मुख्य मंदिर मैदान, लखनऊ',
    optional: 'वैकल्पिक',
    create: 'कार्यक्रम बनाएं',
    update: 'परिवर्तन सहेजें',
    remove: 'हटाएँ',
    view: 'देखें',
    uploaded: 'अपलोड किया गया',
    draft: 'ड्राफ्ट',
    successCreate: 'कार्यक्रम सफलतापूर्वक बनाया गया।',
    successUpdate: 'कार्यक्रम सफलतापूर्वक अपडेट हुआ।',
    successRemove: 'कार्यक्रम सफलतापूर्वक हटाया गया।',
    error: 'कार्यक्रम अपडेट नहीं हो सका।',
  },
  mr: {
    title: 'कार्यक्रम सूची',
    description: 'प्रकाशित आणि मसुदा कार्यक्रम नोंदी एका कार्यक्षेत्रातून व्यवस्थापित करा.',
    newEvent: 'नवा कार्यक्रम',
    hint: 'संपादन उघडण्यासाठी कोणत्याही रांगेवर क्लिक करा.',
    tableTitle: 'जतन केलेले कार्यक्रम',
    preview: 'पूर्वदृश्य',
    event: 'कार्यक्रम',
    date: 'तारीख',
    venue: 'स्थान',
    published: 'प्रकाशित',
    frontend: 'फ्रंटएंड',
    video: 'व्हिडिओ',
    noData: 'एकही कार्यक्रम सापडला नाही.',
    createTitle: 'कार्यक्रम तयार करा',
    editTitle: 'कार्यक्रम संपादित करा',
    titleLabel: 'शीर्षक',
    descriptionLabel: 'वर्णन',
    dateLabel: 'तारीख आणि वेळ',
    venueLabel: 'स्थान',
    coverLabel: 'कव्हर प्रतिमा',
    videoLabel: 'कार्यक्रम व्हिडिओ',
    publishLabel: 'हे लगेच सार्वजनिक वेबसाइटवर प्रकाशित करा',
    titlePlaceholder: 'राम नवमी शोभायात्रा',
    descriptionPlaceholder: 'पूर्ण कार्यक्रम तपशील, वेळ आणि उपस्थितांसाठी सूचना लिहा.',
    venuePlaceholder: 'मुख्य मंदिर मैदान, लखनौ',
    optional: 'ऐच्छिक',
    create: 'कार्यक्रम तयार करा',
    update: 'बदल जतन करा',
    remove: 'काढा',
    view: 'पहा',
    uploaded: 'अपलोड केलेला',
    draft: 'मसुदा',
    successCreate: 'कार्यक्रम यशस्वीरित्या तयार झाला.',
    successUpdate: 'कार्यक्रम यशस्वीरित्या अद्यतनित झाला.',
    successRemove: 'कार्यक्रम यशस्वीरित्या काढला गेला.',
    error: 'कार्यक्रम अद्यतनित करता आला नाही.',
  },
} as const;

function toDateTimeLocalValue(date: string | Date) {
  const parsed = new Date(date);
  const adjusted = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

function EventFormFields({
  event,
  text,
}: {
  event?: EventDTO;
  text: (typeof copy)['en'];
}) {
  return (
    <div className="space-y-5">
      {event?.coverImage ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-temple/70 bg-white">
          <div className="relative aspect-[16/8] bg-stone-temple/20">
            <Image
              src={event.coverImage}
              alt={event.title}
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
          defaultValue={event?.title || ''}
          className="input-field"
          placeholder={text.titlePlaceholder}
        />
      </div>

      <div>
        <label className="field-label">{text.dateLabel}</label>
        <input
          name="date"
          type="datetime-local"
          required
          defaultValue={event ? toDateTimeLocalValue(event.date) : ''}
          className="input-field"
        />
      </div>

      <div>
        <label className="field-label">{text.descriptionLabel}</label>
        <textarea
          name="description"
          required
          rows={6}
          defaultValue={event?.description || ''}
          className="input-field min-h-[180px]"
          placeholder={text.descriptionPlaceholder}
        />
      </div>

      <div>
        <label className="field-label">
          {text.venueLabel} <span className="text-brown-dark/50">({text.optional})</span>
        </label>
        <input
          name="venue"
          defaultValue={event?.venue || ''}
          className="input-field"
          placeholder={text.venuePlaceholder}
        />
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-stone-temple bg-stone-temple/25 px-4 py-3 text-sm text-brown-dark">
        <input
          name="isPublished"
          type="checkbox"
          value="true"
          defaultChecked={event ? event.isPublished : true}
          className="h-4 w-4 rounded border-stone-temple text-saffron focus:ring-saffron"
        />
        {text.publishLabel}
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
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
          <label className="field-label">
            {text.videoLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <input
            name="video"
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>
      </div>

      {event?.videoUrl ? (
        <p className="rounded-xl bg-stone-temple/25 px-4 py-3 text-sm text-brown-dark/70">
          {text.video}: {text.uploaded}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminEventsManager({ events }: AdminEventsManagerProps) {
  const router = useRouter();
  const { startLoading } = useRouteTransition();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy) as (typeof copy)['en'], [language]);
  const locale = getIntlLocale(language);
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
      const result = await submitTo('/api/admin/events', 'POST', new FormData(event.currentTarget));
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

  async function handleUpdate(submitEvent: FormEvent<HTMLFormElement>, eventId: string) {
    submitEvent.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey(`update-${eventId}`);

    const formData = new FormData(submitEvent.currentTarget);
    if (!formData.has('isPublished')) {
      formData.set('isPublished', 'false');
    }

    try {
      const result = await submitTo(`/api/admin/events/${eventId}`, 'PUT', formData);
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

  async function handleDelete(eventId: string) {
    if (!window.confirm(`${text.remove}?`)) {
      return;
    }

    setFeedback(null);
    setError(null);
    setLoadingKey(`delete-${eventId}`);

    try {
      const response = await fetch(`/api/admin/events/${eventId}`, {
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
            {text.newEvent}
          </button>
        </div>

        {feedback ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p> : null}
        {error ? <p className="mt-5 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-brown-dark">{text.tableTitle}</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-brown-dark/55">{text.hint}</p>
          </div>

          {events.length ? (
            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-stone-temple/70 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-temple/60 bg-stone-temple/20 text-left text-brown-dark/70">
                      <th className="px-4 py-3">{text.preview}</th>
                      <th className="px-4 py-3">{text.event}</th>
                      <th className="px-4 py-3">{text.date}</th>
                      <th className="px-4 py-3">{text.venue}</th>
                      <th className="px-4 py-3">{text.published}</th>
                      <th className="px-4 py-3">{text.video}</th>
                      <th className="px-4 py-3">{text.frontend}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr
                        key={event.id}
                        className="cursor-pointer border-b border-stone-temple/40 align-top transition hover:bg-saffron/5"
                        onClick={() => setDrawerState({ mode: 'edit', event })}
                      >
                        <td className="px-4 py-4">
                          <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-stone-temple/50 bg-stone-temple/20">
                            {event.coverImage ? (
                              <Image
                                src={event.coverImage}
                                alt={event.title}
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
                          <p className="font-semibold">{event.title}</p>
                          <p className="mt-1 text-sm text-brown-dark/65">/{event.slug}</p>
                        </td>
                        <td className="px-4 py-4 text-brown-dark/70">{formatDisplayDateTime(event.date, locale)}</td>
                        <td className="px-4 py-4 text-brown-dark/70">{event.venue || '-'}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${event.isPublished ? 'bg-green-50 text-green-700' : 'bg-stone-temple/30 text-brown-dark/70'}`}>
                            {getStatusLabel(event.isPublished ? 'PUBLISHED' : 'DRAFT', language)}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-brown-dark/70">{event.videoUrl ? text.uploaded : text.draft}</td>
                        <td className="px-4 py-4 text-brown-dark/70">
                          {event.isPublished ? (
                            <Link
                              href={`/events/${event.slug}`}
                              target="_blank"
                              onClick={(clickEvent) => clickEvent.stopPropagation()}
                              className="text-sm font-semibold text-saffron"
                            >
                              {text.view}
                            </Link>
                          ) : (
                            '-'
                          )}
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
            <EventFormFields text={text} />
            <button type="submit" disabled={loadingKey === 'create'} className="btn-primary disabled:opacity-60">
              {loadingKey === 'create' ? '...' : text.create}
            </button>
          </form>
        ) : null}

        {drawerState?.mode === 'edit' ? (
          <form
            key={drawerState.event.id}
            onSubmit={(event) => handleUpdate(event, drawerState.event.id)}
            className="space-y-6"
          >
            <EventFormFields event={drawerState.event} text={text} />
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loadingKey === `update-${drawerState.event.id}`}
                className="btn-primary disabled:opacity-60"
              >
                {loadingKey === `update-${drawerState.event.id}` ? '...' : text.update}
              </button>
              <button
                type="button"
                disabled={loadingKey === `delete-${drawerState.event.id}`}
                onClick={() => handleDelete(drawerState.event.id)}
                className="rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loadingKey === `delete-${drawerState.event.id}` ? '...' : text.remove}
              </button>
            </div>
          </form>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
