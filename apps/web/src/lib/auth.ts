import type { SessionResponse } from '@hss/domain';
import { serverApiFetch } from './api-client';

export async function auth() {
  try {
    return await serverApiFetch<SessionResponse>('/auth/session');
  } catch {
    return { user: null } satisfies SessionResponse;
  }
}
