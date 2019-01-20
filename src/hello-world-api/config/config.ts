interface IEnvironmentConfig {
  envName: string;
  httpPort: number;
  httpsPort: number;
}

// Container for environments
const environments: { [key: string]: IEnvironmentConfig } = {};

// Staging (default) environment
environments.staging = {
  envName: 'staging',
  httpPort: 3000,
  httpsPort: 3001,
} as IEnvironmentConfig;

// Production environment
environments.production = {
  envName: 'production',
  httpPort: 5000,
  httpsPort: 5001,
} as IEnvironmentConfig;

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof (process.env.NODE_ENV) === 'string' ?
  process.env.NODE_ENV.toLowerCase() :
  '';

// Check that the current environment is one of the environments above, if not, default to staging
export const environment: IEnvironmentConfig = environments[currentEnvironment] !== undefined ?
  environments[currentEnvironment] :
  environments.staging!;
