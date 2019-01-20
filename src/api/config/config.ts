import { join } from 'path';

interface IEnvironmentConfig {
  checkInterval: number;
  dataDir: string;
  envName: string;
  hashingSecret: string;
  httpPort: number;
  httpsPort: number;
  maxChecks: number;
  tokenName: string;
  tokenValidity: number;
  twilio: ITwilioConfig;
}

interface ITwilioConfig {
  accountSid?: string;
  authToken?: string;
  fromPhone: string;
}

// Container for environments
const environments: { [key: string]: IEnvironmentConfig } = {};

const baseConfig: Partial<IEnvironmentConfig> = {
  checkInterval: 1000 * 60,
  dataDir: join(__dirname, '/../.data'),
  hashingSecret: 's3cr37',
  maxChecks: 5,
  tokenName: 'token',
  tokenValidity: 1000 * 60 * 60,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromPhone: '+15005550006',
  },
};

// Staging (default) environment
environments.staging = {
  ...baseConfig,
  envName: 'staging',
  httpPort: 3000,
  httpsPort: 3001,
} as IEnvironmentConfig;

// Production environment
environments.production = {
  ...baseConfig,
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
