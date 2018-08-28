import { join } from 'path';

interface IEnvironmentConfig {
  dataDir: string,
  httpPort: number,
  httpsPort: number,
  envName: string,
};

// Container for environments
const environments: { [key: string]: IEnvironmentConfig } = {};

// Staging (default) environment
environments.staging = {
  dataDir: join(__dirname, '/../.data'),
  httpPort: 3000,
  httpsPort: 3001,
  envName: 'staging',
};

// Production environment
environments.production = {
  dataDir: join(__dirname, '/../.data'),
  httpPort: 5000,
  httpsPort: 5001,
  envName: 'production',
};

// Determine which environment was passed as a command-line argument
const currentEnvironment = typeof(process.env.NODE_ENV) === 'string' ?
  process.env.NODE_ENV.toLowerCase() :
  '';

// Check that the current environment is one of the environments above, if not, default to staging
export const environment: IEnvironmentConfig = environments[currentEnvironment] !== undefined ?
  environments[currentEnvironment] :
  environments.staging!