import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.scss';
import Providers from './providers';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatWidget from '@/components/ui/ChatWidget';

export const metadata: Metadata = {
  title: {
    default: 'Aardra — Premium Shopping',
    template: '%s | Aardra',
  },
  description: 'Discover premium fashion, electronics, and home décor at Aardra. Shop the latest trends with fast delivery and easy returns.',
  keywords: ['e-commerce', 'shopping', 'fashion', 'electronics', 'home decor'],
  openGraph: {
    type: 'website',
    siteName: 'Aardra',
    title: 'Aardra — Premium Shopping',
    description: 'Discover premium fashion, electronics, and home décor.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: '72px' }}>
            {children}
          </main>
          <Footer />
          <ChatWidget />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#1a1a2e',
                color: '#fff',
                borderRadius: '10px',
                padding: '12px 16px',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: { primary: '#e94560', secondary: '#fff' },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
