import type { CoverContent, Platform } from '../types';

export function buildFileName(content: CoverContent, platform: Platform) {
  const title = content.title || content.graphicText || 'cover';
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);

  return `${slug || 'cover'}_${platform.id}_${platform.width}x${platform.height}.png`;
}
