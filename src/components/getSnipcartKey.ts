export function getSnipcartPublicKey() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';

  // Live domains → LIVE key
  const LIVE_HOSTS = new Set(['filmraid.pro', 'www.filmraid.pro']);

  const LIVE_KEY = 'ZmM4ZTIwN2UtOWI3Yi00NDFlLWFmYmMtZDgwNTQzYzc0YWE2NjM4OTA0NTgxOTU4MTA2ODQy';
  const TEST_KEY = 'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy';

  if (LIVE_HOSTS.has(host)) return LIVE_KEY;
  return TEST_KEY; // previews, localhost, netlify.app, etc.
}
