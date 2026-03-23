'use client';

import Image from 'next/image';
import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BannerDTO } from '@hss/domain';
import AdminDrawer from '@/components/admin/AdminDrawer';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { useRouteTransition } from '@/components/providers/RouteTransitionProvider';
import { pickLanguage } from '@/lib/i18n';

interface AdminBannerManagerProps {
  banners: BannerDTO[];
}

type DrawerState =
  | { mode: 'create' }
  | { mode: 'edit'; banner: BannerDTO }
  | null;

const copy = {
  en: {
    title: 'Homepage banners',
    description: 'Manage the rotating OTT hero banners shown at the top of the homepage.',
    newBanner: 'New banner',
    currentTitle: 'Uploaded banners',
    preview: 'Preview',
    titleLabel: 'Title',
    subtitleLabel: 'Subtitle',
    ctaLabelLabel: 'CTA label',
    ctaHrefLabel: 'CTA link',
    sortOrderLabel: 'Sort order',
    imageLabel: 'Banner image',
    rowTitle: 'Banner',
    rowOrder: 'Order',
    rowLink: 'Link',
    rowStatus: 'Status',
    active: 'Active',
    editBanner: 'Edit banner',
    createBanner: 'Create banner',
    full: 'Three active banners already exist. Remove one before adding another.',
    empty: 'No banners found yet.',
    clickHint: 'Click a row to open its editor.',
    create: 'Create banner',
    update: 'Save changes',
    remove: 'Remove',
    close: 'Close',
    successCreate: 'Banner created successfully.',
    successUpdate: 'Banner updated successfully.',
    successRemove: 'Banner removed successfully.',
    error: 'Unable to update banners.',
    optional: 'Optional',
  },
  hi: {
    title: 'होमपेज बैनर',
    description: 'होमपेज के शीर्ष OTT हीरो में दिखने वाले बैनरों को यहाँ व्यवस्थित करें।',
    newBanner: 'नया बैनर',
    currentTitle: 'अपलोड किए गए बैनर',
    preview: 'पूर्वावलोकन',
    titleLabel: 'शीर्षक',
    subtitleLabel: 'उपशीर्षक',
    ctaLabelLabel: 'बटन टेक्स्ट',
    ctaHrefLabel: 'बटन लिंक',
    sortOrderLabel: 'क्रम',
    imageLabel: 'बैनर छवि',
    rowTitle: 'बैनर',
    rowOrder: 'क्रम',
    rowLink: 'लिंक',
    rowStatus: 'स्थिति',
    active: 'सक्रिय',
    editBanner: 'बैनर संपादित करें',
    createBanner: 'बैनर बनाएं',
    full: '3 सक्रिय बैनर पहले से मौजूद हैं। नया जोड़ने से पहले एक हटाएँ।',
    empty: 'अभी कोई बैनर उपलब्ध नहीं है।',
    clickHint: 'संपादन खोलने के लिए किसी पंक्ति पर क्लिक करें।',
    create: 'बैनर बनाएं',
    update: 'परिवर्तन सहेजें',
    remove: 'हटाएँ',
    close: 'बंद करें',
    successCreate: 'बैनर सफलतापूर्वक बनाया गया।',
    successUpdate: 'बैनर सफलतापूर्वक अपडेट हुआ।',
    successRemove: 'बैनर सफलतापूर्वक हटाया गया।',
    error: 'बैनर अपडेट नहीं हो सके।',
    optional: 'वैकल्पिक',
  },
  mr: {
    title: 'मुख्यपृष्ठ बॅनर',
    description: 'मुख्यपृष्ठाच्या OTT हीरोमध्ये दिसणारे बॅनर येथे व्यवस्थापित करा.',
    newBanner: 'नवा बॅनर',
    currentTitle: 'अपलोड केलेले बॅनर',
    preview: 'पूर्वदृश्य',
    titleLabel: 'शीर्षक',
    subtitleLabel: 'उपशीर्षक',
    ctaLabelLabel: 'बटण मजकूर',
    ctaHrefLabel: 'बटण दुवा',
    sortOrderLabel: 'क्रम',
    imageLabel: 'बॅनर प्रतिमा',
    rowTitle: 'बॅनर',
    rowOrder: 'क्रम',
    rowLink: 'दुवा',
    rowStatus: 'स्थिती',
    active: 'सक्रिय',
    editBanner: 'बॅनर संपादित करा',
    createBanner: 'बॅनर तयार करा',
    full: '3 सक्रिय बॅनर आधीच आहेत. नवीन जोडण्यापूर्वी एक काढा.',
    empty: 'अद्याप कोणतेही बॅनर उपलब्ध नाहीत.',
    clickHint: 'संपादन उघडण्यासाठी कोणत्याही रांगेवर क्लिक करा.',
    create: 'बॅनर तयार करा',
    update: 'बदल जतन करा',
    remove: 'काढा',
    close: 'बंद करा',
    successCreate: 'बॅनर यशस्वीरित्या तयार झाला.',
    successUpdate: 'बॅनर यशस्वीरित्या अद्यतनित झाला.',
    successRemove: 'बॅनर यशस्वीरित्या काढला गेला.',
    error: 'बॅनर अद्यतनित करता आले नाहीत.',
    optional: 'ऐच्छिक',
  },
} as const;

