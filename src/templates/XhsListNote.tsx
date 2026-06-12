import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function XhsListNote({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;
  const badgeText = style.showBadge ? content.badge.trim() : '';
  const points = content.subtitle
    .split(/\n|，|、|;/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);

  return (
    <article className={`template xhs-list-note ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="xhs-list-card">
        <div className="xhs-list-top">
          {style.showLabel && <span className="text-el-label">{content.label}</span>}
          <i className="xhs-list-mark" aria-hidden="true" />
        </div>
        <section className="cover-copy">
          <h1 className="text-el-title">{content.title}</h1>
        </section>
        {style.showSubtitle && points.length > 0 && (
          <ol className="xhs-points text-el-subtitle">
            {points.map((point, index) => (
              <li key={`${point}-${index}`}>{point}</li>
            ))}
          </ol>
        )}
        {badgeText && <div className="xhs-list-badge text-el-badge">{badgeText}</div>}
      </div>
      <div className="template-visual">
        <UploadedImage image={style.image} visible={style.showImage} />
      </div>
      <GraphicText text={content.graphicText} visible={style.showGraphicText} />
      {style.showAuthor && <footer className="text-el-author">{content.author}</footer>}
    </article>
  );
}
