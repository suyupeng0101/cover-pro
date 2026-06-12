import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Platform } from '../types';

type PreviewStageProps = {
  platform: Platform;
  children: ReactNode;
};

export function PreviewStage({ platform, children }: PreviewStageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const updateScale = () => {
      const rect = frame.getBoundingClientRect();
      const nextScale = Math.min(
        (rect.width - 8) / platform.width,
        (rect.height - 8) / platform.height,
        1,
      );
      setScale(Math.max(nextScale, 0.05));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [platform.height, platform.width]);

  return (
    <section className="preview-stage">
      <div className="preview-topline">
        <div>
          <span>Preview</span>
          <strong>{platform.name}</strong>
        </div>
        <code>{platform.width} x {platform.height}px</code>
      </div>
      <div className="preview-frame" ref={frameRef}>
        <div
          className="preview-viewport"
          style={{
            width: platform.width * scale,
            height: platform.height * scale,
          }}
        >
          <div
            className="preview-zoom"
            style={{
              width: platform.width,
              height: platform.height,
              transform: `scale(${scale})`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
