/**
 * The souvenir album on the Teachers' Day table: its cover wording and its page list.
 * Edit the cover here. The PAGES are the `album_items` column of the Supabase `content` row
 * (edit them in `admin.html`), so the list changes without a rebuild; this file supplies the
 * cover and the fallback.
 *
 * Each page entry: imageLink (a picture URL — cross-origin hosts are retried through wsrv.nl,
 * then a painted placeholder is shown; import a file from src/ to bundle it) and description
 * (the caption, in Vietnamese, about four lines fit). Two pages share a sheet, so an odd count
 * leaves the last page blank.
 */
import { CONTENT } from './remote.js';

export const ALBUM = {
  title: 'ALBUM KỶ NIỆM',
  subtitle: 'Trường THCS Huỳnh Thúc Kháng',
  occasion: 'Ngày Nhà giáo Việt Nam 20 · 11',
  // Written inside the front cover, facing the first page.
  dedication: 'Lưu giữ những khoảnh khắc đẹp nhất dưới mái trường thân yêu.',
  // Shown after the last page.
  farewell: 'Cảm ơn thầy cô đã cùng chúng em viết nên những trang kỷ niệm này.',
};

/**
 * Pages from the Supabase row, or none when it cannot be read — the book then opens with blank
 * pages instead of breaking.
 */
export const ALBUM_ITEMS = Array.isArray(CONTENT.albumItems)
  ? CONTENT.albumItems.filter(
    (item) => item && typeof item.imageLink === 'string' && typeof item.description === 'string',
  )
  : [];