function BannerFormFields({
  banner,
  text,
}: {
  banner?: BannerDTO;
  text: (typeof copy)['en'];
}) {
  return (
    <div className="space-y-5">
      {banner?.imageUrl ? (
        <div className="overflow-hidden rounded-[1.5rem] border border-stone-temple/70 bg-white">
          <div className="relative aspect-[16/8] bg-stone-temple/20">
            <Image
              src={banner.imageUrl}
              alt={banner.title || 'Banner preview'}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      <div>
        <label className="field-label">{text.titleLabel}</label>
        <input name="title" defaultValue={banner?.title || ''} className="input-field" />
      </div>

      <div>
        <label className="field-label">{text.subtitleLabel}</label>
        <textarea
          name="subtitle"
          defaultValue={banner?.subtitle || ''}
          rows={4}
          className="input-field min-h-[140px]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">
            {text.ctaLabelLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <input name="ctaLabel" defaultValue={banner?.ctaLabel || ''} className="input-field" />
        </div>

        <div>
          <label className="field-label">
            {text.ctaHrefLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <input
            name="ctaHref"
            defaultValue={banner?.ctaHref || ''}
            className="input-field"
            placeholder="/donate"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="field-label">{text.sortOrderLabel}</label>
          <input
            name="sortOrder"
            type="number"
            min="1"
            max="3"
            defaultValue={banner?.sortOrder || 1}
            className="input-field"
          />
        </div>

        <div>
          <label className="field-label">
            {text.imageLabel} <span className="text-brown-dark/50">({text.optional})</span>
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="input-field file:mr-3 file:rounded-full file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </div>
      </div>
    </div>
  );
}

export default function AdminBannerManager({ banners }: AdminBannerManagerProps) {
  const router = useRouter();
  const { startLoading } = useRouteTransition();
  const { language } = useLanguage();
  const text = useMemo(() => pickLanguage(language, copy) as (typeof copy)['en'], [language]);
  const [drawerState, setDrawerState] = useState<DrawerState>(null);
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

    startLoading();
    setDrawerState(null);
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

    startLoading();
    setDrawerState(null);
    setFeedback(result?.message || text.successUpdate);
    setLoadingKey(null);
    router.refresh();
  }

  async function handleDelete(bannerId: string) {
    if (!window.confirm(`${text.remove}?`)) {
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

    startLoading();
    setDrawerState(null);
    setFeedback(result?.message || text.successRemove);
    setLoadingKey(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <section className="surface-panel px-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="section-title">{text.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-brown-dark/70">{text.description}</p>
          </div>

          <button
            type="button"
            disabled={banners.length >= 3}
            onClick={() => setDrawerState({ mode: 'create' })}
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {text.newBanner}
          </button>
        </div>

        {banners.length >= 3 ? <p className="mt-4 text-sm text-sacred-red">{text.full}</p> : null}
        {feedback ? <p className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">{feedback}</p> : null}
        {error ? <p className="mt-5 rounded-xl bg-sacred-red/10 px-4 py-3 text-sm text-sacred-red">{error}</p> : null}

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-brown-dark">{text.currentTitle}</h3>
            <p className="text-xs uppercase tracking-[0.18em] text-brown-dark/55">{text.clickHint}</p>
          </div>

          {banners.length ? (
            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-stone-temple/70 bg-white">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-temple/60 bg-stone-temple/20 text-left text-brown-dark/70">
                      <th className="px-4 py-3">{text.preview}</th>
                      <th className="px-4 py-3">{text.rowTitle}</th>
                      <th className="px-4 py-3">{text.rowOrder}</th>
                      <th className="px-4 py-3">{text.rowLink}</th>
                      <th className="px-4 py-3">{text.rowStatus}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {banners.map((banner) => (
                      <tr
                        key={banner.id}
                        className="cursor-pointer border-b border-stone-temple/40 transition hover:bg-saffron/5"
                        onClick={() => setDrawerState({ mode: 'edit', banner })}
                      >
                        <td className="px-4 py-4">
                          <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-stone-temple/50 bg-stone-temple/25">
                            <Image
                              src={banner.imageUrl}
                              alt={banner.title || 'Banner preview'}
                              fill
                              sizes="140px"
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4 text-brown-dark">
                          <p className="font-semibold">{banner.title || 'Untitled banner'}</p>
                          <p className="mt-1 line-clamp-2 max-w-xl text-sm text-brown-dark/65">
                            {banner.subtitle || 'Hero image only'}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-brown-dark/70">{banner.sortOrder}</td>
                        <td className="px-4 py-4 text-brown-dark/70">{banner.ctaHref || '-'}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                            {text.active}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-brown-dark/70">{text.empty}</p>
          )}
        </div>
      </section>

      <AdminDrawer
        open={Boolean(drawerState)}
        onClose={() => setDrawerState(null)}
        title={drawerState?.mode === 'edit' ? text.editBanner : text.createBanner}
        description={text.description}
      >
        {drawerState?.mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-6">
            <BannerFormFields text={text} />
            <button
              type="submit"
              disabled={loadingKey === 'create' || banners.length >= 3}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingKey === 'create' ? '...' : text.create}
            </button>
          </form>
        ) : null}

        {drawerState?.mode === 'edit' ? (
          <form
            key={drawerState.banner.id}
            onSubmit={(event) => handleUpdate(event, drawerState.banner.id)}
            className="space-y-6"
          >
            <BannerFormFields banner={drawerState.banner} text={text} />

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={loadingKey === `update-${drawerState.banner.id}`}
                className="btn-primary disabled:opacity-60"
              >
                {loadingKey === `update-${drawerState.banner.id}` ? '...' : text.update}
              </button>
              <button
                type="button"
                disabled={loadingKey === `delete-${drawerState.banner.id}`}
                onClick={() => handleDelete(drawerState.banner.id)}
                className="rounded-full bg-sacred-red px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loadingKey === `delete-${drawerState.banner.id}` ? '...' : text.remove}
              </button>
            </div>
          </form>
        ) : null}
      </AdminDrawer>
    </div>
  );
}
