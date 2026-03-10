'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Create event',
    description: 'New published events appear on the public events page immediately.',
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
    choose: 'Choose file',
    noCover: 'No image selected',
    noVideo: 'No video selected',
    submit: 'Create Event',
    submitting: 'Creating...',
    success: 'Event created successfully.',
    error: 'Unable to create event.',
  },
  hi: {
    title: 'Create event',
    description: 'New published events appear on the public events page immediately.',
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
    choose: 'Choose file',
    noCover: 'No image selected',
    noVideo: 'No video selected',
    submit: 'Create Event',
    submitting: 'Creating...',
    success: 'Event created successfully.',
    error: 'Unable to create event.',
  },
} as const;

export default function AdminEventForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [isPending, startTransition] = useTransition();
  const [isPublished, setIsPublished] = useState(true);
  const [coverName, setCoverName] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set('isPublished', String(isPublished));

    startTransition(async () => {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error || text.error);
        return;
      }

      form.reset();
      setIsPublished(true);
      setCoverName(null);
      setVideoName(null);
      setMessage(result?.message || text.success);
      router.refresh();
    });
  }

  return (
    <section className="surface-panel px-6 py-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="section-title">{text.title}</h2>
          <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="event-title" className="field-label">
            {text.titleLabel}
          </label>
          <input
            id="event-title"
            name="title"
            required
            className="input-field"
            placeholder={text.titlePlaceholder}
          />
        </div>

        <div>
          <label htmlFor="event-date" className="field-label">
            {text.dateLabel}
          </label>
          <input id="event-date" name="date" type="datetime-local" required className="input-field" />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="event-description" className="field-label">
            {text.descriptionLabel}
          </label>
          <textarea
            id="event-description"
            name="description"
            required
            rows={6}
            className="input-field min-h-[160px]"
            placeholder={text.descriptionPlaceholder}
          />
        </div>

        <div>
          <label htmlFor="event-venue" className="field-label">
            {text.venueLabel}
          </label>
          <input
            id="event-venue"
            name="venue"
            className="input-field"
            placeholder={text.venuePlaceholder}
          />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-stone-temple bg-stone-temple/40 px-4 py-3 text-sm text-brown-dark lg:self-end">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(currentEvent) => setIsPublished(currentEvent.target.checked)}
            className="h-4 w-4 rounded border-stone-temple text-saffron focus:ring-saffron"
          />
          {text.publishLabel}
        </label>

        <div>
          <label htmlFor="event-cover" className="field-label">
            {text.coverLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <label className="flex min-h-[58px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-saffron/40 bg-saffron/5 px-4 py-3 text-sm text-brown-dark">
            <span>{coverName || text.noCover}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">
              {text.choose}
            </span>
            <input
              id="event-cover"
              name="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(currentEvent) => setCoverName(currentEvent.target.files?.[0]?.name || null)}
            />
          </label>
        </div>

        <div>
          <label htmlFor="event-video" className="field-label">
            {text.videoLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <label className="flex min-h-[58px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-saffron/40 bg-saffron/5 px-4 py-3 text-sm text-brown-dark">
            <span>{videoName || text.noVideo}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">
              {text.choose}
            </span>
            <input
              id="event-video"
              name="video"
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(currentEvent) => setVideoName(currentEvent.target.files?.[0]?.name || null)}
            />
          </label>
        </div>

        {error ? <p className="rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red lg:col-span-2">{error}</p> : null}
        {message ? <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 lg:col-span-2">{message}</p> : null}

        <div className="lg:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? text.submitting : text.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
