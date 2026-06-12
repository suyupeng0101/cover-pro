import type { CoverContent, CoverStyle, Platform } from '../types';
import { GraphicText, UploadedImage } from './shared';

type TemplateProps = {
  content: CoverContent;
  style: CoverStyle;
  platform: Platform;
};

export function XhsReviewCard({ content, style, platform }: TemplateProps) {
  const isTall = platform.height > platform.width;
  const badgeText = style.showBadge ? content.badge.trim() : '';

  return (
    <article className={`template xhs-review-card ${isTall ? 'is-tall' : 'is-wide'}`}>
      <div className="xhs-paper" />
      <div className="xhs-paper-shadow" aria-hidden="true" />
      <div className="xhs-confetti" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      {badgeText && <div className="xhs-sticker text-el-badge">{badgeText}</div>}
      <div className="xhs-shot">
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
