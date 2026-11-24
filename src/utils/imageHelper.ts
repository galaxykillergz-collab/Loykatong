import { KRATHONG_LIMITS } from '@/src/types/krathong';

/**
 * ย่อขนาดและบีบอัดรูปภาพจากไฟล์ที่ผู้ใช้เลือกให้เป็น Data URL (JPEG)
 * เพื่อให้จัดเก็บใน Firestore ได้อย่างปลอดภัยโดยไม่เกินขีดจำกัดขนาดเอกสาร
 */
export async function compressImageFileToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('ไม่สามารถอ่านไฟล์รูปภาพได้'));
      }
    };
    reader.onerror = () => reject(new Error('เกิดข้อผิดพลาดระหว่างอ่านไฟล์รูปภาพ'));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('ไฟล์รูปภาพไม่ถูกต้องหรือเสียหาย'));
    image.src = dataUrl;
  });

  const maxDimension = 640;
  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('เบราว์เซอร์ไม่รองรับการปรับขนาดรูปภาพ');
  }

  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.78;
  let compressed = canvas.toDataURL('image/jpeg', quality);
  while (compressed.length > KRATHONG_LIMITS.imageDataMax && quality > 0.35) {
    quality -= 0.1;
    compressed = canvas.toDataURL('image/jpeg', quality);
  }

  if (compressed.length > KRATHONG_LIMITS.imageDataMax) {
    throw new Error('รูปภาพมีขนาดใหญ่เกินไป กรุณาเลือกรูปที่เล็กลง');
  }

  return compressed;
}

export function isValidImageInput(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.length > KRATHONG_LIMITS.imageDataMax) return false;
  if (trimmed.startsWith('https://')) return true;
  return /^data:image\/(jpeg|jpg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(trimmed);
}
