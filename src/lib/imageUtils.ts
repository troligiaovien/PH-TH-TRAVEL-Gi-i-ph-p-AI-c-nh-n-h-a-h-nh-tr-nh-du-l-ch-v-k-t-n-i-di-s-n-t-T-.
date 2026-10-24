/**
 * Utility functions for client-side batch image processing,
 * crisp resizing, and optimization for Firestore storage.
 */

export interface ProcessedImage {
  id: string;
  file: File;
  dataUrl: string;
  name: string;
  title: string;
  caption: string;
  tag: string;
  sizeBytes: number;
  width: number;
  height: number;
  isCoverCandidate?: boolean;
}

/**
 * Format bytes to readable KB/MB
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Convert filename to clean human-readable title
 * e.g., "den_hung_hoang_hon_01.jpg" -> "Đền Hùng Hoàng Hôn 01"
 */
export function sanitizeImageTitle(fileName: string): string {
  const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
  const clean = nameWithoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!clean) return 'Hình ảnh di tích';

  // Capitalize words
  return clean
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Optimize an image file to a crisp, high-definition data URL.
 * Resizes large camera photos (e.g. 12-48MP) to crisp 1600px max dimension,
 * keeping aspect ratio and high sharpness with JPEG/WebP quality 0.86.
 */
export async function optimizeImageFile(
  file: File,
  maxDimension = 1200,
  quality = 0.78
): Promise<{ dataUrl: string; width: number; height: number; sizeBytes: number }> {
  return new Promise((resolve, reject) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return reject(new Error(`Tệp ${file.name} không phải là tệp ảnh hợp lệ.`));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không thể đọc tệp ảnh từ máy tính.'));
    reader.onload = (e) => {
      const rawUrl = e.target?.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error(`Không thể hiển thị ảnh ${file.name}.`));
      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;

        // Calculate scaling ratio
        if (targetWidth > maxDimension || targetHeight > maxDimension) {
          if (targetWidth > targetHeight) {
            targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
            targetWidth = maxDimension;
          } else {
            targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
            targetHeight = maxDimension;
          }
        }

        // Render to canvas with high smoothing
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({
            dataUrl: rawUrl,
            width: img.width,
            height: img.height,
            sizeBytes: file.size
          });
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        let outputFormat = 'image/jpeg';
        let optimizedDataUrl = canvas.toDataURL(outputFormat, quality);

        // Tier 1 safety check: if image is > 140KB, scale down to 960px
        if (optimizedDataUrl.length > 140000) {
          const s1 = document.createElement('canvas');
          const maxDim2 = 960;
          const factor = Math.min(1, maxDim2 / Math.max(targetWidth, targetHeight));
          s1.width = Math.round(targetWidth * factor);
          s1.height = Math.round(targetHeight * factor);
          const s1Ctx = s1.getContext('2d');
          if (s1Ctx) {
            s1Ctx.imageSmoothingEnabled = true;
            s1Ctx.imageSmoothingQuality = 'high';
            s1Ctx.drawImage(canvas, 0, 0, s1.width, s1.height);
            optimizedDataUrl = s1.toDataURL('image/jpeg', 0.74);
            targetWidth = s1.width;
            targetHeight = s1.height;
          }
        }

        // Tier 2 safety check: if still > 160KB, clamp to 800px
        if (optimizedDataUrl.length > 160000) {
          const s2 = document.createElement('canvas');
          const maxDim3 = 800;
          const factor2 = Math.min(1, maxDim3 / Math.max(targetWidth, targetHeight));
          s2.width = Math.round(targetWidth * factor2);
          s2.height = Math.round(targetHeight * factor2);
          const s2Ctx = s2.getContext('2d');
          if (s2Ctx) {
            s2Ctx.imageSmoothingEnabled = true;
            s2Ctx.imageSmoothingQuality = 'high';
            s2Ctx.drawImage(canvas, 0, 0, s2.width, s2.height);
            optimizedDataUrl = s2.toDataURL('image/jpeg', 0.70);
            targetWidth = s2.width;
            targetHeight = s2.height;
          }
        }

        // Estimate size from base64 string
        const sizeBytes = Math.round((optimizedDataUrl.length * 3) / 4);

        resolve({
          dataUrl: optimizedDataUrl,
          width: targetWidth,
          height: targetHeight,
          sizeBytes
        });
      };
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}
