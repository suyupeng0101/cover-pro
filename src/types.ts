export type Platform = {
  id: string;
  name: string;
  shortName: string;
  group: 'General' | 'Xiaohongshu' | 'Douyin' | 'WeChat Channels' | 'WeChat Official';
  width: number;
  height: number;
};

export type Theme = {
  id: string;
  name: string;
  accent: string;
  accent2: string;
  background: string;
  foreground: string;
  muted: string;
};

export type TemplateId =
  | 'cyber-review'
  | 'neon-terminal'
  | 'ai-radar'
  | 'glass-report'
  | 'launch-card'
  | 'xhs-review-card'
  | 'xhs-list-note'
  | 'wechat-deep-dive'
  | 'bold-number'
  | 'fashion-magazine';

export type CoverContent = {
  label: string;
  title: string;
  subtitle: string;
  author: string;
  badge: string;
  graphicText: string;
};

export type ImageState = {
  src: string | null;
  scale: number;
  x: number;
  y: number;
};

export type TextElementKey = 'label' | 'title' | 'subtitle' | 'author' | 'badge' | 'graphic';

export type ElementPosition = {
  x: number;
  y: number;
};

export type TextColorMap = Record<TextElementKey, string>;

export type StickerAsset = {
  id: string;
  name: string;
  kind: 'burst' | 'arrow' | 'ring' | 'bubble' | 'spark' | 'tag';
  label?: string;
  color: string;
  color2: string;
};

export type StickerInstance = {
  id: string;
  assetId: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
};

export type CoverStyle = {
  platformId: string;
  templateId: TemplateId;
  themeId: string;
  titleSize: number;
  titleLineHeight: number;
  titleLetterSpacing: number;
  titleWeight: number;
  titleWidth: number;
  subtitleSize: number;
  subtitleLineHeight: number;
  subtitleSpacing: number;
  subtitleWidth: number;
  textAlign: 'left' | 'center' | 'right';
  fontFamily:
    | 'system'
    | 'serif'
    | 'mono'
    | 'display'
    | 'art-rounded'
    | 'art-condensed'
    | 'brush'
    | 'handwritten'
    | 'custom';
  customFontName: string | null;
  customFontDataUrl: string | null;
  titleX: number;
  titleY: number;
  image: ImageState;
  stickers: StickerInstance[];
  elementPositions: Record<TextElementKey, ElementPosition>;
  textColors: TextColorMap;
  decorationDensity: 'low' | 'medium' | 'high';
  backgroundBrightness: number;
  showSubtitle: boolean;
  showLabel: boolean;
  showAuthor: boolean;
  showBadge: boolean;
  showGraphicText: boolean;
  showImage: boolean;
  showStickers: boolean;
  showSafeArea: boolean;
};

export type TemplateMeta = {
  id: TemplateId;
  name: string;
  description: string;
  defaultThemeId: string;
};
