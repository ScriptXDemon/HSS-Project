'use client';

interface GlobalRouteLoaderProps {
  label?: string;
}

export default function GlobalRouteLoader({
  label = 'Loading page',
}: GlobalRouteLoaderProps) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[90] h-1 overflow-hidden bg-brown-dark/10">
        <div className="route-loader-bar h-full w-1/3 bg-gradient-to-r from-saffron via-gold-temple to-saffron" />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[89] flex items-center justify-center">
        <div className="rounded-[1.75rem] border border-stone-temple/70 bg-white/92 px-6 py-5 shadow-2xl shadow-brown-dark/15 backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full border-4 border-stone-temple/30 border-t-saffron animate-spin" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-saffron">
                Please wait
              </p>
              <p className="mt-1 text-sm text-brown-dark/75">{label}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
