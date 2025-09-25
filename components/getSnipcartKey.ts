export function getSnipcartPublicKey() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    const isProd = host === 'filmraid.pro' || host === 'www.filmraid.pro';
    return isProd
      ? 'ZmM4ZTIwN2UtOWI3Yi00NDFlLWFmYmMtZDgwNTQzYzc0YWE2NjM4OTA0NTgxOTU4MTA2ODQy' // LIVE
      : 'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy'; // TEST
  }
  // SSR fallback (safe to default to TEST)
  return 'NzhjOGJmOTEtY2Y1MS00MGRkLWIwNmEtNjkzYWVlNTYxMjViNjM4OTA0NTgxOTU4MTA2ODQy';
}
