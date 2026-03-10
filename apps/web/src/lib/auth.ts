import type { SessionResponse } from '@hss/domain';
import { serverApiFetch } from './api-client';

export async function auth() {
  return serverApiFetch<SessionResponse>('/auth/session');
}
