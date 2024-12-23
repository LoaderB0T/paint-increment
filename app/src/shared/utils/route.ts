import { ActivatedRouteSnapshot } from '@angular/router';

export function urlArrayFromSegment(segment: ActivatedRouteSnapshot) {
  let u: ActivatedRouteSnapshot | null = segment;
  const urls: string[] = [];
  while (u) {
    if (u.url[0]?.path) {
      urls.push(u.url[0].path);
    }
    u = u.parent;
  }
  return urls.reverse();
}
