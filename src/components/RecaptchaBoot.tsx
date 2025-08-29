'use client';

import { useEffect } from 'react';

type ExecWithOpts = (opts: { action: string }) => Promise<string>;
type ExecWithKey = (siteKey: string, opts: { action: string }) => Promise<string>;
type GrecaptchaEnterprise = { execute: ExecWithOpts & ExecWithKey };
type WindowGre = {
  grecaptcha?: { enterprise?: GrecaptchaEnterprise };
  __grecaptchaEnterprise__?: GrecaptchaEnterprise;
};

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

function injectScript(src: string, id: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.id = id;
    s.src = src;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('recaptcha script load error'));
    document.head.appendChild(s);
  });
}

function stashEnterpriseRef() {
  const w = window as unknown as WindowGre;
  if (w.grecaptcha?.enterprise) {
    w.__grecaptchaEnterprise__ = w.grecaptcha.enterprise;
  }
}

export default function RecaptchaBoot() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!SITE_KEY) return;

      // 1) Carga el script de Enterprise
      try {
        await injectScript(
          `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(SITE_KEY)}`,
          'recaptcha-enterprise',
        );
      } catch {
        // Si falla google.com (raro), podrías probar el dominio alternativo:
        // await injectScript(`https://www.recaptcha.net/recaptcha/enterprise.js?render=${encodeURIComponent(SITE_KEY)}`, 'recaptcha-enterprise');
        return;
      }
      if (cancelled) return;

      // 2) Poll corto para capturar enterprise y guardarlo ANTES de que Snipcart lo pise
      const started = Date.now();
      (function check() {
        if (cancelled) return;
        stashEnterpriseRef();
        const w = window as unknown as WindowGre;
        if (w.__grecaptchaEnterprise__?.execute) return;
        if (Date.now() - started > 30000) return; // 30s de margen silencioso
        setTimeout(check, 50);
      })();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
