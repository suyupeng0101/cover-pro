import { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import type { CoverContent, CoverStyle, Platform, TextElementKey, Theme } from '../types';
import { CyberReview } from '../templates/CyberReview';
import { NeonTerminal } from '../templates/NeonTerminal';
import { AIRadar } from '../templates/AIRadar';
import { GlassReport } from '../templates/GlassReport';
import { LaunchCard } from '../templates/LaunchCard';
import { XhsReviewCard } from '../templates/XhsReviewCard';
import { XhsListNote } from '../templates/XhsListNote';
import { WechatDeepDive } from '../templates/WechatDeepDive';
import { BoldNumber } from '../templates/BoldNumber';
import { FashionMagazine } from '../templates/FashionMagazine';

type CoverCanvasProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
  theme: Theme;
  onElementPointerDown?: (key: TextElementKey, event: React.PointerEvent<HTMLElement>) => void;
};

export const CoverCanvas = forwardRef<HTMLDivElement, CoverCanvasProps>(
  ({ content, style, platform, theme, onElementPointerDown }, ref) => {
    const cssVars = {
      '--cover-width': `${platform.width}px`,
      '--cover-height': `${platform.height}px`,
      '--theme-accent': theme.accent,
      '--theme-accent-2': theme.accent2,
      '--theme-bg': theme.background,
      '--theme-fg': theme.foreground,
      '--theme-muted': theme.muted,
      '--title-scale': style.titleSize,
      '--title-line-height': style.titleLineHeight,
      '--title-letter-spacing': `${style.titleLetterSpacing}em`,
      '--title-weight': style.titleWeight,
      '--title-width': `${style.titleWidth}cqw`,
      '--subtitle-scale': style.subtitleSize,
      '--subtitle-line-height': style.subtitleLineHeight,
      '--subtitle-spacing': `${style.subtitleSpacing}cqw`,
      '--subtitle-width': `${style.subtitleWidth}cqw`,
      '--text-align': style.textAlign,
      '--cover-font': getFontFamily(style),
      '--title-x': `${style.titleX}cqw`,
      '--title-y': `${style.titleY}cqh`,
      '--image-scale': style.image.scale,
      '--image-x': `${style.image.x}cqw`,
      '--image-y': `${style.image.y}cqh`,
      '--pos-label-x': `${style.elementPositions.label.x}cqw`,
      '--pos-label-y': `${style.elementPositions.label.y}cqh`,
      '--pos-title-x': `${style.elementPositions.title.x}cqw`,
      '--pos-title-y': `${style.elementPositions.title.y}cqh`,
      '--pos-subtitle-x': `${style.elementPositions.subtitle.x}cqw`,
      '--pos-subtitle-y': `${style.elementPositions.subtitle.y}cqh`,
      '--pos-author-x': `${style.elementPositions.author.x}cqw`,
      '--pos-author-y': `${style.elementPositions.author.y}cqh`,
      '--pos-badge-x': `${style.elementPositions.badge.x}cqw`,
      '--pos-badge-y': `${style.elementPositions.badge.y}cqh`,
      '--pos-graphic-x': `${style.elementPositions.graphic.x}cqw`,
      '--pos-graphic-y': `${style.elementPositions.graphic.y}cqh`,
      '--text-label-color': resolveTextColor(style.textColors.label, theme.accent),
      '--text-title-color': resolveTextColor(style.textColors.title, theme.foreground),
      '--text-subtitle-color': resolveTextColor(style.textColors.subtitle, `color-mix(in srgb, ${theme.foreground}, ${theme.muted} 38%)`),
      '--text-author-color': resolveTextColor(style.textColors.author, theme.muted),
      '--text-badge-color': resolveTextColor(style.textColors.badge, theme.accent),
      '--text-graphic-color': resolveTextColor(style.textColors.graphic, theme.accent),
      '--brightness': `${style.backgroundBrightness}%`,
    } as CSSProperties;

    return (
      <div
        ref={ref}
        className={`cover-canvas density-${style.decorationDensity}`}
        onPointerDown={(event) => {
          const key = getTextElementKeyFromTarget(event.target);
          if (key) onElementPointerDown?.(key, event);
        }}
        style={{
          ...cssVars,
          width: platform.width,
          height: platform.height,
        }}
      >
        {style.fontFamily === 'custom' && style.customFontDataUrl && (
          <style>
            {`@font-face{font-family:"CoverProCustomFont";src:url("${style.customFontDataUrl}");font-display:swap;}`}
          </style>
        )}
        <div className={`template-platform template-platform-${platform.id}`}>
        {style.templateId === 'cyber-review' && <CyberReview content={content} style={style} platform={platform} />}
        {style.templateId === 'neon-terminal' && <NeonTerminal content={content} style={style} platform={platform} />}
        {style.templateId === 'ai-radar' && <AIRadar content={content} style={style} platform={platform} />}
        {style.templateId === 'glass-report' && <GlassReport content={content} style={style} platform={platform} />}
        {style.templateId === 'launch-card' && <LaunchCard content={content} style={style} platform={platform} />}
        {style.templateId === 'xhs-review-card' && <XhsReviewCard content={content} style={style} platform={platform} />}
        {style.templateId === 'xhs-list-note' && <XhsListNote content={content} style={style} platform={platform} />}
        {style.templateId === 'wechat-deep-dive' && <WechatDeepDive content={content} style={style} platform={platform} />}
        {style.templateId === 'bold-number' && <BoldNumber content={content} style={style} platform={platform} />}
        {style.templateId === 'fashion-magazine' && <FashionMagazine content={content} style={style} platform={platform} />}
        </div>
        {style.showSafeArea && <SafeArea />}
      </div>
    );
  },
);

