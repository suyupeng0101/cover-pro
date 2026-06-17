import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Github,
  Image as ImageIcon,
  ImagePlus,
  Layers,
  LocateFixed,
  Moon,
  Monitor,
  Move,
  Palette,
  RotateCcw,
  Shield,
  SlidersHorizontal,
  Sparkles,
  Sticker,
  Sun,
  Trash2,
  Type,
} from 'lucide-react';
import { CoverCanvas } from './components/CoverCanvas';
import { PreviewStage } from './components/PreviewStage';
import { platforms } from './data/platforms';
import { themes } from './data/themes';
import { templates } from './data/templates';
import { getStickerAsset, stickerAssets } from './data/stickers';
import { defaultContent, defaultStyle } from './data/defaults';
import { coverToolFeatures } from './config/features';
import type { CoverContent, CoverStyle, StickerInstance, TemplateId, TextElementKey } from './types';
import { createCustomTheme } from './utils/color';
import { exportCoverAsPng } from './utils/exportImage';
import { buildFileName } from './utils/filename';

const DRAFT_STORAGE_KEY = 'cover-pro:draft:general:v2';

type DraftState = {
  content: CoverContent;
  style: CoverStyle;
  uiTheme: 'dark' | 'light';
  customAccentColor: string;
  customBackgroundColor: string;
};

type SaveTip = {
  text: string;
  tone: 'success' | 'error';
};

type PositionBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

const MIN_VISIBLE_ELEMENT_RATIO = 0.18;
const DEFAULT_ELEMENT_POSITION_BOUNDS: PositionBounds = {
  minX: -120,
  maxX: 120,
  minY: -120,
  maxY: 120,
};

type SectionId =
  | 'platform'
  | 'content'
  | 'asset'
  | 'template'
  | 'stickers'
  | 'theme'
  | 'textColor'
  | 'typography'
  | 'elementPosition'
  | 'visibility'
  | 'decor';

