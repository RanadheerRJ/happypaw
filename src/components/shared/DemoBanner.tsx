import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '@/config/env';
import { dataClient } from '@/data';

const KEY = 'happypaw:demo-banner-dismissed';

export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!env.demoMode) return;
    try {
      setVisible(window.sessionStorage.getItem(KEY) !== '1');
    } catch {
      setVisible(true);
    }
  }, []);

  if (!env.demoMode || !visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      window.sessionStorage.setItem(KEY, '1');
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative z-30 border-b border-forest/10 bg-sage-100/80">
      <div className="container-x flex items-center justify-between gap-3 py-2">
        <p className="text-[12px] text-forest-700">
          <span className="font-semibold">Demo build.</span> Sample data only — payments are
          simulated and no orders are placed.{' '}
          <span className="hidden sm:inline text-forest-600/80">
            Data lives in your browser ({dataClient.mode} mode).
          </span>{' '}
          <Link to="/about" className="font-medium underline decoration-forest/30 underline-offset-2">
            About this build
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss demo notice"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-forest/60 transition-colors hover:bg-forest/10 hover:text-forest"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
