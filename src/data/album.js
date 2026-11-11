/**
 * The souvenir album on the Teachers' Day table: its cover wording and its pages.
 * Edit the album here.
 *
 * Each entry of ALBUM_ITEMS is ONE page: a photo on top, a caption underneath. Pages are
 * shown in order, two per sheet (front and back), so an odd count leaves the last page blank.
 *
 *   imageLink    a picture URL. Remote pictures must allow cross-origin use; when they do not,
 *                the album retries through the wsrv.nl image proxy, and paints a placeholder if
 *                that fails too (offline). To ship a picture inside the build instead, import
 *                it:  import classPhoto from '../assets/class-9a.jpg';  imageLink: classPhoto
 *   description  the caption, in Vietnamese. About four lines fit; longer text is cut with "…".
 */

export const ALBUM = {
  title: 'ALBUM KỶ NIỆM',
  subtitle: 'Trường THCS Huỳnh Thúc Kháng',
  occasion: 'Ngày Nhà giáo Việt Nam 20 · 11',
  // Written inside the front cover, facing the first page.
  dedication: 'Lưu giữ những khoảnh khắc đẹp nhất dưới mái trường thân yêu.',
  // Shown after the last page.
  farewell: 'Cảm ơn thầy cô đã cùng chúng em viết nên những trang kỷ niệm này.',
};

// Mock data for now: random placeholder pictures, replaced on every visit.
export const ALBUM_ITEMS = [
  {
    imageLink: 'https://placewaifu.com/image/600/450',
    description: 'Trang mở đầu cuốn nhật ký hành trình — nơi lưu giữ những khoảnh khắc rực rỡ và đáng nhớ nhất của tuổi trẻ.',
  },
  {
    imageLink: 'https://placewaifu.com/image/604/452',
    description: 'Kỷ niệm buổi chiều lộng gió bên hiên nhà — khoảnh khắc bình yên cùng những câu chuyện không hồi kết.',
  },
  {
    imageLink: 'https://placewaifu.com/image/608/454',
    description: 'Chuyến đi xa đầu năm cùng cả nhóm, nắng vàng dịu nhẹ và tiếng cười vang suốt dọc đường đi.',
  },
  {
    imageLink: 'https://placewaifu.com/image/612/456',
    description: 'Góc phố quen mỗi độ thu về, lá rơi khẽ trên vai và tách trà ấm nóng giữa tiết trời se lạnh.',
  },
  {
    imageLink: 'https://placewaifu.com/image/616/458',
    description: 'Bức ảnh chụp vội dưới ánh hoàng hôn tím biếc, lưu lại nụ cười trong trẻo sau một ngày dài khám phá.',
  },
  {
    imageLink: 'https://placewaifu.com/image/620/460',
    description: 'Ngày hội mùa hè rực rỡ sắc màu, pháo hoa nở rộ trên bầu trời đêm và những lời ước nguyện chân thành.',
  },
  {
    imageLink: 'https://placewaifu.com/image/624/462',
    description: 'Buổi sáng bình minh nơi thị trấn sương mù, không khí trong lành khiến lòng người nhẹ tênh.',
  },
  {
    imageLink: 'https://placewaifu.com/image/628/464',
    description: 'Một chiều mưa bất chợt trú dưới mái hiên cổ kính, lắng nghe tiếng mưa rơi đều trên nền đá cuội.',
  },
  {
    imageLink: 'https://placewaifu.com/image/632/466',
    description: 'Bữa tiệc nhỏ ấm cúng bên ánh đèn vàng, nơi mọi khoảng cách đều tan biến trong niềm vui hội ngộ.',
  },
  {
    imageLink: 'https://placewaifu.com/image/636/468',
    description: 'Khép lại một chương kỷ niệm thật đẹp — hẹn gặp lại ở những hành trình mới đầy ắp tiếng cười phía trước.',
  },
];
