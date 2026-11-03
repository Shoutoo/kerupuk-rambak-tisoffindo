import { useEffect, useRef } from 'react';
import '@n8n/chat/style.css';
import { createChat } from '@n8n/chat';

const DEFAULT_N8N_WEBHOOK_URL =
  'https://soffinhalim.app.n8n.cloud/webhook/068f945a-d9c7-4fbf-9fca-f0b279d932f1/chat';

export function ChatWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const targetEl = containerRef.current;
    if (!targetEl) return;

    const webhookUrl =
      import.meta.env.VITE_N8N_CHAT_WEBHOOK_URL?.trim() || DEFAULT_N8N_WEBHOOK_URL;

    const chat = createChat({
      webhookUrl,
      target: targetEl,
      mode: 'window',
      showWindowCloseButton: true,
      showWelcomeScreen: false,
      loadPreviousSession: false,
      defaultLanguage: 'en',
      initialMessages: [
        'Halo! Selamat datang di Tisoffindo.',
        'Tanyakan harga, stok, alamat, jam buka, atau kontak. Chat ini tidak menerima pesanan.',
      ],
      i18n: {
        en: {
          title: 'Tisoffindo',
          subtitle: 'Tanya produk, harga, dan stok',
          footer: '',
          getStarted: 'Mulai chat',
          inputPlaceholder: 'Ketik pertanyaan Anda...',
          closeButtonTooltip: 'Tutup',
        },
      },
    });

    return () => {
      chat?.unmount?.();
      targetEl.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="tisoffindo-chat-root" />;
}

export default ChatWidget;

