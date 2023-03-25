import { test, expect } from '@playwright/test';

import { StartedTestContainer, GenericContainer } from 'testcontainers';

test.describe('Redis', () => {
  let container: StartedTestContainer | undefined;

  test.beforeAll(async () => {
    test.setTimeout(15 * 60 * 1000);
    container = await GenericContainer.fromDockerfile('..', 'app/Dockerfile')
      .build()
      .then(c => c.withExposedPorts(80).start());
  });

  test.afterAll(async () => {
    await container?.stop();
  });

  test('works', async ({ page }) => {
    const url = `http://localhost:${container?.getMappedPort(80)}`;
    await page.goto(url);

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Paint Increment/);
  });
});
