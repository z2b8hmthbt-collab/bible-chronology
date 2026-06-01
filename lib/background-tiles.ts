/** Fixed on-screen width for each repeated background image tile (px). */
export const BACKGROUND_TILE_WIDTH_PX = 320;

const TILE_BUFFER_PX = BACKGROUND_TILE_WIDTH_PX;

/** Indices of tiles that intersect the horizontally scrolled viewport. */
export function getVisibleBackgroundTileRange(
  spanX: number,
  spanWidth: number,
  tileWidth: number,
  scrollLeft: number,
  viewportWidth: number
): { startIndex: number; endIndex: number; tileCount: number } {
  const columnWidth = Math.max(spanWidth, 24);
  const tileCount = Math.max(1, Math.ceil(columnWidth / tileWidth));
  const spanEnd = spanX + columnWidth;

  if (viewportWidth <= 0) {
    return { startIndex: 0, endIndex: tileCount - 1, tileCount };
  }

  const viewMin = scrollLeft - TILE_BUFFER_PX;
  const viewMax = scrollLeft + viewportWidth + TILE_BUFFER_PX;

  if (spanEnd < viewMin || spanX > viewMax) {
    return { startIndex: 0, endIndex: -1, tileCount };
  }

  const visStart = Math.max(spanX, viewMin);
  const visEnd = Math.min(spanEnd, viewMax);
  const startIndex = Math.floor((visStart - spanX) / tileWidth);
  const endIndex = Math.floor((visEnd - spanX - 1) / tileWidth);

  return {
    startIndex: Math.max(0, startIndex),
    endIndex: Math.min(tileCount - 1, Math.max(0, endIndex)),
    tileCount,
  };
}
