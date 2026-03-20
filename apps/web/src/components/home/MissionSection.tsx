import type { AboutPageLanguageContentDTO } from '@hss/domain';

interface MissionSectionProps {
  content: AboutPageLanguageContentDTO;
}

export default function MissionSection({ content }: MissionSectionProps) {
  const missionPoints = content.mainWorkPoints.slice(0, 4);

  return (
    <section className="section-padding bg-cream">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <span className="eyebrow">{content.mainWorkTitle}</span>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-brown-dark sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-5 text-base leading-8 text-brown-dark/75">{content.intro}</p>
            <div className="mt-6 inline-flex rounded-full border border-saffron/20 bg-white px-5 py-2 text-sm font-semibold text-saffron shadow-sm">
              {content.motto}
            </div>
            <p className="mt-6 max-w-3xl text-sm leading-7 text-brown-dark/70">{content.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {missionPoints.map((item, index) => (
              <article
                key={`${item}-${index}`}
                className="rounded-[1.5rem] border border-stone-temple bg-white/90 p-5 shadow-lg shadow-saffron/5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
                  {String(index + 1).padStart(2, '0')}
                </p>
                <p className="mt-4 text-sm leading-7 text-brown-dark/75">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
