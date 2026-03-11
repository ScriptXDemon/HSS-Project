'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

const copy = {
  en: {
    title: 'Create gallery album',
    description: 'Albums and uploaded images become visible on the public gallery as soon as they are saved.',
    titleLabel: 'Album title',
    descriptionLabel: 'Album description',
    coverLabel: 'Cover image',
    imagesLabel: 'Gallery images',
    optional: 'Optional',
    requiredHint: 'Select one or more images',
    choose: 'Choose file',
    chooseMany: 'Choose files',
    selectedMany: '{count} files selected',
    noCover: 'No cover image selected',
    noImages: 'No gallery images selected',
    titlePlaceholder: 'Hanuman Jayanti Seva Camp',
    descriptionPlaceholder: 'Short summary of the event photos or community activity captured in this album.',
    submit: 'Create Album',
    submitting: 'Creating...',
    success: 'Gallery album created successfully.',
    error: 'Unable to create gallery album.',
  },
  hi: {
    title: 'गैलरी एल्बम बनाएं',
    description: 'एल्बम और अपलोड की गई छवियाँ सहेजते ही सार्वजनिक गैलरी में दिखाई देंगी।',
    titleLabel: 'एल्बम शीर्षक',
    descriptionLabel: 'एल्बम विवरण',
    coverLabel: 'कवर छवि',
    imagesLabel: 'गैलरी छवियाँ',
    optional: 'वैकल्पिक',
    requiredHint: 'एक या अधिक छवियाँ चुनें',
    choose: 'फ़ाइल चुनें',
    chooseMany: 'फ़ाइलें चुनें',
    selectedMany: '{count} फ़ाइलें चयनित',
    noCover: 'कोई कवर छवि चयनित नहीं है',
    noImages: 'कोई गैलरी छवि चयनित नहीं है',
    titlePlaceholder: 'हनुमान जयंती सेवा शिविर',
    descriptionPlaceholder: 'इस एल्बम में शामिल कार्यक्रम या सामुदायिक गतिविधि का संक्षिप्त सारांश लिखें।',
    submit: 'एल्बम बनाएं',
    submitting: 'बनाया जा रहा है...',
    success: 'गैलरी एल्बम सफलतापूर्वक बनाया गया।',
    error: 'गैलरी एल्बम बनाया नहीं जा सका।',
  },
  mr: {
    title: 'गॅलरी अल्बम तयार करा',
    description: 'अल्बम आणि अपलोड केलेल्या प्रतिमा सेव्ह होताच सार्वजनिक गॅलरीत दिसतील.',
    titleLabel: 'अल्बम शीर्षक',
    descriptionLabel: 'अल्बम वर्णन',
    coverLabel: 'कव्हर प्रतिमा',
    imagesLabel: 'गॅलरी प्रतिमा',
    optional: 'ऐच्छिक',
    requiredHint: 'एक किंवा अधिक प्रतिमा निवडा',
    choose: 'फाइल निवडा',
    chooseMany: 'फाइल्स निवडा',
    selectedMany: '{count} फाइल्स निवडल्या',
    noCover: 'कोणतीही कव्हर प्रतिमा निवडलेली नाही',
    noImages: 'कोणतीही गॅलरी प्रतिमा निवडलेली नाही',
    titlePlaceholder: 'हनुमान जयंती सेवा शिबिर',
    descriptionPlaceholder: 'या अल्बममध्ये समाविष्ट कार्यक्रम किंवा सामुदायिक उपक्रमाचा छोटा सारांश लिहा.',
    submit: 'अल्बम तयार करा',
    submitting: 'तयार करत आहे...',
    success: 'गॅलरी अल्बम यशस्वीपणे तयार झाला.',
    error: 'गॅलरी अल्बम तयार करता आला नाही.',
  },
} as const;

function getImageLabel(files: FileList | null, emptyLabel: string, selectedManyTemplate: string) {
  if (!files || files.length === 0) {
    return emptyLabel;
  }

  if (files.length === 1) {
    return files[0].name;
  }

  return selectedManyTemplate.replace('{count}', String(files.length));
}

export default function AdminGalleryUploadForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [isPending, startTransition] = useTransition();
  const [coverName, setCoverName] = useState<string | null>(null);
  const [imageLabel, setImageLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error || text.error);
        return;
      }

      form.reset();
      setCoverName(null);
      setImageLabel(null);
      setMessage(result?.message || text.success);
      router.refresh();
    });
  }

  return (
    <section className="surface-panel px-6 py-6">
      <h2 className="section-title">{text.title}</h2>
      <p className="mt-3 text-sm leading-7 text-brown-dark/70">{text.description}</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="gallery-title" className="field-label">
            {text.titleLabel}
          </label>
          <input
            id="gallery-title"
            name="title"
            required
            className="input-field"
            placeholder={text.titlePlaceholder}
          />
        </div>

        <div>
          <label htmlFor="gallery-cover" className="field-label">
            {text.coverLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <label className="flex min-h-[58px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-saffron/40 bg-saffron/5 px-4 py-3 text-sm text-brown-dark">
            <span>{coverName || text.noCover}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">
              {text.choose}
            </span>
            <input
              id="gallery-cover"
              name="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(currentEvent) => setCoverName(currentEvent.target.files?.[0]?.name || null)}
            />
          </label>
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="gallery-description" className="field-label">
            {text.descriptionLabel}
          </label>
          <textarea
            id="gallery-description"
            name="description"
            rows={5}
            className="input-field min-h-[140px]"
            placeholder={text.descriptionPlaceholder}
          />
        </div>

        <div className="lg:col-span-2">
          <label htmlFor="gallery-images" className="field-label">
            {text.imagesLabel} <span className="text-brown-dark/50">({text.requiredHint})</span>
          </label>
          <label className="flex min-h-[58px] cursor-pointer items-center justify-between rounded-xl border border-dashed border-saffron/40 bg-saffron/5 px-4 py-3 text-sm text-brown-dark">
            <span>{imageLabel || text.noImages}</span>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-saffron">
              {text.chooseMany}
            </span>
            <input
              id="gallery-images"
              name="images"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(currentEvent) =>
                setImageLabel(getImageLabel(currentEvent.target.files, text.noImages, text.selectedMany))
              }
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
