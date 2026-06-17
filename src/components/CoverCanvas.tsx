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
import { getStickerAsset } from '../data/stickers';
import type { StickerAsset } from '../types';

type CoverCanvasProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
  theme: Theme;
  onElementPointerDown?: (key: TextElementKey, event: React.PointerEvent<HTMLElement>) => void;
  onStickerPointerDown?: (id: string, event: React.PointerEvent<HTMLElement>) => void;
  onStickerRemove?: (id: string) => void;
  onStickerDrop?: (assetId: string, x: number, y: number) => void;
  selectedStickerId?: string | null;
};

export const CoverCanvas = forwardRef<HTMLDivElement, CoverCanvasProps>(
  ({ content, style, platform, theme, onElementPointerDown, onStickerPointerDown, onStickerRemove, onStickerDrop, selectedStickerId }, ref) => {
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
        onDragOver={(event) => {
          if (!event.dataTransfer.types.includes('application/x-cover-pro-sticker')) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }}
        onDrop={(event) => {
          const assetId = event.dataTransfer.getData('application/x-cover-pro-sticker');
          if (!assetId) return;
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 100;
          const y = ((event.clientY - rect.top) / rect.height) * 100;
          onStickerDrop?.(assetId, clampPercent(x), clampPercent(y));
        }}
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
        {style.showStickers && (
          <div className="sticker-layer" aria-label="贴图图层">
            {style.stickers.map((sticker) => (
              <button
                className={`sticker-instance ${sticker.id === selectedStickerId ? 'selected' : ''}`}
                key={sticker.id}
                type="button"
                data-sticker-id={sticker.id}
                onPointerDown={(event) => onStickerPointerDown?.(sticker.id, event)}
                style={{
                  left: `${sticker.x}%`,
                  top: `${sticker.y}%`,
                  opacity: sticker.opacity,
                  transform: `translate(-50%, -50%) rotate(${sticker.rotate}deg) scale(${sticker.scale})`,
                  '--sticker-color': getStickerAsset(sticker.assetId).color,
                  '--sticker-color-2': getStickerAsset(sticker.assetId).color2,
                } as CSSProperties}
                aria-label={`贴图 ${getStickerAsset(sticker.assetId).name}`}
              >
                <StickerShape asset={getStickerAsset(sticker.assetId)} />
                {sticker.id === selectedStickerId && (
                  <span
                    className="sticker-remove"
                    role="button"
                    tabIndex={0}
                    aria-label="删除贴图"
                    onPointerDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onStickerRemove?.(sticker.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return;
                      event.preventDefault();
                      event.stopPropagation();
                      onStickerRemove?.(sticker.id);
                    }}
                  >
                    ×
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
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

function StickerShape({ asset }: { asset: StickerAsset }) {
  if (asset.kind === 'arrow') {
    return (
      <svg viewBox="0 0 120 80" aria-hidden="true">
        <path className="sticker-fill" d="M78 8 114 40 78 72V52H8V28h70V8Z" />
        <path className="sticker-shadow" d="M78 8 114 40 78 72V52H8V28h70V8Z" />
      </svg>
    );
  }

  if (asset.kind === 'ring') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <ellipse className="sticker-stroke" cx="60" cy="60" rx="44" ry="31" transform="rotate(-16 60 60)" />
        <path className="sticker-sheen" d="M83 29 96 20M94 39l16-2M35 90l-14 9" />
      </svg>
    );
  }

  if (asset.kind === 'bubble') {
    return (
      <svg viewBox="0 0 130 92" aria-hidden="true">
        <path className="sticker-fill" d="M14 14h102c8 0 14 6 14 14v29c0 8-6 14-14 14H66L43 88l6-17H14C6 71 0 65 0 57V28c0-8 6-14 14-14Z" />
        <text x="65" y="51" textAnchor="middle">{asset.label}</text>
      </svg>
    );
  }

  if (asset.kind === 'spark') {
    return (
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <path className="sticker-fill" d="M60 6 73 45l41 15-41 15-13 39-13-39L6 60l41-15L60 6Z" />
        <path className="sticker-secondary" d="M94 7l5 16 15 5-15 5-5 16-5-16-15-5 15-5 5-16ZM25 73l4 12 12 4-12 4-4 12-4-12-12-4 12-4 4-12Z" />
      </svg>
    );
  }

  if (asset.kind === 'tag') {
    return (
      <svg viewBox="0 0 132 76" aria-hidden="true">
        <path className="sticker-fill" d="M8 0h116l-13 38 13 38H8c-4 0-8-4-8-8V8c0-4 4-8 8-8Z" />
        <text x="55" y="47" textAnchor="middle">{asset.label}</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path className="sticker-fill" d="M60 4 72 28l26-12-7 28 28 8-25 16 18 23-30-1-3 30-19-22-19 22-3-30-30 1 18-23L1 52l28-8-7-28 26 12L60 4Z" />
      <text x="60" y="69" textAnchor="middle">{asset.label}</text>
    </svg>
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

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function isTextElementKey(value: string | undefined): value is TextElementKey {
  return value === 'label' || value === 'title' || value === 'subtitle' || value === 'author' || value === 'badge' || value === 'graphic';
}
