import { test, expect } from '@playwright/test';

import { TestContainer, StartedTestContainer, StoppedTestContainer, GenericContainer } from 'testcontainers';

test.describe('Redis', () => {
  let container: StartedTestContainer | undefined;

  test.beforeAll(async () => {
    test.setTimeout(15 * 60 * 1000);
    const cntnr = await GenericContainer.fromDockerfile('..', 'app/Dockerfile')
      .build()
      .catch(err => {
        console.log(err);
        throw err;
      });
    container = await cntnr
      .withExposedPorts({
        container: 80,
        host: 4200
      })
      .start();
  });

  test.afterAll(async () => {
    await container?.stop();
  });

  test('works', async ({ page }) => {
    await page.goto('http://localhost:4200/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Paint Increment/);
  });
});
