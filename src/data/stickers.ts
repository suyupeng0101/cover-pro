import type { StickerAsset } from '../types';

export const stickerAssets: StickerAsset[] = [
  {
    id: 'hot-burst',
    name: '爆点',
    kind: 'burst',
    label: 'HOT',
    color: '#FFF100',
    color2: '#FF3D00',
  },
  {
    id: 'neon-arrow',
    name: '箭头',
    kind: 'arrow',
    color: '#00E5FF',
    color2: '#7C5CFF',
  },
  {
    id: 'focus-ring',
    name: '聚焦圈',
    kind: 'ring',
    color: '#FF3DF2',
    color2: '#FFFFFF',
  },
  {
    id: 'note-bubble',
    name: '气泡',
    kind: 'bubble',
    label: 'NEW',
    color: '#FFFFFF',
    color2: '#00D1A7',
  },
  {
    id: 'star-spark',
    name: '星标',
    kind: 'spark',
    color: '#FFB020',
    color2: '#FFF2D2',
  },
  {
    id: 'corner-tag',
    name: '角标',
    kind: 'tag',
    label: 'TOP',
    color: '#FF315A',
    color2: '#FFE3EA',
  },
];

export function getStickerAsset(assetId: string) {
  return stickerAssets.find((asset) => asset.id === assetId) ?? stickerAssets[0];
}
