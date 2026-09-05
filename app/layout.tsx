import './globals.css';
import type { Metadata } from 'next';
import GlobalAIAssistant from '@/components/global-ai-assistant';

export const metadata: Metadata = { title: 'INTERVIEW — AI Learning & Interview Training', description: 'Student preparation platform for learning, coding, aptitude and interviews.' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<GlobalAIAssistant /></body></html>;
}
