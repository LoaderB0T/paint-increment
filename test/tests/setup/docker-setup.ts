import { test as setup } from '@playwright/test';

import {
  StartedTestContainer,
  GenericContainer,
  MongoDBContainer,
  StartedMongoDBContainer,
} from 'testcontainers';
import { settings } from '../util/application-url';

let frontendContainer: StartedTestContainer | undefined;
let backendContainer: StartedTestContainer | undefined;
let mongoDBContainer: StartedTestContainer | undefined;

setup('Setup', async () => {
  if (!process.env.USE_CONTAINERS) {
    return;
  }

  setup.setTimeout(5 * 60 * 1000);

  const [mongoDBContainerBuild, backendContainerBuild, frontendContainerBuild] = await Promise.all([
    GenericContainer.fromDockerfile('..', 'test/tests/setup/mongodb.Dockerfile').build(),
    GenericContainer.fromDockerfile('..', 'api/Dockerfile').build(),
    GenericContainer.fromDockerfile('..', 'app/Dockerfile').build(),
  ]);

  mongoDBContainer = await mongoDBContainerBuild.withExposedPorts(27017).start();

  backendContainer = await backendContainerBuild
    .withEnvironment({
      MONGODB_URI: 'mongodb://localhost:' + mongoDBContainer!.getFirstMappedPort(),
    })
    .withExposedPorts(80)
    .start();

  frontendContainer = await frontendContainerBuild
    .withEnvironment({
      API_PORT: backendContainer!.getFirstMappedPort() + '',
    })
    .withExposedPorts(80)
    .start();

  settings.applicationUrl = `http://localhost:${frontendContainer?.getMappedPort(80)}`;
});

// setup.afterAll(async () => {
//   await frontendContainer?.stop();
//   await backendContainer?.stop();
//   await mongoDBContainer?.stop();
// });
