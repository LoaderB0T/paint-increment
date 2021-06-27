export interface Config {
  mail: {
    service: string;
    account: string;
    password: string;
  };
  db: {
    address: string;
    database: string;
  };
}
