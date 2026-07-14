'use client';

import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

const DISMISS_KEY = 'dio-pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneMode() {
  return typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches;
}

function isDismissed() {
  return typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1';
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [hidden, setHidden] = useState(() => isStandaloneMode() || isDismissed());

  useEffect(() => {
    if (hidden) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    const onInstalled = () => {
      setHidden(true);
      setShowBanner(false);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, [hidden]);

  const handleInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === 'accepted') setShowBanner(false);
    setDeferred(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setHidden(true);
    setShowBanner(false);
  };

  if (hidden || !showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-slideUp lg:bottom-6 lg:left-auto lg:right-6 lg:max-w-sm">
      <div className="glass-card rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl btn-gradient text-sm font-bold">
            D
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Ilovani o&apos;rnatish</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--color-muted-foreground)]">
              Diyorani telefoningizga qo&apos;shing — tezroq ochiladi va qulayroq ishlaydi.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={handleInstall}>
                <Download className="h-4 w-4" />
                O&apos;rnatish
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDismiss}>
                Keyinroq
              </Button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Yopish"
            className="shrink-0 rounded-lg p-1 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
