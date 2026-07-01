import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function LaunchCard({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;

  return (
    <article className={`template launch-card ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="launch-card-panel">
        <div className="launch-topline">
          {style.showLabel && <span className="text-el-label">{content.label}</span>}
          <strong>FEATURED</strong>
        </div>
        <div className="launch-visual">
          <UploadedImage image={style.image} visible={style.showImage} />
        </div>
        <div className="launch-footer">
          <span>READY TO PUBLISH</span>
          {style.showAuthor && <strong className="text-el-author">{content.author}</strong>}
        </div>
      </div>
      <section className="cover-copy">
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      {style.showBadge && <div className="launch-badge text-el-badge">{content.badge}</div>}
    </article>
  );
}
