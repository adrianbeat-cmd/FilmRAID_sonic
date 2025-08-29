export const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string;

type GrecaptchaEnterprise = {
  ready: (cb: () => void) => void;
  // Overloaded execute: either execute({ action }) or execute(siteKey, { action })
  execute:
    | ((opts: { action: string }) => Promise<string>)
    | ((siteKey: string, opts: { action: string }) => Promise<string>);
};

type GrecaptchaGlobal = {
  enterprise?: GrecaptchaEnterprise;
};

function getGreCaptcha(): GrecaptchaGlobal | undefined {
  return (globalThis as unknown as { grecaptcha?: GrecaptchaGlobal }).grecaptcha;
}

/** Waits until grecaptcha.enterprise is fully ready, with a timeout to avoid hanging UI */
export function grecaptchaReady(timeoutMs = 8000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const g = getGreCaptcha();
      const ent = g?.enterprise;
      if (ent?.ready) {
        ent.ready(() => resolve());
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

/** Gets a token. Try execute({action}) first; if it fails, fallback to execute(SITE_KEY, {action}) */
export async function getEnterpriseToken(action: string): Promise<string> {
  const g = getGreCaptcha();
  const ent = g?.enterprise;
  if (!ent?.execute) throw new Error('reCAPTCHA not ready');

  // Narrow the overloads
  const execWithOpts = ent.execute as (opts: { action: string }) => Promise<string>;
  const execWithKey = ent.execute as (siteKey: string, opts: { action: string }) => Promise<string>;

  try {
    const t = await execWithOpts({ action });
    if (t) return t;
  } catch {
    /* fall through to fallback */
  }

  if (!SITE_KEY) throw new Error('Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY');
  const t2 = await execWithKey(SITE_KEY, { action });
  if (!t2) throw new Error('Could not obtain reCAPTCHA token');
  return t2;
}
