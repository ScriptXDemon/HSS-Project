import { describe, expect, it } from 'vitest';
import { shouldTrackRouteLoading } from '../navigation-loading';

describe('route loading detection', () => {
  it('tracks internal path changes', () => {
    expect(
      shouldTrackRouteLoading('https://example.com/about', 'https://example.com/events')
    ).toBe(true);
  });

  it('tracks internal query changes', () => {
    expect(
      shouldTrackRouteLoading('https://example.com/donate', 'https://example.com/donate?cause=event')
    ).toBe(true);
  });

  it('ignores hash-only jumps and external links', () => {
    expect(
      shouldTrackRouteLoading('https://example.com/about', 'https://example.com/about#team')
    ).toBe(false);
    expect(
      shouldTrackRouteLoading('https://example.com/about', 'https://other.example.com/about')
    ).toBe(false);
  });

  it('ignores downloads and new-tab targets', () => {
    expect(
      shouldTrackRouteLoading('https://example.com/about', 'https://example.com/events', {
        download: true,
      })
    ).toBe(false);
    expect(
      shouldTrackRouteLoading('https://example.com/about', 'https://example.com/events', {
        target: '_blank',
      })
    ).toBe(false);
  });
});
