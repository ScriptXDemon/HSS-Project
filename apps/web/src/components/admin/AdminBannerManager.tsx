'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BannerDTO } from '@hss/domain';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { pickLanguage } from '@/lib/i18n';

interface AdminBannerManagerProps {
  banners: BannerDTO[];
}

const copy = {
  en: {
    title: 'Homepage banners',
    description: 'Manage the 3 rotating banners shown at the top of the homepage.',
    createTitle: 'Add banner',
    currentTitle: 'Current banners',
    titleLabel: 'Title',
    subtitleLabel: 'Subtitle',
    ctaLabelLabel: 'CTA label',
    ctaHrefLabel: 'CTA link',
    sortOrderLabel: 'Sort order',
    imageLabel: 'Banner image',
    create: 'Create banner',
    update: 'Save changes',
    remove: 'Remove',
    full: 'Three active banners already exist. Remove one before adding another.',
    empty: 'No banners found.',
    successCreate: 'Banner created successfully.',
    successUpdate: 'Banner updated successfully.',
    successRemove: 'Banner removed successfully.',
    error: 'Unable to update banners.',
  },
  hi: {
    title: 'होमपेज बैनर',
    description: 'होमपेज के शीर्ष पर घूमने वाले 3 बैनरों को यहाँ प्रबंधित करें।',
    createTitle: 'नया बैनर जोड़ें',
    currentTitle: 'वर्तमान बैनर',
    titleLabel: 'शीर्षक',
    subtitleLabel: 'उपशीर्षक',
    ctaLabelLabel: 'बटन टेक्स्ट',
    ctaHrefLabel: 'बटन लिंक',
    sortOrderLabel: 'क्रम',
    imageLabel: 'बैनर छवि',
    create: 'बैनर बनाएं',
    update: 'परिवर्तन सहेजें',
    remove: 'हटाएं',
    full: '3 सक्रिय बैनर पहले से मौजूद हैं। नया जोड़ने से पहले एक हटाएँ।',
    empty: 'कोई बैनर उपलब्ध नहीं है।',
    successCreate: 'बैनर सफलतापूर्वक बनाया गया।',
    successUpdate: 'बैनर सफलतापूर्वक अपडेट हुआ।',
    successRemove: 'बैनर सफलतापूर्वक हटाया गया।',
    error: 'बैनर अपडेट नहीं हो सके।',
  },
  mr: {
    title: 'मुख्यपृष्ठ बॅनर',
    description: 'मुख्यपृष्ठाच्या वर दिसणारे 3 फिरते बॅनर येथे व्यवस्थापित करा.',
    createTitle: 'नवा बॅनर जोडा',
    currentTitle: 'सध्याचे बॅनर',
    titleLabel: 'शीर्षक',
    subtitleLabel: 'उपशीर्षक',
    ctaLabelLabel: 'बटण मजकूर',
    ctaHrefLabel: 'बटण दुवा',
    sortOrderLabel: 'क्रम',
    imageLabel: 'बॅनर प्रतिमा',
    create: 'बॅनर तयार करा',
    update: 'बदल जतन करा',
    remove: 'काढा',
    full: '3 सक्रिय बॅनर आधीच आहेत. नवीन जोडण्यापूर्वी एक काढा.',
    empty: 'कोणतेही बॅनर उपलब्ध नाहीत.',
    successCreate: 'बॅनर यशस्वीरित्या तयार झाला.',
    successUpdate: 'बॅनर यशस्वीरित्या अद्यतनित झाला.',
    successRemove: 'बॅनर यशस्वीरित्या काढला गेला.',
    error: 'बॅनर अद्यतनित करता आले नाहीत.',
  },
} as const;

