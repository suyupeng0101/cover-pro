import type { CoverStyle } from '../types';

type UploadedImageProps = {
  image: CoverStyle['image'];
  className?: string;
  visible?: boolean;
};

export function UploadedImage({ image, className = '', visible = true }: UploadedImageProps) {
  if (!visible) return null;
  if (!image.src) {
    return (
      <div className={`mock-product is-empty ${className}`}>
        <div className="mock-product-ring ring-one" />
        <div className="mock-product-ring ring-two" />
      </div>
    );
  }

  return (
    <img
      className={`uploaded-image ${className}`}
      src={image.src}
      alt=""
      style={{
        transform: `translate(var(--image-x), var(--image-y)) scale(var(--image-scale))`,
      }}
    />
  );
}

export function GraphicText({ text, visible = true }: { text: string; visible?: boolean }) {
  if (!visible) return null;
  const graphicText = text.trim();
  if (!graphicText) return null;
  return (
    <div className="mock-product-core text-el-graphic" data-cover-element="graphic">
      {graphicText}
    </div>
  );
}

export function DensityBars() {
  return (
    <div className="density-bars" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} style={{ height: `${22 + ((index * 17) % 54)}%` }} />
      ))}
    </div>
  );
}