CoverCanvas.displayName = 'CoverCanvas';

function getFontFamily(style: CoverStyle) {
  if (style.fontFamily === 'custom' && style.customFontDataUrl) {
    return '"CoverProCustomFont", "PingFang SC", "Microsoft YaHei", sans-serif';
  }
  if (style.fontFamily === 'serif') return '"Noto Serif SC", "Songti SC", STSong, serif';
  if (style.fontFamily === 'mono') return '"JetBrains Mono", "Cascadia Code", "SFMono-Regular", monospace';
  if (style.fontFamily === 'display') return '"Arial Black", "Impact", "Microsoft YaHei", "PingFang SC", sans-serif';
  if (style.fontFamily === 'art-rounded') return '"Arial Rounded MT Bold", "Trebuchet MS", "Microsoft YaHei", "PingFang SC", sans-serif';
  if (style.fontFamily === 'art-condensed') return '"Arial Narrow", "Roboto Condensed", "Microsoft YaHei UI", "PingFang SC", sans-serif';
  if (style.fontFamily === 'brush') return '"STXingkai", "KaiTi", "Kaiti SC", cursive';
  if (style.fontFamily === 'handwritten') return '"Comic Sans MS", "STKaiti", "Kaiti SC", cursive';
  return 'Inter, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
}

function resolveTextColor(value: string | undefined, fallback: string) {
  return value && value !== 'auto' ? value : fallback;
}

function SafeArea() {
  return (
    <div className="safe-area" aria-hidden="true">
      <span />
    </div>
  );
}

function getTextElementKeyFromTarget(target: EventTarget): TextElementKey | null {
  const el = target instanceof HTMLElement
    ? target.closest<HTMLElement>('[data-cover-element], .text-el-label, .text-el-title, .text-el-subtitle, .text-el-author, .text-el-badge, .text-el-graphic')
    : null;
  if (!el) return null;
  const dataKey = el.dataset.coverElement;
  if (isTextElementKey(dataKey)) return dataKey;
  if (el.classList.contains('text-el-label')) return 'label';
  if (el.classList.contains('text-el-title')) return 'title';
  if (el.classList.contains('text-el-subtitle')) return 'subtitle';
  if (el.classList.contains('text-el-author')) return 'author';
  if (el.classList.contains('text-el-badge')) return 'badge';
  if (el.classList.contains('text-el-graphic')) return 'graphic';
  return null;
}

function isTextElementKey(value: string | undefined): value is TextElementKey {
  return value === 'label' || value === 'title' || value === 'subtitle' || value === 'author' || value === 'badge' || value === 'graphic';
}