export default function AdminBannerManager({ banners }: AdminBannerManagerProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy), [language]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey('create');
    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch('/api/admin/banners', {
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
    setFeedback(result?.message || text.successCreate);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleUpdate(event: FormEvent<HTMLFormElement>, bannerId: string) {
    event.preventDefault();
    setFeedback(null);
    setError(null);
    setLoadingKey(`update-${bannerId}`);
    const formData = new FormData(event.currentTarget);

    const response = await fetch(`/api/admin/banners/${bannerId}`, {
      method: 'PUT',
      body: formData,
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    setFeedback(result?.message || text.successUpdate);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleDelete(bannerId: string) {
    if (!window.confirm(text.remove + '?')) {
      return;
    }

    setFeedback(null);
    setError(null);
    setLoadingKey(`delete-${bannerId}`);

    const response = await fetch(`/api/admin/banners/${bannerId}`, {
      method: 'DELETE',
    });

    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setError(result?.error || text.error);
      setLoadingKey(null);
      return;
    }

    setFeedback(result?.message || text.successRemove);
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

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={handleCreate} className="rounded-3xl border border-stone-temple bg-stone-temple/25 p-5">
            <h3 className="text-xl font-semibold text-brown-dark">{text.createTitle}</h3>
            {banners.length >= 3 ? <p className="mt-3 text-sm text-sacred-red">{text.full}</p> : null}
            <div className="mt-5 space-y-4">
              <div>
                <label className="field-label">{text.titleLabel}</label>
                <input name="title" className="input-field" />
              </div>
              <div>
                <label className="field-label">{text.subtitleLabel}</label>
                <textarea name="subtitle" rows={3} className="input-field min-h-[110px]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">{text.ctaLabelLabel}</label>
                  <input name="ctaLabel" className="input-field" />
                </div>
                <div>
                  <label className="field-label">{text.ctaHrefLabel}</label>
                  <input name="ctaHref" className="input-field" placeholder="/donate" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="field-label">{text.sortOrderLabel}</label>
                  <input name="sortOrder" type="number" min="1" max="3" defaultValue={Math.min(banners.length + 1, 3)} className="input-field" />
                </div>
                <div>
                  <label className="field-label">{text.imageLabel}</label>
                  <input name="image" type="file" accept="image/*" className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                </div>
              </div>
              <button type="submit" disabled={loadingKey === 'create' || banners.length >= 3} className="btn-primary disabled:opacity-60">
                {loadingKey === 'create' ? '...' : text.create}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-brown-dark">{text.currentTitle}</h3>
            {banners.length ? banners.map((banner) => (
              <form key={banner.id} onSubmit={(event) => handleUpdate(event, banner.id)} className="rounded-3xl border border-stone-temple bg-white p-5 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="field-label">{text.titleLabel}</label>
                    <input name="title" defaultValue={banner.title || ''} className="input-field" />
                  </div>
                  <div>
                    <label className="field-label">{text.subtitleLabel}</label>
                    <textarea name="subtitle" defaultValue={banner.subtitle || ''} rows={3} className="input-field min-h-[110px]" />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label">{text.ctaLabelLabel}</label>
                      <input name="ctaLabel" defaultValue={banner.ctaLabel || ''} className="input-field" />
                    </div>
                    <div>
                      <label className="field-label">{text.ctaHrefLabel}</label>
                      <input name="ctaHref" defaultValue={banner.ctaHref || ''} className="input-field" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="field-label">{text.sortOrderLabel}</label>
                      <input name="sortOrder" type="number" min="1" max="3" defaultValue={banner.sortOrder} className="input-field" />
                    </div>
                    <div>
                      <label className="field-label">{text.imageLabel}</label>
                      <input name="image" type="file" accept="image/*" className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={loadingKey === `update-${banner.id}`} className="btn-primary disabled:opacity-60">
                      {loadingKey === `update-${banner.id}` ? '...' : text.update}
                    </button>
                    <button type="button" disabled={loadingKey === `delete-${banner.id}`} onClick={() => handleDelete(banner.id)} className="rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                      {loadingKey === `delete-${banner.id}` ? '...' : text.remove}
                    </button>
                  </div>
                </div>
              </form>
            )) : <p className="text-sm text-brown-dark/70">{text.empty}</p>}
          </div>
        </div>
      </section>
    </div>
  );
}
