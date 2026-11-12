/**
 * The memory video shown on the screen of the Teachers' Day corner.
 * `src` can be overridden at runtime by the Supabase `content` row (`video_src`), so the file can
 * be swapped without a rebuild; the title card wording below stays baked.
 *
 *   src       a file kept in `public/` (the build copies that folder next to index.html, so the
 *             path is relative: 'videos/my-film.mp4'), or a full https:// address.
 *             MP4 (H.264 + AAC) plays everywhere.
 *   title, subtitle, invite
 *             painted on the screen while the video is not playing, in Vietnamese.
 */
import { CONTENT } from './remote.js';

const DEFAULTS = {
  // Mock video for now.
  src: 'videos/goku-ultra-instinct-dbs-ep129-720p.mp4',
  title: 'VIDEO KỶ NIỆM',
  subtitle: 'Ngày Nhà giáo Việt Nam 20 · 11',
  invite: 'Nhấn để xem',
};

const override = typeof CONTENT.video?.src === 'string' && CONTENT.video.src.trim()
  ? { src: CONTENT.video.src.trim() }
  : {};

export const MEMORY_VIDEO = { ...DEFAULTS, ...override };
