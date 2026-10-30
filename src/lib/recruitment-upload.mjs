/** @param {{name: string, size: number} | null} file @param {number} maxBytes */
export function validateResume(file, maxBytes = 10485760) {
  if (!file) return 'required';
  if (!Number.isSafeInteger(file.size) || file.size <= 0) return 'empty';
  // 可信前端硬上限，远端配置只能收紧，不能放大。
  if (file.size > Math.min(maxBytes, 10485760)) return 'large';
  if (!/\.(pdf|docx)$/i.test(file.name)) return 'type';
  return null;
}
