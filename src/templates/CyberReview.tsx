import type { CoverContent, CoverStyle, Platform } from '../types';
import { DensityBars, GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function CyberReview({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;

  return (
    <article className={`template cyber-review ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="cyber-grid" />
      <div className="scanline" />
      <div className="hud-corner top-left" />
      <div className="hud-corner top-right" />
      <div className="hud-corner bottom-left" />
      <div className="hud-corner bottom-right" />
      <div className="cyber-orbit" />
      <DensityBars />

      <div className="visual-bay">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      {style.showBadge && <div className="template-badge text-el-badge">{content.badge}</div>}

      <section className="cover-copy">
        {style.showLabel && <div className="label-chip text-el-label">{content.label}</div>}
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>

      {style.showAuthor && <footer className="text-el-author">{content.author}</footer>}
    </article>
  );
}
