import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function WechatDeepDive({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;

  return (
    <article className={`template wechat-deep-dive ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="wechat-rule" />
      <div className="wechat-meta">
        {style.showLabel && <span className="text-el-label">{content.label}</span>}
        {style.showAuthor && <strong className="text-el-author">{content.author}</strong>}
      </div>
      <section className="cover-copy">
        <h1 className="text-el-title">{content.title}</h1>
        {style.showSubtitle && <p className="text-el-subtitle">{content.subtitle}</p>}
      </section>
      <div className="template-visual">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      {style.showBadge && <div className="wechat-badge text-el-badge">{content.badge}</div>}
    </article>
  );
}