export function App() {
  const initialDraft = useMemo(() => loadDraft(), []);
  const [content, setContent] = useState<CoverContent>(initialDraft?.content ?? defaultContent);
  const [style, setStyle] = useState<CoverStyle>(initialDraft?.style ?? defaultStyle);
  const [uiTheme, setUiTheme] = useState<'dark' | 'light'>(initialDraft?.uiTheme ?? 'light');
  const [customAccentColor, setCustomAccentColor] = useState(initialDraft?.customAccentColor ?? '#00E5FF');
  const [customBackgroundColor, setCustomBackgroundColor] = useState(initialDraft?.customBackgroundColor ?? '#07130C');
  const [collapsedSections, setCollapsedSections] = useState<Record<SectionId, boolean>>({
    platform: false,
    content: false,
    asset: true,
    template: false,
    stickers: false,
    theme: false,
    textColor: false,
    typography: true,
    elementPosition: true,
    visibility: true,
    decor: true,
  });
  const [selectedTextElement, setSelectedTextElement] = useState<TextElementKey>('title');
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(initialDraft?.style.stickers[0]?.id ?? null);
  const [hasTextOverflow, setHasTextOverflow] = useState(false);
  const [saveTip, setSaveTip] = useState<SaveTip | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);
  const autoSaveTimerRef = useRef<number | null>(null);
  const saveTipTimerRef = useRef<number | null>(null);

  const customTheme = useMemo(
    () => createCustomTheme(customAccentColor, customBackgroundColor),
    [customAccentColor, customBackgroundColor],
  );
  const themeOptions = useMemo(() => [...themes, customTheme], [customTheme]);

  const platform = useMemo(
    () => platforms.find((item) => item.id === style.platformId) ?? platforms[0],
    [style.platformId],
  );

  const theme = useMemo(
    () => themeOptions.find((item) => item.id === style.themeId) ?? themeOptions[0],
    [style.themeId, themeOptions],
  );

  const showSaveTip = useCallback((text: string, tone: SaveTip['tone'] = 'success') => {
    if (saveTipTimerRef.current) {
      window.clearTimeout(saveTipTimerRef.current);
    }
    setSaveTip({ text, tone });
    saveTipTimerRef.current = window.setTimeout(() => {
      setSaveTip(null);
      saveTipTimerRef.current = null;
    }, 1800);
  }, []);

  const saveDraft = useCallback((message = '已自动保存') => {
    const draft: DraftState = {
      content,
      style,
      uiTheme,
      customAccentColor,
      customBackgroundColor,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      showSaveTip(message, 'success');
      return true;
    } catch {
      showSaveTip('保存失败，浏览器存储空间不足', 'error');
      return false;
    }
  }, [content, customAccentColor, customBackgroundColor, showSaveTip, style, uiTheme]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }

    if (autoSaveTimerRef.current) {
      window.clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = window.setTimeout(() => {
      saveDraft('已自动保存');
      autoSaveTimerRef.current = null;
    }, 500);

    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [saveDraft]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      saveDraft('已保存');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [saveDraft]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable)
      ) {
        return;
      }
      if (!selectedStickerId) return;
      event.preventDefault();
      removeSticker(selectedStickerId);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedStickerId, style.stickers]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
      if (saveTipTimerRef.current) window.clearTimeout(saveTipTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = coverRef.current;
    if (!canvas) return;

    const check = () => {
      const title = canvas.querySelector('.text-el-title');
      if (!(title instanceof HTMLElement)) return;
      const canvasRect = canvas.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const padding = Math.min(canvasRect.width, canvasRect.height) * 0.03;
      setHasTextOverflow(
        titleRect.left < canvasRect.left + padding ||
        titleRect.right > canvasRect.right - padding ||
        titleRect.top < canvasRect.top + padding ||
        titleRect.bottom > canvasRect.bottom - padding,
      );
    };

    const frame = window.requestAnimationFrame(check);
    const observer = new ResizeObserver(check);
    observer.observe(canvas);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [content.title, platform.height, platform.width, style]);

  const patchContent = (patch: Partial<CoverContent>) => {
    setContent((current) => ({ ...current, ...patch }));
  };

  const patchStyle = (patch: Partial<CoverStyle>) => {
    setStyle((current) => ({ ...current, ...patch }));
  };

  const toggleSection = (id: SectionId) => {
    setCollapsedSections((current) => ({
      ...current,
      [id]: !current[id],
    }));
  };

  const onTemplateChange = (templateId: TemplateId) => {
    const template = templates.find((item) => item.id === templateId);
    setStyle((current) => resetLayoutForTemplate(current, templateId, template?.defaultThemeId ?? current.themeId));
  };

  const onImageUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      patchStyle({
        image: {
          ...style.image,
          src: typeof reader.result === 'string' ? reader.result : null,
        },
      });
    };
    reader.readAsDataURL(file);
  };

  const onFontUpload = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      patchStyle({
        fontFamily: 'custom',
        customFontName: file.name,
        customFontDataUrl: typeof reader.result === 'string' ? reader.result : null,
      });
    };
    reader.readAsDataURL(file);
  };

  const moveImage = (dx: number, dy: number) => {
    patchStyle({
      image: {
        ...style.image,
        x: Math.max(-50, Math.min(50, style.image.x + dx)),
        y: Math.max(-50, Math.min(50, style.image.y + dy)),
      },
    });
  };

  const centerImage = () => {
    patchStyle({
      image: {
        ...style.image,
        x: 0,
        y: 0,
      },
    });
  };

  const addSticker = (assetId: string, x = 50, y = 50) => {
    const id = createStickerId();
    const sticker: StickerInstance = {
      id,
      assetId,
      x,
      y,
      scale: 1,
      rotate: 0,
      opacity: 1,
    };
    setStyle((current) => ({
      ...current,
      stickers: [...current.stickers, sticker],
      showStickers: true,
    }));
    setSelectedStickerId(id);
  };

  const updateSticker = (id: string, patch: Partial<StickerInstance>) => {
    setStyle((current) => ({
      ...current,
      stickers: current.stickers.map((sticker) => (
        sticker.id === id
          ? {
              ...sticker,
              ...patch,
              x: patch.x === undefined ? sticker.x : clamp(patch.x, 0, 100),
              y: patch.y === undefined ? sticker.y : clamp(patch.y, 0, 100),
              scale: patch.scale === undefined ? sticker.scale : clamp(patch.scale, 0.35, 2.4),
              rotate: patch.rotate === undefined ? sticker.rotate : clamp(patch.rotate, -180, 180),
              opacity: patch.opacity === undefined ? sticker.opacity : clamp(patch.opacity, 0.15, 1),
            }
          : sticker
      )),
    }));
  };

  const removeSticker = (id: string) => {
    setStyle((current) => ({
      ...current,
      stickers: current.stickers.filter((sticker) => sticker.id !== id),
    }));
    setSelectedStickerId((current) => {
      if (current !== id) return current;
      const nextSticker = style.stickers.find((sticker) => sticker.id !== id);
      return nextSticker?.id ?? null;
    });
  };

  const clearStickers = () => {
    patchStyle({ stickers: [] });
    setSelectedStickerId(null);
  };

  const onStickerPointerDown = (id: string, event: ReactPointerEvent<HTMLElement>) => {
    const canvas = coverRef.current;
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedStickerId(id);

    const sticker = style.stickers.find((item) => item.id === id);
    if (!sticker) return;

    const canvasRect = canvas.getBoundingClientRect();
    const startClientX = event.clientX;
    const startClientY = event.clientY;
    const startX = sticker.x;
    const startY = sticker.y;

    const move = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startClientX) / canvasRect.width) * 100;
      const dy = ((moveEvent.clientY - startClientY) / canvasRect.height) * 100;
      updateSticker(id, {
        x: startX + dx,
        y: startY + dy,
      });
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const getCurrentElementPositionBounds = (key: TextElementKey, origin = style.elementPositions[key]): PositionBounds => {
    const canvas = coverRef.current;
    const element = canvas?.querySelector(getTextElementSelector(key));
    if (!canvas || !(element instanceof HTMLElement)) return DEFAULT_ELEMENT_POSITION_BOUNDS;
    return getElementPositionBounds(canvas.getBoundingClientRect(), element.getBoundingClientRect(), origin);
  };

  const updateElementPosition = (
    key: TextElementKey,
    patch: Partial<{ x: number; y: number }>,
    bounds = getCurrentElementPositionBounds(key),
  ) => {
    setStyle((current) => ({
      ...current,
      elementPositions: {
        ...current.elementPositions,
        [key]: clampElementPosition(
          {
            ...current.elementPositions[key],
            ...patch,
          },
          bounds,
        ),
      },
    }));
  };

  const resetElementPosition = (key: TextElementKey) => {
    updateElementPosition(key, { x: 0, y: 0 });
  };

  const resetAllElementPositions = () => {
    patchStyle({ elementPositions: createDefaultElementPositions() });
  };

  const onCanvasElementPointerDown = (key: TextElementKey, event: ReactPointerEvent<HTMLElement>) => {
    const canvas = coverRef.current;
    if (!canvas) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedTextElement(key);

    const start = style.elementPositions[key];
    const canvasRect = canvas.getBoundingClientRect();
    const targetElement = getTextElementFromEventTarget(event.target, key);
    const bounds = targetElement
      ? getElementPositionBounds(canvasRect, targetElement.getBoundingClientRect(), start)
      : DEFAULT_ELEMENT_POSITION_BOUNDS;
    const startClientX = event.clientX;
    const startClientY = event.clientY;

    const move = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startClientX) / canvasRect.width) * 100;
      const dy = ((moveEvent.clientY - startClientY) / canvasRect.height) * 100;
      updateElementPosition(key, {
        x: start.x + dx,
        y: start.y + dy,
      }, bounds);
    };

    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const onCustomAccentColorChange = (color: string) => {
    setCustomAccentColor(color);
    patchStyle({ themeId: 'custom-theme' });
  };

  const onCustomBackgroundColorChange = (color: string) => {
    setCustomBackgroundColor(color);
    patchStyle({ themeId: 'custom-theme' });
  };

  const updateTextColor = (key: TextElementKey, color: string) => {
    patchStyle({
      textColors: {
        ...style.textColors,
        [key]: color,
      },
    });
  };

  const resetTextColor = (key: TextElementKey) => {
    updateTextColor(key, 'auto');
  };

  const onExport = async () => {
    if (!coverRef.current) return;
    await exportCoverAsPng(
      coverRef.current,
      platform.width,
      platform.height,
      buildFileName(content, platform),
    );
  };

  const onFeedback = () => {
    const issueUrl = buildFeedbackUrl({
      title: `Feedback: ${platform.shortName} / ${templates.find((item) => item.id === style.templateId)?.name ?? style.templateId}`,
      body: [
        'Please describe the suggestion, bug, or workflow issue here.',
        '',
        '---',
        `Platform: ${platform.id} (${platform.width}x${platform.height})`,
        `Template: ${style.templateId}`,
        `Theme: ${style.themeId}`,
        `Font: ${style.fontFamily}`,
        `Browser: ${navigator.userAgent}`,
      ].join('\n'),
    });
    window.open(issueUrl, '_blank', 'noopener,noreferrer');
  };

  const saveCurrentLayoutAsTemplateDefault = async () => {
    try {
      const positions = getEffectiveElementPositions(coverRef.current, style.elementPositions);
      const response = await fetch('/api/template-layout-defaults', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateId: style.templateId,
          platformId: platform.id,
          positions,
        }),
      });
      const result = await response.json().catch(() => ({ ok: false, error: '响应格式错误' }));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || '写入失败');
      }
      setStyle((current) => ({
        ...current,
        elementPositions: createDefaultElementPositions(),
      }));
      showSaveTip('已写入当前模板默认布局', 'success');
    } catch (error) {
      showSaveTip(error instanceof Error ? `写入失败：${error.message}` : '写入失败', 'error');
    }
  };

  const fitTitleToCanvas = () => {
    patchStyle({
      titleSize: Math.max(0.62, style.titleSize * 0.88),
      titleLineHeight: Math.max(0.95, Math.min(style.titleLineHeight, 1.08)),
      titleWidth: Math.min(96, Math.max(style.titleWidth, 86)),
      elementPositions: {
        ...style.elementPositions,
        title: {
          x: Math.max(-20, Math.min(20, style.elementPositions.title.x)),
          y: Math.max(-20, Math.min(20, style.elementPositions.title.y)),
        },
      },
    });
  };

  const reset = () => {
    const currentTemplate = templates.find((item) => item.id === style.templateId);
    setContent(defaultContent);
    setStyle({
      ...defaultStyle,
      platformId: style.platformId,
      templateId: style.templateId,
      themeId: currentTemplate?.defaultThemeId ?? style.themeId,
    });
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures.
    }
  };

  return (
    <div className={`app-shell ui-theme-${uiTheme}`}>
      <header className="topbar">
        <div className="brand-mark">
          <Sparkles size={18} />
          <div>
            <strong>Cover Pro</strong>
            <span>封面工具</span>
          </div>
        </div>

        <div className="dimension-pill">
          {platform.shortName}
          <span>{platform.width} x {platform.height}</span>
        </div>

        {saveTip && (
          <div className={`save-tip ${saveTip.tone === 'error' ? 'error' : ''}`} role="status">
            {saveTip.text}
          </div>
        )}

        {hasTextOverflow && (
          <button className="warning-pill" type="button" onClick={fitTitleToCanvas}>
            标题可能超出安全区，点击适配
          </button>
        )}

        <div className="topbar-actions">
          <a
            className="ghost-button"
            href={coverToolFeatures.githubRepositoryUrl}
            target="_blank"
            rel="noreferrer"
            title="GitHub 仓库"
            aria-label="打开 GitHub 仓库"
          >
            <Github size={16} />
            GitHub
          </a>
          <button className="ghost-button feedback-button" type="button" onClick={onFeedback}>
            <MessageSquareIcon />
            反馈
          </button>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setUiTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            {uiTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            {uiTheme === 'dark' ? '' : ''}
          </button>
          <button className="ghost-button" type="button" onClick={() => patchStyle({ showSafeArea: !style.showSafeArea })}>
            {style.showSafeArea ? <EyeOff size={16} /> : <Eye size={16} />}
            {style.showSafeArea ? '隐藏安全区' : '显示安全区'}
          </button>
          <button className="ghost-button" type="button" onClick={reset}>
            <RotateCcw size={16} />
            重置
          </button>
          <button className="primary-button" type="button" onClick={onExport}>
            <Download size={16} />
            下载 PNG
          </button>
        </div>
      </header>

      <main className="workspace">
        <aside className="panel left-panel">
          <CollapsibleSection
            title="平台尺寸"
            summary={`${platform.shortName} · ${platform.width}x${platform.height}`}
            icon={<Monitor size={16} />}
            collapsed={collapsedSections.platform}
            active={style.platformId !== defaultStyle.platformId}
            onToggle={() => toggleSection('platform')}
          >
            <div className="platform-grid">
              {platforms.map((item) => (
                <button
                  className={`platform-card ${item.id === platform.id ? 'active' : ''}`}
                  key={item.id}
                  type="button"
                  onClick={() => patchStyle({ platformId: item.id })}
                >
                  <span>{item.shortName}</span>
                  <small>{item.width} x {item.height}</small>
                </button>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="封面内容"
            summary={content.title}
            icon={<Type size={16} />}
            collapsed={collapsedSections.content}
            active={content.title !== defaultContent.title || content.label !== defaultContent.label}
            onToggle={() => toggleSection('content')}
          >
            <label className="field">
              <span>标签</span>
              <textarea value={content.label} rows={2} onChange={(event) => patchContent({ label: event.target.value })} />
            </label>
            <label className="field">
              <span>主标题</span>
              <textarea value={content.title} rows={4} onChange={(event) => patchContent({ title: event.target.value })} />
            </label>
            <label className="field">
              <span>副标题</span>
              <textarea value={content.subtitle} rows={3} onChange={(event) => patchContent({ subtitle: event.target.value })} />
            </label>
            <div className="field-pair">
              <label className="field">
                <span>图形文字</span>
                <textarea value={content.graphicText} rows={2} onChange={(event) => patchContent({ graphicText: event.target.value })} />
              </label>
            </div>
            <div className="field-pair">
              <label className="field">
                <span>账号</span>
                <textarea value={content.author} rows={2} onChange={(event) => patchContent({ author: event.target.value })} />
              </label>
              <label className="field">
                <span>徽章</span>
                <textarea value={content.badge} rows={2} onChange={(event) => patchContent({ badge: event.target.value })} />
              </label>
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="图片素材"
            summary={style.image.src ? '已上传，可替换或移除' : '上传 Logo / 截图'}
            icon={<ImageIcon size={16} />}
            collapsed={collapsedSections.asset}
            active={Boolean(style.image.src)}
            onToggle={() => toggleSection('asset')}
          >
            <label className="upload-box">
              <ImagePlus size={18} />
              <span>{style.image.src ? '替换 Logo / 截图' : '上传 Logo / 截图'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => onImageUpload(event.target.files?.[0] ?? null)}
              />
            </label>
            {style.image.src && (
              <button
                className="ghost-button full-width"
                type="button"
                onClick={() => patchStyle({ image: { ...defaultStyle.image } })}
              >
                删除图片
              </button>
            )}
          </CollapsibleSection>
        </aside>

        <PreviewStage platform={platform}>
          <CoverCanvas
            ref={coverRef}
            content={content}
            style={style}
            platform={platform}
            theme={theme}
            onElementPointerDown={onCanvasElementPointerDown}
            onStickerPointerDown={onStickerPointerDown}
            onStickerRemove={removeSticker}
            onStickerDrop={addSticker}
            selectedStickerId={selectedStickerId}
          />
        </PreviewStage>

        <aside className="panel right-panel">
          <CollapsibleSection
            title="模板"
            summary={templates.find((item) => item.id === style.templateId)?.name ?? 'Template'}
            icon={<Layers size={16} />}
            collapsed={collapsedSections.template}
            active={style.templateId !== defaultStyle.templateId}
            onToggle={() => toggleSection('template')}
          >
            <div className="template-list">
              {templates.map((item) => (
                <button
                  className={`template-card ${item.id === style.templateId ? 'active' : ''}`}
                  key={item.id}
                  type="button"
                  onClick={() => onTemplateChange(item.id)}
                >
                  <span className="template-card-copy">
                    <strong>{item.name}</strong>
                    <span>{item.description}</span>
                  </span>
                  <TemplatePreview id={item.id} />
                </button>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="贴图"
            summary={style.stickers.length > 0 ? `${style.stickers.length} 个贴图` : '拖到画布或点击添加'}
            icon={<Sticker size={16} />}
            collapsed={collapsedSections.stickers}
            active={style.stickers.length > 0}
            onToggle={() => toggleSection('stickers')}
          >
            <div className="sticker-palette">
              {stickerAssets.map((asset) => (
                <button
                  className="sticker-palette-item"
                  key={asset.id}
                  type="button"
                  draggable
                  onClick={() => addSticker(asset.id)}
                  onDragStart={(event) => {
                    event.dataTransfer.setData('application/x-cover-pro-sticker', asset.id);
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                  title={`添加${asset.name}`}
                  aria-label={`添加${asset.name}贴图`}
                >
                  <StickerPreview assetId={asset.id} />
                  <span>{asset.name}</span>
                </button>
              ))}
            </div>

            {style.stickers.length > 0 && (
              <>
                <SelectRow
                  label="当前"
                  value={selectedStickerId ?? style.stickers[0].id}
                  onChange={(value) => setSelectedStickerId(value)}
                  options={style.stickers.map((sticker, index) => ({
                    value: sticker.id,
                    label: `${index + 1}. ${getStickerAsset(sticker.assetId).name}`,
                  }))}
                />
                {selectedStickerId && style.stickers.some((sticker) => sticker.id === selectedStickerId) && (
                  <StickerControls
                    sticker={style.stickers.find((sticker) => sticker.id === selectedStickerId)!}
                    onChange={(patch) => updateSticker(selectedStickerId, patch)}
                    onRemove={() => removeSticker(selectedStickerId)}
                  />
                )}
                <button className="ghost-button full-width" type="button" onClick={clearStickers}>
                  <Trash2 size={15} />
                  清空贴图
                </button>
              </>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="主题色"
            summary={theme.name}
            icon={<Palette size={16} />}
            collapsed={collapsedSections.theme}
            active={style.themeId !== defaultStyle.themeId}
            onToggle={() => toggleSection('theme')}
          >
            <div className="theme-grid">
              {themeOptions.map((item) => (
                <button
                  className={`theme-chip ${item.id === style.themeId ? 'active' : ''}`}
                  key={item.id}
                  type="button"
                  onClick={() => patchStyle({ themeId: item.id })}
                  style={{ '--chip-accent': item.accent, '--chip-bg': item.background } as CSSProperties}
                >
                  <span />
                  {item.name}
                </button>
              ))}
            </div>
            <label className={`custom-color-row ${style.themeId === 'custom-theme' ? 'active' : ''}`}>
              <span>自定义主色</span>
              <input
                type="color"
                value={customAccentColor}
                onChange={(event) => onCustomAccentColorChange(event.target.value)}
              />
              <code>{customAccentColor.toUpperCase()}</code>
            </label>
            <label className={`custom-color-row ${style.themeId === 'custom-theme' ? 'active' : ''}`}>
              <span>自定义背景</span>
              <input
                type="color"
                value={customBackgroundColor}
                onChange={(event) => onCustomBackgroundColorChange(event.target.value)}
              />
              <code>{customBackgroundColor.toUpperCase()}</code>
            </label>
          </CollapsibleSection>

          <CollapsibleSection
            title="文本颜色"
            summary={Object.values(style.textColors).some((color) => color !== 'auto') ? '已自定义文字色' : '跟随模板'}
            icon={<Palette size={16} />}
            collapsed={collapsedSections.textColor}
            active={Object.values(style.textColors).some((color) => color !== 'auto')}
            onToggle={() => toggleSection('textColor')}
          >
            <TextColorRow label="标签" color={style.textColors.label} fallback={theme.accent} onChange={(color) => updateTextColor('label', color)} onReset={() => resetTextColor('label')} />
            <TextColorRow label="主标题" color={style.textColors.title} fallback={theme.foreground} onChange={(color) => updateTextColor('title', color)} onReset={() => resetTextColor('title')} />
            <TextColorRow label="副标题" color={style.textColors.subtitle} fallback={theme.muted} onChange={(color) => updateTextColor('subtitle', color)} onReset={() => resetTextColor('subtitle')} />
            <TextColorRow label="账号" color={style.textColors.author} fallback={theme.muted} onChange={(color) => updateTextColor('author', color)} onReset={() => resetTextColor('author')} />
            <TextColorRow label="徽章" color={style.textColors.badge} fallback={theme.accent} onChange={(color) => updateTextColor('badge', color)} onReset={() => resetTextColor('badge')} />
            <TextColorRow label="图形文字" color={style.textColors.graphic} fallback={theme.accent} onChange={(color) => updateTextColor('graphic', color)} onReset={() => resetTextColor('graphic')} />
          </CollapsibleSection>

          <CollapsibleSection
            title="排版"
            summary={`标题 ${style.titleSize.toFixed(2)}x`}
            icon={<SlidersHorizontal size={16} />}
            collapsed={collapsedSections.typography}
            active={
              style.titleSize !== defaultStyle.titleSize ||
              style.titleLineHeight !== defaultStyle.titleLineHeight ||
              style.titleLetterSpacing !== defaultStyle.titleLetterSpacing ||
              style.titleWeight !== defaultStyle.titleWeight ||
              style.titleWidth !== defaultStyle.titleWidth ||
              style.subtitleSize !== defaultStyle.subtitleSize ||
              style.subtitleLineHeight !== defaultStyle.subtitleLineHeight ||
              style.subtitleSpacing !== defaultStyle.subtitleSpacing ||
              style.subtitleWidth !== defaultStyle.subtitleWidth ||
              style.textAlign !== defaultStyle.textAlign ||
              style.fontFamily !== defaultStyle.fontFamily ||
              style.titleX !== defaultStyle.titleX ||
              style.titleY !== defaultStyle.titleY ||
              style.backgroundBrightness !== defaultStyle.backgroundBrightness
            }
            onToggle={() => toggleSection('typography')}
          >
            <ControlGroup title="整体文字">
              <SelectRow
                label="字体"
                value={style.fontFamily}
                onChange={(fontFamily) => patchStyle({ fontFamily: fontFamily as CoverStyle['fontFamily'] })}
                options={[
                  { value: 'system', label: '系统黑体' },
                  { value: 'display', label: '粗标题体' },
                  { value: 'art-rounded', label: '圆润艺术' },
                  { value: 'art-condensed', label: '窄体海报' },
                  { value: 'brush', label: '书法手写' },
                  { value: 'handwritten', label: '手写涂鸦' },
                  { value: 'serif', label: '宋体/衬线' },
                  { value: 'mono', label: '代码等宽' },
                  { value: 'custom', label: style.customFontName ? `上传字体：${style.customFontName}` : '上传字体' },
                ]}
              />
              <label className={`font-upload-row ${style.fontFamily === 'custom' ? 'active' : ''}`}>
                <span>上传字体</span>
                <strong>{style.customFontName || 'TTF / OTF / WOFF'}</strong>
                <input
                  type="file"
                  accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
                  onChange={(event) => onFontUpload(event.target.files?.[0] ?? null)}
                />
              </label>
              <SelectRow
                label="对齐"
                value={style.textAlign}
                onChange={(textAlign) => patchStyle({ textAlign: textAlign as CoverStyle['textAlign'] })}
                options={[
                  { value: 'left', label: '左对齐' },
                  { value: 'center', label: '居中' },
                  { value: 'right', label: '右对齐' },
                ]}
              />
              <Slider label="整体水平" min={-45} max={45} step={1} value={style.titleX} onChange={(value) => patchStyle({ titleX: value })} />
              <Slider label="整体垂直" min={-45} max={45} step={1} value={style.titleY} onChange={(value) => patchStyle({ titleY: value })} />
            </ControlGroup>

            <ControlGroup title="主标题">
              <Slider label="字号" min={0.62} max={1.6} step={0.01} value={style.titleSize} onChange={(value) => patchStyle({ titleSize: value })} />
              <Slider label="行高" min={0.86} max={1.45} step={0.01} value={style.titleLineHeight} onChange={(value) => patchStyle({ titleLineHeight: value })} />
              <Slider label="字距" min={-0.04} max={0.16} step={0.005} value={style.titleLetterSpacing} onChange={(value) => patchStyle({ titleLetterSpacing: value })} />
              <Slider label="字重" min={400} max={900} step={100} value={style.titleWeight} onChange={(value) => patchStyle({ titleWeight: value })} />
              <Slider label="宽度" min={42} max={96} step={1} value={style.titleWidth} onChange={(value) => patchStyle({ titleWidth: value })} />
            </ControlGroup>

            <ControlGroup title="副标题">
              <Slider label="字号" min={0.68} max={1.45} step={0.01} value={style.subtitleSize} onChange={(value) => patchStyle({ subtitleSize: value })} />
              <Slider label="行高" min={1.05} max={1.9} step={0.01} value={style.subtitleLineHeight} onChange={(value) => patchStyle({ subtitleLineHeight: value })} />
              <Slider label="上间距" min={0.6} max={7} step={0.1} value={style.subtitleSpacing} onChange={(value) => patchStyle({ subtitleSpacing: value })} />
              <Slider label="宽度" min={38} max={96} step={1} value={style.subtitleWidth} onChange={(value) => patchStyle({ subtitleWidth: value })} />
            </ControlGroup>

            <ControlGroup title="画面">
              <Slider label="背景亮度" min={-25} max={25} step={1} value={style.backgroundBrightness} onChange={(value) => patchStyle({ backgroundBrightness: value })} />
            </ControlGroup>
          </CollapsibleSection>

          <CollapsibleSection
            title="元素位置"
            summary={`${getTextElementLabel(selectedTextElement)} · X ${style.elementPositions[selectedTextElement].x} / Y ${style.elementPositions[selectedTextElement].y}`}
            icon={<Move size={16} />}
            collapsed={collapsedSections.elementPosition}
            active={Object.values(style.elementPositions).some((position) => position.x !== 0 || position.y !== 0)}
            onToggle={() => toggleSection('elementPosition')}
          >
            <SelectRow
              label="元素"
              value={selectedTextElement}
              onChange={(value) => setSelectedTextElement(value as TextElementKey)}
              options={[
                { value: 'label', label: '标签' },
                { value: 'title', label: '主标题' },
                { value: 'subtitle', label: '副标题' },
                { value: 'author', label: '账号' },
                { value: 'badge', label: '徽章' },
                { value: 'graphic', label: '图形文字' },
              ]}
            />
            <Slider
              label="水平"
              min={-120}
              max={120}
              step={1}
              value={style.elementPositions[selectedTextElement].x}
              onChange={(x) => updateElementPosition(selectedTextElement, { x })}
            />
            <Slider
              label="垂直"
              min={-120}
              max={120}
              step={1}
              value={style.elementPositions[selectedTextElement].y}
              onChange={(y) => updateElementPosition(selectedTextElement, { y })}
            />
            <button className="ghost-button full-width" type="button" onClick={() => resetElementPosition(selectedTextElement)}>
              重置当前元素位置
            </button>
            {coverToolFeatures.enableTemplateLayoutDebug && (
              <button className="ghost-button full-width" type="button" onClick={saveCurrentLayoutAsTemplateDefault}>
                调试：写入当前模板默认布局
              </button>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="显示内容"
            summary={getVisibilitySummary(style)}
            icon={<Eye size={16} />}
            collapsed={collapsedSections.visibility}
            active={
              style.showLabel !== defaultStyle.showLabel ||
              style.showSubtitle !== defaultStyle.showSubtitle ||
              style.showAuthor !== defaultStyle.showAuthor ||
              style.showBadge !== defaultStyle.showBadge ||
              style.showGraphicText !== defaultStyle.showGraphicText ||
              style.showImage !== defaultStyle.showImage ||
              style.showStickers !== defaultStyle.showStickers ||
              style.showSafeArea !== defaultStyle.showSafeArea
            }
            onToggle={() => toggleSection('visibility')}
          >
            <Toggle label="标签" checked={style.showLabel} onChange={(showLabel) => patchStyle({ showLabel })} />
            <Toggle label="副标题" checked={style.showSubtitle} onChange={(showSubtitle) => patchStyle({ showSubtitle })} />
            <Toggle label="账号" checked={style.showAuthor} onChange={(showAuthor) => patchStyle({ showAuthor })} />
            <Toggle label="徽章" checked={style.showBadge} onChange={(showBadge) => patchStyle({ showBadge })} />
            <Toggle label="图形文字" checked={style.showGraphicText} onChange={(showGraphicText) => patchStyle({ showGraphicText })} />
            <Toggle label="图片" checked={style.showImage} onChange={(showImage) => patchStyle({ showImage })} icon={<ImageIcon size={15} />} />
            <Toggle label="贴图" checked={style.showStickers} onChange={(showStickers) => patchStyle({ showStickers })} icon={<Sticker size={15} />} />
            <Toggle label="安全区" checked={style.showSafeArea} onChange={(showSafeArea) => patchStyle({ showSafeArea })} icon={<Shield size={15} />} />
          </CollapsibleSection>

          <CollapsibleSection
            title="装饰与图片"
            summary={`${style.decorationDensity === 'low' ? '低' : style.decorationDensity === 'medium' ? '中' : '高'}密度 · 图片 ${style.image.scale.toFixed(2)}x`}
            icon={<ImageIcon size={16} />}
            collapsed={collapsedSections.decor}
            active={
              style.decorationDensity !== defaultStyle.decorationDensity ||
              style.image.scale !== defaultStyle.image.scale ||
              style.image.x !== defaultStyle.image.x ||
              style.image.y !== defaultStyle.image.y
            }
            onToggle={() => toggleSection('decor')}
          >
            <div className="segmented">
              {(['low', 'medium', 'high'] as const).map((density) => (
                <button
                  key={density}
                  className={style.decorationDensity === density ? 'active' : ''}
                  type="button"
                  onClick={() => patchStyle({ decorationDensity: density })}
                >
                  {density === 'low' ? '低' : density === 'medium' ? '中' : '高'}
                </button>
              ))}
            </div>
            <Slider label="图片大小" min={0.55} max={1.8} step={0.01} value={style.image.scale} onChange={(scale) => patchStyle({ image: { ...style.image, scale } })} />
            <div className="nudge-pad" aria-label="图片位置微调">
              <button type="button" className="up" title="向上移动" onClick={() => moveImage(0, -4)}>
                <ArrowUp size={16} />
              </button>
              <button type="button" className="left" title="向左移动" onClick={() => moveImage(-4, 0)}>
                <ArrowLeft size={16} />
              </button>
              <button type="button" className="center" title="图片居中" onClick={centerImage}>
                <LocateFixed size={16} />
              </button>
              <button type="button" className="right" title="向右移动" onClick={() => moveImage(4, 0)}>
                <ArrowRight size={16} />
              </button>
              <button type="button" className="down" title="向下移动" onClick={() => moveImage(0, 4)}>
                <ArrowDown size={16} />
              </button>
            </div>
            <Slider label="图片水平" min={-50} max={50} step={1} value={style.image.x} onChange={(x) => patchStyle({ image: { ...style.image, x } })} />
            <Slider label="图片垂直" min={-50} max={50} step={1} value={style.image.y} onChange={(y) => patchStyle({ image: { ...style.image, y } })} />
          </CollapsibleSection>
        </aside>
      </main>
    </div>
  );
}

type CollapsibleSectionProps = {
  title: string;
  summary: string;
  icon: ReactNode;
  collapsed: boolean;
  active?: boolean;
  onToggle: () => void;
  children: ReactNode;
};

function CollapsibleSection({
  title,
  summary,
  icon,
  collapsed,
  active = false,
  onToggle,
  children,
}: CollapsibleSectionProps) {
  return (
    <section className={`panel-section ${collapsed ? 'collapsed' : ''} ${active ? 'active' : ''}`}>
      <button className="section-trigger" type="button" onClick={onToggle} aria-expanded={!collapsed}>
        <span className="section-icon">{icon}</span>
        <span className="section-heading">
          <strong>{title}</strong>
          <small>{summary || '默认设置'}</small>
        </span>
        <ChevronDown className="section-chevron" size={16} />
      </button>
      {!collapsed && <div className="section-body">{children}</div>}
    </section>
  );
}

function TemplatePreview({ id }: { id: TemplateId }) {
  return (
    <span className={`template-preview template-preview-${id}`} aria-hidden="true">
      <i className="tp-bg" />
      <i className="tp-line one" />
      <i className="tp-line two" />
      <i className="tp-chip" />
      <i className="tp-shape" />
      <i className="tp-extra" />
    </span>
  );
}

function StickerPreview({ assetId }: { assetId: string }) {
  const asset = getStickerAsset(assetId);
  return (
    <span
      className={`sticker-preview sticker-preview-${asset.kind}`}
      style={{
        '--sticker-color': asset.color,
        '--sticker-color-2': asset.color2,
      } as CSSProperties}
      aria-hidden="true"
    >
      {asset.kind === 'arrow' && (
        <svg viewBox="0 0 120 80">
          <path className="sticker-fill" d="M78 8 114 40 78 72V52H8V28h70V8Z" />
        </svg>
      )}
      {asset.kind === 'ring' && (
        <svg viewBox="0 0 120 120">
          <ellipse className="sticker-stroke" cx="60" cy="60" rx="44" ry="31" transform="rotate(-16 60 60)" />
          <path className="sticker-sheen" d="M83 29 96 20M94 39l16-2M35 90l-14 9" />
        </svg>
      )}
      {asset.kind === 'bubble' && (
        <svg viewBox="0 0 130 92">
          <path className="sticker-fill" d="M14 14h102c8 0 14 6 14 14v29c0 8-6 14-14 14H66L43 88l6-17H14C6 71 0 65 0 57V28c0-8 6-14 14-14Z" />
          <text x="65" y="51" textAnchor="middle">{asset.label}</text>
        </svg>
      )}
      {asset.kind === 'spark' && (
        <svg viewBox="0 0 120 120">
          <path className="sticker-fill" d="M60 6 73 45l41 15-41 15-13 39-13-39L6 60l41-15L60 6Z" />
          <path className="sticker-secondary" d="M94 7l5 16 15 5-15 5-5 16-5-16-15-5 15-5 5-16Z" />
        </svg>
      )}
      {asset.kind === 'tag' && (
        <svg viewBox="0 0 132 76">
          <path className="sticker-fill" d="M8 0h116l-13 38 13 38H8c-4 0-8-4-8-8V8c0-4 4-8 8-8Z" />
          <text x="55" y="47" textAnchor="middle">{asset.label}</text>
        </svg>
      )}
      {asset.kind === 'burst' && (
        <svg viewBox="0 0 120 120">
          <path className="sticker-fill" d="M60 4 72 28l26-12-7 28 28 8-25 16 18 23-30-1-3 30-19-22-19 22-3-30-30 1 18-23L1 52l28-8-7-28 26 12L60 4Z" />
          <text x="60" y="69" textAnchor="middle">{asset.label}</text>
        </svg>
      )}
    </span>
  );
}

type StickerControlsProps = {
  sticker: StickerInstance;
  onChange: (patch: Partial<StickerInstance>) => void;
  onRemove: () => void;
};

function StickerControls({ sticker, onChange, onRemove }: StickerControlsProps) {
  return (
    <ControlGroup title="当前贴图">
      <Slider label="水平" min={0} max={100} step={1} value={sticker.x} onChange={(x) => onChange({ x })} />
      <Slider label="垂直" min={0} max={100} step={1} value={sticker.y} onChange={(y) => onChange({ y })} />
      <Slider label="大小" min={0.35} max={2.4} step={0.01} value={sticker.scale} onChange={(scale) => onChange({ scale })} />
      <Slider label="旋转" min={-180} max={180} step={1} value={sticker.rotate} onChange={(rotate) => onChange({ rotate })} />
      <Slider label="透明" min={0.15} max={1} step={0.01} value={sticker.opacity} onChange={(opacity) => onChange({ opacity })} />
      <button className="ghost-button full-width" type="button" onClick={onRemove}>
        <Trash2 size={15} />
        删除当前贴图
      </button>
    </ControlGroup>
  );
}

type SliderProps = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

type SelectRowProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
};

type ControlGroupProps = {
  title: string;
  children: ReactNode;
};

function ControlGroup({ title, children }: ControlGroupProps) {
  return (
    <div className="control-group">
      <div className="control-group-title">{title}</div>
      {children}
    </div>
  );
}

function SelectRow({ label, value, options, onChange }: SelectRowProps) {
  return (
    <label className="select-row">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Slider({ label, min, max, step, value, onChange }: SliderProps) {
  return (
    <label className="slider-row">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small>{Number.isInteger(value) ? value : value.toFixed(2)}</small>
    </label>
  );
}

type TextColorRowProps = {
  label: string;
  color: string;
  fallback: string;
  onChange: (color: string) => void;
  onReset: () => void;
};

function TextColorRow({ label, color, fallback, onChange, onReset }: TextColorRowProps) {
  const isAuto = color === 'auto';
  const value = isAuto ? fallback : color;

  return (
    <div className={`text-color-row ${isAuto ? '' : 'active'}`}>
      <span>{label}</span>
      <input type="color" value={normalizeColor(value)} onChange={(event) => onChange(event.target.value)} aria-label={`${label}颜色`} />
      <code>{isAuto ? 'AUTO' : color.toUpperCase()}</code>
      <button type="button" onClick={onReset}>自动</button>
    </div>
  );
}

function normalizeColor(color: string) {
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color : '#ffffff';
}

type ToggleProps = {
  label: string;
  checked: boolean;
  icon?: ReactNode;
  onChange: (checked: boolean) => void;
};

function Toggle({ label, checked, icon, onChange }: ToggleProps) {
  return (
    <button className={`toggle-row ${checked ? 'active' : ''}`} type="button" onClick={() => onChange(!checked)}>
      <span>{icon}{label}</span>
      <i />
    </button>
  );
}

function MessageSquareIcon() {
  return (
    <svg className="button-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 5.5h14v10H9.4L5 19.2V5.5Z" />
    </svg>
  );
}

function getVisibilitySummary(style: CoverStyle) {
  const visible = [
    style.showLabel && '标签',
    style.showSubtitle && '副标题',
    style.showAuthor && '账号',
    style.showBadge && '徽章',
    style.showGraphicText && '图形文字',
    style.showImage && '图片',
    style.showStickers && '贴图',
    style.showSafeArea && '安全区',
  ].filter(Boolean);
  return visible.length > 0 ? visible.join(' / ') : '全部隐藏';
}

function getEffectiveElementPositions(
  canvas: HTMLElement | null,
  positions: CoverStyle['elementPositions'],
): CoverStyle['elementPositions'] {
  if (!canvas) return positions;
  const template = canvas.querySelector('.template');
  const styles = window.getComputedStyle(template instanceof HTMLElement ? template : canvas);
  return {
    label: addBasePosition(styles, 'label', positions.label),
    title: addBasePosition(styles, 'title', positions.title),
    subtitle: addBasePosition(styles, 'subtitle', positions.subtitle),
    author: addBasePosition(styles, 'author', positions.author),
    badge: addBasePosition(styles, 'badge', positions.badge),
    graphic: addBasePosition(styles, 'graphic', positions.graphic),
  };
}

function addBasePosition(styles: CSSStyleDeclaration, key: TextElementKey, position: { x: number; y: number }) {
  return {
    x: readCssNumber(styles.getPropertyValue(`--base-${key}-x`)) + position.x,
    y: readCssNumber(styles.getPropertyValue(`--base-${key}-y`)) + position.y,
  };
}

function readCssNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTextElementLabel(key: TextElementKey) {
  const labels: Record<TextElementKey, string> = {
    label: '标签',
    title: '主标题',
    subtitle: '副标题',
    author: '账号',
    badge: '徽章',
    graphic: '图形文字',
  };
  return labels[key];
}

function loadDraft(): DraftState | null {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<DraftState>;
    const parsedStyle: Partial<CoverStyle> = parsed.style || {};
    let templateId: TemplateId = defaultStyle.templateId;
    if (parsedStyle.templateId && templates.some((item) => item.id === parsedStyle.templateId)) {
      templateId = parsedStyle.templateId;
    }
    return {
      content: {
        ...defaultContent,
        ...(parsed.content || {}),
      },
      style: {
        ...defaultStyle,
        ...parsedStyle,
        templateId,
        image: {
          ...defaultStyle.image,
          ...(parsedStyle.image || {}),
        },
        stickers: Array.isArray(parsedStyle.stickers) ? parsedStyle.stickers : defaultStyle.stickers,
        showStickers: parsedStyle.showStickers ?? defaultStyle.showStickers,
        elementPositions: mergeElementPositions(parsedStyle.elementPositions),
        textColors: {
          ...defaultStyle.textColors,
          ...(parsedStyle.textColors || {}),
        },
      },
      uiTheme: parsed.uiTheme === 'dark' || parsed.uiTheme === 'light' ? parsed.uiTheme : 'light',
      customAccentColor: parsed.customAccentColor || '#00E5FF',
      customBackgroundColor: parsed.customBackgroundColor || '#07130C',
    };
  } catch {
    return null;
  }
}

function resetLayoutForTemplate(current: CoverStyle, templateId: TemplateId, themeId: string): CoverStyle {
  return {
    ...current,
    templateId,
    themeId,
    titleSize: defaultStyle.titleSize,
    titleLineHeight: defaultStyle.titleLineHeight,
    titleLetterSpacing: defaultStyle.titleLetterSpacing,
    titleWeight: defaultStyle.titleWeight,
    titleWidth: defaultStyle.titleWidth,
    subtitleSize: defaultStyle.subtitleSize,
    subtitleLineHeight: defaultStyle.subtitleLineHeight,
    subtitleSpacing: defaultStyle.subtitleSpacing,
    subtitleWidth: defaultStyle.subtitleWidth,
    textAlign: defaultStyle.textAlign,
    titleX: defaultStyle.titleX,
    titleY: defaultStyle.titleY,
    image: {
      ...current.image,
      scale: defaultStyle.image.scale,
      x: defaultStyle.image.x,
      y: defaultStyle.image.y,
    },
    elementPositions: createDefaultElementPositions(),
    decorationDensity: defaultStyle.decorationDensity,
    backgroundBrightness: defaultStyle.backgroundBrightness,
  };
}

function mergeElementPositions(saved: Partial<CoverStyle['elementPositions']> | undefined) {
  const merged = createDefaultElementPositions();
  (Object.keys(merged) as TextElementKey[]).forEach((key) => {
    merged[key] = {
      ...merged[key],
      ...(saved?.[key] || {}),
    };
  });
  return merged;
}

function createDefaultElementPositions() {
  return {
    label: { ...defaultStyle.elementPositions.label },
    title: { ...defaultStyle.elementPositions.title },
    subtitle: { ...defaultStyle.elementPositions.subtitle },
    author: { ...defaultStyle.elementPositions.author },
    badge: { ...defaultStyle.elementPositions.badge },
    graphic: { ...defaultStyle.elementPositions.graphic },
  };
}

function getTextElementSelector(key: TextElementKey) {
  return `.text-el-${key}`;
}

function getTextElementFromEventTarget(target: EventTarget, fallbackKey: TextElementKey) {
  const element = target instanceof HTMLElement ? target.closest(getTextElementSelector(fallbackKey)) : null;
  return element instanceof HTMLElement ? element : null;
}

function getElementPositionBounds(canvasRect: DOMRect, elementRect: DOMRect, origin: { x: number; y: number }): PositionBounds {
  const minVisibleWidth = Math.min(elementRect.width, canvasRect.width) * MIN_VISIBLE_ELEMENT_RATIO;
  const minVisibleHeight = Math.min(elementRect.height, canvasRect.height) * MIN_VISIBLE_ELEMENT_RATIO;
  const minDeltaXPx = canvasRect.left - elementRect.right + minVisibleWidth;
  const maxDeltaXPx = canvasRect.right - elementRect.left - minVisibleWidth;
  const minDeltaYPx = canvasRect.top - elementRect.bottom + minVisibleHeight;
  const maxDeltaYPx = canvasRect.bottom - elementRect.top - minVisibleHeight;

  return normalizeBounds({
    minX: origin.x + (minDeltaXPx / canvasRect.width) * 100,
    maxX: origin.x + (maxDeltaXPx / canvasRect.width) * 100,
    minY: origin.y + (minDeltaYPx / canvasRect.height) * 100,
    maxY: origin.y + (maxDeltaYPx / canvasRect.height) * 100,
  });
}

function normalizeBounds(bounds: PositionBounds): PositionBounds {
  return {
    minX: Math.min(bounds.minX, bounds.maxX),
    maxX: Math.max(bounds.minX, bounds.maxX),
    minY: Math.min(bounds.minY, bounds.maxY),
    maxY: Math.max(bounds.minY, bounds.maxY),
  };
}

function clampElementPosition(position: { x: number; y: number }, bounds: PositionBounds) {
  return {
    x: Math.round(clamp(position.x, bounds.minX, bounds.maxX) * 100) / 100,
    y: Math.round(clamp(position.y, bounds.minY, bounds.maxY) * 100) / 100,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function buildFeedbackUrl({ title, body }: { title: string; body: string }) {
  const url = new URL(coverToolFeatures.feedbackIssueUrl);
  url.searchParams.set('title', title);
  url.searchParams.set('body', body);
  return url.toString();
}

function createStickerId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `sticker-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}
