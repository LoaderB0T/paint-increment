export async function loadHammer() {
  if (typeof window !== 'object') {
    return;
  }
  const hammer = await import('hammerjs');
  Hammer = hammer.default;
}

export let Hammer: HammerStatic | null = null;
