import './globals.css';

export const metadata = {
  title: 'HSS API',
  description: 'Backend API service for Hindu Shuraksha Seva Sangh',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
