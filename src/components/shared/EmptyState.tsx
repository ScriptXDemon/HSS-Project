interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="surface-panel px-6 py-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-saffron/10 text-saffron">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            d="M12 8v4m0 4h.01M4.93 19h14.14A2 2 0 0 0 20.79 16L13.72 4a2 2 0 0 0-3.44 0L3.21 16A2 2 0 0 0 4.93 19Z"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="mt-4 text-xl font-semibold text-brown-dark">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-brown-dark/70">{description}</p>
    </div>
  );
}
