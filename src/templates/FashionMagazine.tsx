import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function FashionMagazine({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;

  return (
    <article className={`template fashion-magazine ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="mag-rule top" />
      <div className="mag-rule bottom" />
      <div className="mag-visual">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      <section className="cover-copy">
        {style.showLabel && <div className="label-chip text-el-label">{content.label}</div>}
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>
      {style.showBadge && <div className="mag-badge text-el-badge">{content.badge}</div>}
      {style.showAuthor && <footer className="text-el-author">{content.author}</footer>}
    </article>
  );
}
