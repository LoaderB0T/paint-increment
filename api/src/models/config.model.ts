export interface Config {
  auth: {
    connectionURI: string;
    apiKey: string;
    google: {
      clientId: string;
      clientSecret: string;
    };
    discord: {
      clientId: string;
      clientSecret: string;
    };
  };
  mail: {
    service: string;
    account: string;
    password: string;
  };
  db: {
    address: string;
    database: string;
  };
  origins: string[];
  debug: boolean;
  ownAddress: string;
  clientAddress: string;
}
