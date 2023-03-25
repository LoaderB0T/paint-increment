import { test } from '@playwright/test';

import { StartedTestContainer, GenericContainer } from 'testcontainers';
import { settings } from './application-url';

if (process.env.USE_CONTAINERS) {
  test.describe('Setup Test Containers', () => {
    let container: StartedTestContainer | undefined;

    test.beforeAll(async () => {
      test.setTimeout(5 * 60 * 1000);
      container = await GenericContainer.fromDockerfile('..', 'app/Dockerfile')
        .build()
        .then(c => c.withExposedPorts(80).start());
      settings.applicationUrl = `http://localhost:${container?.getMappedPort(80)}`;
    });

    test.afterAll(async () => {
      await container?.stop();
    });
  });
}
