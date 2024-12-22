type Environment = {
  production: boolean;
  apiUrl: string;
};

// Will be filled at runtime by loadEnv function
export const environment: Environment = {} as Environment;
