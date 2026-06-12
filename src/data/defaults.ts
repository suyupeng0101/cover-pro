import type { CoverContent, CoverStyle } from '../types';
import { defaultPlatform } from './platforms';
import { defaultTheme } from './themes';

export const defaultContent: CoverContent = {
  label: '封面标题',
  title: '输入你的主标题',
  subtitle: '在这里添加副标题、说明文字或重点信息',
  author: '@你的账号名',
  badge: '重点推荐 / 最新发布',
  graphicText: '封面',
};

export const defaultStyle: CoverStyle = {
  platformId: defaultPlatform.id,
  templateId: 'cyber-review',
  themeId: defaultTheme.id,
  titleSize: 1,
  titleLineHeight: 1.08,
  titleLetterSpacing: 0,
  titleWeight: 900,
  titleWidth: 78,
  subtitleSize: 1,
  subtitleLineHeight: 1.45,
  subtitleSpacing: 2.8,
  subtitleWidth: 60,
  textAlign: 'left',
  fontFamily: 'system',
  customFontName: null,
  customFontDataUrl: null,
  titleX: 0,
  titleY: 0,
  image: {
    src: null,
    scale: 1,
    x: 0,
    y: 0,
  },
  elementPositions: {
    label: { x: 0, y: 0 },
    title: { x: 0, y: 0 },
    subtitle: { x: 0, y: 0 },
    author: { x: 0, y: 0 },
    badge: { x: 0, y: 0 },
    graphic: { x: 0, y: 0 },
  },
  textColors: {
    label: 'auto',
    title: 'auto',
    subtitle: 'auto',
    author: 'auto',
    badge: 'auto',
    graphic: 'auto',
  },
  decorationDensity: 'medium',
  backgroundBrightness: 0,
  showSubtitle: true,
  showLabel: true,
  showAuthor: true,
  showBadge: true,
  showGraphicText: true,
  showImage: true,
  showSafeArea: true,
};
