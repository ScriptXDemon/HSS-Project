import './globals.css';

export const metadata = {
  title: 'HSS API',
  description: 'Backend API service for Hindu Suraksha Sangh',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
