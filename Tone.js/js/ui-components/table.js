function applyClipOffset(clipElement) {
  let columnWidth = clipElement.parentElement.getBoundingClientRect().width;
  clipElement.style.marginLeft = `${columnWidth * clipElement.dataset.offset}px`;
}