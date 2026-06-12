import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function BoldNumber({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;
  const numberText = style.showBadge ? content.badge.trim().slice(0, 6) : '';

  return (
    <article className={`template bold-number ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="poster-noise" />
      <div className="poster-burst" aria-hidden="true" />
      <div className="poster-stripe" aria-hidden="true" />
      {numberText && <div className="poster-number text-el-badge">{numberText}</div>}
      <div className="poster-visual">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      <section className="cover-copy">
        {style.showLabel && <div className="label-chip text-el-label">{content.label}</div>}
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>
      {style.showAuthor && <footer className="text-el-author">{content.author}</footer>}
    </article>
  );
}
