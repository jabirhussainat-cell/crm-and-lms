import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CRMProvider } from '@/context/CRMContext';

export const metadata: Metadata = {
  title: 'Tripeloo CRM - Phone & Staff Lead Hub',
  description: 'Beautifully designed responsive CRM for Tripeloo travel staff and admins with phone & name focused lead management, status pipeline, and staff profiles.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-blue-500 selection:text-white bg-slate-950 text-slate-100 min-h-screen">
        <AuthProvider>
          <CRMProvider>{children}</CRMProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
