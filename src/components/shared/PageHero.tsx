interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description: string;
  align?: 'left' | 'center';
}

export default function PageHero({
  eyebrow,
  title,
  description,
  align = 'left',
}: PageHeroProps) {
  const alignmentClass = align === 'center' ? 'text-center mx-auto' : '';

  return (
    <section className="page-shell">
      <div className="page-content pb-10">
        <div className="surface-panel relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-saffron/15 via-gold-temple/10 to-transparent lg:block" />
          <div className={`relative max-w-3xl ${alignmentClass}`}>
            {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
            <h1 className="mt-4 font-heading text-4xl leading-tight text-brown-dark sm:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-base leading-7 text-brown-dark/75 sm:text-lg">{description}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
