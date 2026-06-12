import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function AIRadar({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;

  return (
    <article className={`template ai-radar ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="radar-map">
        <span className="radar-sweep" />
        <i className="ping p1" />
        <i className="ping p2" />
        <i className="ping p3" />
      </div>
      <div className="template-visual">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      <div className="radar-readout">
        <span>FOCUS</span>
        {style.showBadge && <strong className="text-el-badge">{content.badge}</strong>}
        <small>signal / scope / timing</small>
      </div>
      <section className="cover-copy">
        {style.showLabel && <div className="label-chip text-el-label">{content.label}</div>}
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>
      {style.showAuthor && <footer className="text-el-author">{content.author}</footer>}
    </article>
  );
}
