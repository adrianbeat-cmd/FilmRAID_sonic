export {};

declare global {
  interface GrecaptchaEnterprise {
    execute(siteKey: string, options: { action: string }): Promise<string>;
  }

  interface Grecaptcha {
    enterprise: GrecaptchaEnterprise;
  }

  interface Window {
    grecaptcha?: Grecaptcha;
  }
}
