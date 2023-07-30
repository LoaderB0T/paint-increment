import { Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import ThirdPartyEmailPassword from 'supertokens-node/recipe/thirdpartyemailpassword';
import Dashboard from 'supertokens-node/recipe/dashboard';

import { ConfigService } from '../services/config.service';

@Injectable()
export class SupertokensService {
  constructor(configService: ConfigService) {
    supertokens.init({
      appInfo: {
        apiDomain: configService.config.ownAddress,
        appName: 'paint-increment',
        websiteDomain: configService.config.clientAddress,
        apiBasePath: '/auth',
        websiteBasePath: '/auth',
      },
      supertokens: {
        connectionURI: configService.config.auth.connectionURI,
        apiKey: configService.config.auth.apiKey,
      },
      recipeList: [
        ThirdPartyEmailPassword.init({
          providers: [
            {
              config: {
                thirdPartyId: 'google',
                clients: [
                  {
                    clientId: configService.config.auth.google.clientId,
                    clientSecret: configService.config.auth.google.clientSecret,
                  },
                ],
              },
            },
          ],
        }),
        Session.init(),
        Dashboard.init(),
      ],
    });
  }
}
