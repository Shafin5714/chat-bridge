import { useEffect, useRef, useCallback } from "react";

type UseInfiniteScrollOptions = {
  hasMoreOlder: boolean;
  hasMoreNewer: boolean;
  isLoading: boolean;
  onLoadOlder: () => void;
  onLoadNewer: () => void;
  threshold?: number; // px from top/bottom to trigger
};

export function useInfiniteScroll({
  hasMoreOlder,
  hasMoreNewer,
  isLoading,
  onLoadOlder,
  onLoadNewer,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoading) return;

    if (hasMoreOlder && el.scrollTop <= threshold) {
      // Save scroll height before loading to restore position after
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadOlder();
      return;
    }

    const scrollBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (hasMoreNewer && scrollBottom <= threshold) {
      // Browser naturally handles appending to bottom without shifting current view
      onLoadNewer();
    }
  }, [hasMoreOlder, hasMoreNewer, isLoading, onLoadOlder, onLoadNewer, threshold]);

  // Restore scroll position after older messages are prepended
  const restoreScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    
    const newScrollHeight = el.scrollHeight;
    const addedHeight = newScrollHeight - prevScrollHeightRef.current;
    el.scrollTop = el.scrollTop + addedHeight;
    prevScrollHeightRef.current = 0;
  }, []);

  return { scrollRef, handleScroll, restoreScrollPosition };
}
