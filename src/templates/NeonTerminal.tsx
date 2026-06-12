import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function NeonTerminal({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;

  return (
    <article className={`template neon-terminal ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="terminal-bg" />
      <div className="terminal-window">
        <div className="terminal-header">
          <span />
          <span />
          <span />
          <code>cover.setup</code>
        </div>
        <pre>{['layout = headline', 'visual = focus', 'export = ready'].join('\n')}</pre>
      </div>

      <div className="terminal-art">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />

      <section className="cover-copy">
        {style.showLabel && <div className="label-chip text-el-label">{content.label}</div>}
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>

      <div className="command-line">
        {style.showBadge && <strong className="text-el-badge">{content.badge}</strong>}
        {style.showAuthor && <em className="text-el-author">{content.author}</em>}
      </div>
    </article>
  );
}
