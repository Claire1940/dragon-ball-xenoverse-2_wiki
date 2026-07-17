"use client";

import { useEffect, useRef, useState } from "react";
import { Play, ExternalLink } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * VideoFeature - YouTube 视频区
 *
 * 自动播放策略：
 * 1. 默认渲染封面缩略图 + 播放按钮（不立即加载 iframe，节省带宽、避免首屏多请求）
 * 2. IntersectionObserver 监测视频区进入视口时自动激活（autoplay=1&mute=1&loop=1）
 * 3. 点击播放按钮作为手动后备（用户主动触发）
 * 4. 激活后才挂载 iframe，浏览器允许 muted autoplay
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activated, setActivated] = useState(false);

  // 进入视口自动激活（静音自动播放）
  useEffect(() => {
    if (activated) return;
    const node = containerRef.current;
    if (!node) return;

    // 尊重「减少动态效果」偏好：不自动播放，等用户点击
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActivated(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.55 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [activated]);

  const thumbnail = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const fallbackThumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playsinline=1&rel=0&playlist=${videoId}`;

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg border border-border bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {activated ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActivated(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute inset-0 flex items-center justify-center"
          >
            {/* 封面缩略图（含降级） */}
            <img
              src={thumbnail}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                if (img.src !== fallbackThumbnail) {
                  img.src = fallbackThumbnail;
                }
              }}
            />
            {/* 暗化遮罩 */}
            <span
              className="absolute inset-0 bg-black/40 transition-opacity group-hover:bg-black/30"
              aria-hidden="true"
            />
            {/* 播放按钮 */}
            <span
              className="relative inline-flex h-16 w-16 items-center justify-center rounded-full
                         bg-[hsl(var(--nav-theme))] text-white shadow-lg shadow-[hsl(var(--nav-theme)/0.4)]
                         transition-transform duration-300 group-hover:scale-110
                         ring-4 ring-white/20"
              aria-hidden="true"
            >
              <Play className="ml-1 h-7 w-7 fill-current" />
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
