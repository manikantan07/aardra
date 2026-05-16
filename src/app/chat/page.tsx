import type { Metadata } from 'next';
import ChatBot from './ChatBot';

export const metadata: Metadata = { title: 'AI Assistant | Aardra' };

export default function ChatPage() {
  return <ChatBot />;
}
