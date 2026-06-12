import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function GlassReport({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;
  const title = content.title.trim() || '输入主标题';

  return (
    <article className={`template glass-report ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="glass-sheet">
        <div className="glass-kicker">BRIEF</div>
        <section className="cover-copy">
          {style.showLabel && <div className="label-chip text-el-label">{content.label}</div>}
          <h1 className="text-el-title">{title}</h1>
          {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
        </section>
      </div>
      <div className="template-visual">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      <div className="glass-sidebar">
        {style.showBadge && <span className="text-el-badge">{content.badge}</span>}
        {style.showAuthor && <strong className="text-el-author">{content.author}</strong>}
      </div>
    </article>
  );
}
