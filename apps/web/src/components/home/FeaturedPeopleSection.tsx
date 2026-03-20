import Image from 'next/image';
import type { OrganizationPersonDTO } from '@hss/domain';

interface FeaturedPeopleSectionProps {
  eyebrow: string;
  title: string;
  people: OrganizationPersonDTO[];
}

export default function FeaturedPeopleSection({
  eyebrow,
  title,
  people,
}: FeaturedPeopleSectionProps) {
  if (!people.length) {
    return null;
  }

  return (
    <section className="section-padding bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <span className="eyebrow">{eyebrow}</span>
          <h2 className="section-title mt-4">{title}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {people.map((person) => (
            <article
              key={person.id}
              className="overflow-hidden rounded-[1.75rem] border border-stone-temple bg-gradient-to-b from-white to-stone-temple/30 shadow-lg shadow-saffron/5"
            >
              <div className="relative aspect-[4/4.4] bg-gradient-to-br from-saffron/15 via-gold-temple/10 to-white">
                {person.photoUrl ? (
                  <Image
                    src={person.photoUrl}
                    alt={person.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-4xl font-heading text-saffron shadow-lg">
                      {person.name.charAt(0)}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-5">
                <h3 className="text-xl font-semibold text-brown-dark">{person.name}</h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-saffron">
                  {person.role}
                </p>
                {person.bio ? (
                  <p className="mt-4 text-sm leading-7 text-brown-dark/70">{person.bio}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
