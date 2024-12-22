import { Injectable } from '@nestjs/common';
import supertokens from 'supertokens-node';
import Dashboard from 'supertokens-node/recipe/dashboard';
import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';
import UserMetadata from 'supertokens-node/recipe/usermetadata';

import { ConfigService } from '../services/config.service.js';

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
        ThirdParty.init({
          signInAndUpFeature: {
            providers: [
              {
                config: {
                  thirdPartyId: 'google',
                  clients: [
                    {
                      // https://support.google.com/cloud/answer/6158849?hl=en
                      // https://console.cloud.google.com/apis/credentials
                      clientId: configService.config.auth.google.clientId,
                      clientSecret: configService.config.auth.google.clientSecret,
                    },
                  ],
                },
              },
            ],
          },
        }),
        Session.init({
          exposeAccessTokenToFrontendInCookieBasedAuth: true,
        }),
        Dashboard.init(),
        UserMetadata.init(),
      ],
    });
  }
}
