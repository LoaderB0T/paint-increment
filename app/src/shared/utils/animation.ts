export function reTriggerAnimation(element: HTMLElement | string) {
  const el =
    typeof element === 'string' ? (document.querySelector(element) as HTMLElement | null) : element;
  if (!el) {
    return;
  }
  el.style.animation = 'none';
  void el.offsetWidth; // trigger reflow
  el.style.animation = '';
}
