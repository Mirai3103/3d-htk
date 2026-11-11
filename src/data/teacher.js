/**
 * The courtyard teacher (an NPC you can talk to): who she is, where she stands and what she
 * says. Edit her speech here: each entry of `lines` is one speech bubble.
 */

export const TEACHER = {
  name: 'Cô giáo',
  // 'young' (pink áo dài, long hair), 'middle' (teal, low bun, glasses) or 'senior'
  // (deep red velvet, grey bun, round glasses). See LOOKS in campus/teacher.js.
  look: 'young',
  // Middle of the brick courtyard, on the axis of the main gate. Yaw 0 faces +Z (the gate).
  x: 0,
  z: 9,
  yaw: 0,
  lines: [
    'Trường THCS Huỳnh Thúc Kháng, xã Nghĩa Hành.',
    'Là đơn vị giáo dục giàu truyền thống và luôn giữ vững vị thế lá cờ đầu của xã Nghĩa Hành, tỉnh Quảng Ngãi.',
    'Với quy mô hơn 1.000 học sinh, nhà trường liên tục khẳng định chất lượng giáo dục toàn diện…',
    '…qua tỷ lệ tốt nghiệp đạt 100% cùng nhiều thành tích xuất sắc trong công tác bồi dưỡng học sinh giỏi.',
    'Phát huy bề dày lịch sử, tập thể sư phạm nhà trường luôn đoàn kết, đổi mới,…',
    '…quyết tâm xây dựng môi trường học tập kỷ cương và chất lượng cao.',
  ],
};
