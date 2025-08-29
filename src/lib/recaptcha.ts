export const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;

type ExecWithOpts = (opts: { action: string }) => Promise<string>;
type ExecWithKey = (siteKey: string, opts: { action: string }) => Promise<string>;

type GrecaptchaEnterprise = {
  execute: ExecWithOpts & ExecWithKey;
};

type GrecaptchaGlobal = {
  enterprise?: GrecaptchaEnterprise;
};

type WindowGre = {
  grecaptcha?: GrecaptchaGlobal;
  __grecaptchaEnterprise__?: GrecaptchaEnterprise;
};

function getEnterprise(): GrecaptchaEnterprise | undefined {
  const w = globalThis as unknown as WindowGre;
  // 1) Usa la copia guardada (antes de que Snipcart pise grecaptcha)
  if (w.__grecaptchaEnterprise__) return w.__grecaptchaEnterprise__;
  // 2) O usa la referencia “viva”
  return w.grecaptcha?.enterprise;
}

/** Espera a que enterprise.execute exista, con timeout para no colgar UI */
export function grecaptchaReady(timeoutMs = 8000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const ent = getEnterprise();
      if (ent && typeof ent.execute === 'function') {
        resolve();
        return;
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error('reCAPTCHA failed to load (timeout)'));
        return;
      }
      setTimeout(check, 100);
    };
    check();
  });
}

/** Obtiene token. Primero execute({action}); si falla, fallback execute(SITE_KEY, {action}) */
export async function getEnterpriseToken(action: string): Promise<string> {
  const ent = getEnterprise();
  if (!ent || typeof ent.execute !== 'function') throw new Error('reCAPTCHA not ready');

  // Narrow de overloads
  const execWithOpts = ent.execute as ExecWithOpts;
  const execWithKey = ent.execute as ExecWithKey;

  try {
    const t = await execWithOpts({ action });
    if (t) return t;
  } catch {
    /* sigue al fallback */
  }

  if (!SITE_KEY) throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  const t2 = await execWithKey(SITE_KEY, { action });
  if (!t2) throw new Error('Could not obtain reCAPTCHA token');
  return t2;
}
