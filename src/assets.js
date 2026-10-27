// The normal site uses local HTTP assets; the offline edition embeds data URLs.
export function assetURL(file) {
  if (/^(?:data:|blob:)/.test(file)) return file;
  const path = file.startsWith('/assets/') ? file : `/assets/${file}`;
  return globalThis.__OFFLINE_ASSETS__?.[path] ?? path;
}
