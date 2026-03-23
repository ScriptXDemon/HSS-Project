export interface NavigationTargetOptions {
  target?: string | null;
  download?: boolean;
}

export function shouldTrackRouteLoading(
  currentHref: string,
  nextHref: string,
  options: NavigationTargetOptions = {}
) {
  if (options.download) {
    return false;
  }

  if (options.target && options.target !== '_self') {
    return false;
  }

  const currentUrl = new URL(currentHref);
  const nextUrl = new URL(nextHref, currentHref);

  if (nextUrl.origin !== currentUrl.origin) {
    return false;
  }

  return nextUrl.pathname !== currentUrl.pathname || nextUrl.search !== currentUrl.search;
}
