import { useEffect, useRef, useCallback } from "react";

type UseInfiniteScrollOptions = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number; // px from top to trigger
};

export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 100,
}: UseInfiniteScrollOptions) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isLoading || !hasMore) return;

    if (el.scrollTop <= threshold) {
      // Save scroll height before loading to restore position after
      prevScrollHeightRef.current = el.scrollHeight;
      onLoadMore();
    }
  }, [hasMore, isLoading, onLoadMore, threshold]);

  // Restore scroll position after older messages are prepended
  const restoreScrollPosition = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    
    const newScrollHeight = el.scrollHeight;
    const addedHeight = newScrollHeight - prevScrollHeightRef.current;
    el.scrollTop = addedHeight;
    prevScrollHeightRef.current = 0;
  }, []);

  return { scrollRef, handleScroll, restoreScrollPosition };
}
