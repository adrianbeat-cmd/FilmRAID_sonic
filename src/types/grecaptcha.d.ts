export {};

declare global {
  interface GrecaptchaEnterprise {
    execute(siteKey: string, options: { action: string }): Promise<string>;
    execute(options: { action: string }): Promise<string>; // overload sin siteKey
    ready(cb: () => void): void;
  }

  interface Grecaptcha {
    enterprise: GrecaptchaEnterprise;
  }

  interface Window {
    grecaptcha?: Grecaptcha;
  }
}
