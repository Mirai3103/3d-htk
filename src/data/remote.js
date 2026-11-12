/**
 * Runtime content: the album's pages and the memory video file live in Supabase (project
 * `htk-3d-data`, table `content`, the single row `id = 1`), so `admin.html` can change them
 * without a rebuild. The site only uses the publishable (public, read-only) key; writes go
 * through the `save_content` function, which checks a write key.
 *
 * Offline, a blocked request, a bad row or a 5 s timeout returns {} — the baked defaults in
 * `src/data/*.js` then apply and the scene still opens.
 */
const SUPABASE_URL = 'https://lldztclylmjtqjrltwgi.supabase.co';
const SUPABASE_KEY = 'sb_publishable_yT3dW8SrSzwppmgfFJCcmQ_h8bF0WX-';

async function loadContent() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/content?id=eq.1&select=album_items,video_src`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: 'no-cache',
      signal: AbortSignal.timeout?.(5000),
    });
    if (!res.ok) return {};
    const [row] = await res.json();
    if (!row) return {};
    return { albumItems: row.album_items, video: { src: row.video_src } };
  } catch {
    return {};
  }
}

export const CONTENT = await loadContent();
