'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import GlobalRouteLoader from '@/components/shared/GlobalRouteLoader';
import { shouldTrackRouteLoading } from '@/lib/navigation-loading';

interface RouteTransitionContextValue {
  startLoading: () => void;
  stopLoading: () => void;
}

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

interface RouteTransitionProviderProps {
  children: ReactNode;
}

function shouldTrackAnchorNavigation(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute('href');

  if (!href || href.startsWith('#')) {
    return false;
  }

  return shouldTrackRouteLoading(window.location.href, anchor.href, {
    target: anchor.target,
    download: anchor.hasAttribute('download'),
  });
}

export default function RouteTransitionProvider({
  children,
}: RouteTransitionProviderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = `${pathname}?${searchParams.toString()}`;
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const lastRouteKeyRef = useRef(routeKey);
  const pendingRouteKeyRef = useRef<string | null>(null);

  const startLoading = useCallback(() => {
    pendingRouteKeyRef.current = lastRouteKeyRef.current;
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    pendingRouteKeyRef.current = null;
    setIsLoading(false);
    setShowLoader(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShowLoader(true);
    }, 150);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    if (pendingRouteKeyRef.current && routeKey !== pendingRouteKeyRef.current) {
      const timer = window.setTimeout(() => {
        stopLoading();
      }, 120);

      return () => {
        window.clearTimeout(timer);
      };
    }

    return undefined;
  }, [isLoading, routeKey, stopLoading]);

  useEffect(() => {
    lastRouteKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    if (!isLoading) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      stopLoading();
    }, 1800);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isLoading, stopLoading]);

  useEffect(() => {
    function handleDocumentClick(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const anchor = target.closest('a');
      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (shouldTrackAnchorNavigation(anchor)) {
        startLoading();
      }
    }

    function handlePopState() {
      startLoading();
    }

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [startLoading]);

  const value = useMemo(
    () => ({
      startLoading,
      stopLoading,
    }),
    [startLoading, stopLoading]
  );

  return (
    <RouteTransitionContext.Provider value={value}>
      {children}
      {showLoader ? <GlobalRouteLoader /> : null}
    </RouteTransitionContext.Provider>
  );
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);

  if (!context) {
    throw new Error('useRouteTransition must be used within RouteTransitionProvider');
  }

  return context;
}
