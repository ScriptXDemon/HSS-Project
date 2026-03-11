const frontendUrl = (process.env.SMOKE_FRONTEND_URL || '').replace(/\/$/, '');
const backendUrl = (process.env.SMOKE_BACKEND_URL || '').replace(/\/$/, '');

if (!frontendUrl || !backendUrl) {
  console.error('Set SMOKE_FRONTEND_URL and SMOKE_BACKEND_URL before running smoke:deploy.');
  process.exit(1);
}

const checks = [
  `${backendUrl}/api/health/live`,
  `${backendUrl}/api/health/ready`,
  `${frontendUrl}/api/health/live`,
  `${frontendUrl}/`,
  `${frontendUrl}/about`,
  `${frontendUrl}/events`,
  `${frontendUrl}/gallery`,
  `${frontendUrl}/donate`,
  `${frontendUrl}/login`,
];

let failed = false;

for (const url of checks) {
  try {
    const response = await fetch(url, { redirect: 'manual' });
    const ok = response.status >= 200 && response.status < 400;
    console.log(`${response.status} ${url}`);
    if (!ok) {
      failed = true;
    }
  } catch (error) {
    failed = true;
    console.error(`ERR ${url} :: ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failed) {
  process.exit(1);
}
