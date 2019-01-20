import {
  request as httpRequest,
  RequestOptions,
} from 'http';
import { request as httpsRequest } from 'https';
import { parse } from 'url';

import { environment } from '../config/config';
import {
  ICheck,
  ICheckOutcome,
} from './interfaces';
import { Directory } from './models/directory';
import {
  dataService,
  twilioService,
  validatorService,
} from './services';
import { validCheckSchema } from './validation/schemas';

async function validateCheckData(check: ICheck): Promise<void> {
  const validatedCheck = validatorService.validate(check, validCheckSchema);
  const keysToValidate = [
    'id',
    'userPhone',
    'protocol',
    'url',
    'method',
    'successCodes',
    'timeoutSeconds',
  ];
  if (keysToValidate.every((key) => validatedCheck.hasOwnProperty(key))) {
    let state: string;
    try {
      const { responseCode } = await performCheck(check);
      state = check.successCodes.some((code) => code === responseCode) ? 'UP' : 'DOWN';
    } catch (err) {
      state = 'DOWN';
    }
    await processCheckOutcome(check, state);
  } else {
    // tslint:disable-next-line:no-console
    console.debug('One of the checks is not formatted properly. Skipping it.');
  }
}

function performCheck(check: ICheck): Promise<ICheckOutcome> {
  const parsedUrl = parse(`${check.protocol}://${check.url}`, true);
  const hostname = parsedUrl.hostname;
  const path = parsedUrl.path;

  const requestOptions: RequestOptions = {
    hostname,
    method: check.method,
    path,
    protocol: `${check.protocol}:`,
    timeout: check.timeoutSeconds * 1000,
  };

  const request = check.protocol === 'http' ? httpRequest : httpsRequest;

  return new Promise<ICheckOutcome>((resolve, reject) => {
    const req = request(requestOptions, (res) => {
      const status = res.statusCode!;
      resolve({ responseCode: status });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.on('timeout', () => {
      reject('timeout');
    });

    req.end();
  });
}

async function processCheckOutcome(check: ICheck, state: string) {
  const alertWarranted = check.lastChecked && check.state !== state ? true : false;

  check.state = state;
  check.lastChecked = Date.now();

  // tslint:disable:no-console
  try {
    await dataService.update(Directory.Checks, check.id, check);
    if (alertWarranted) {
      await alertUsersToStatusChange(check);
    } else {
      console.info(`Check outcome has not changed for check with ID = ${check.id}, no alert needed`);
    }
  } catch {
    console.error(`Error trying to save updates to check with ID = ${check.id}`);
  }
  // tslint:enable:no-console
}

async function alertUsersToStatusChange(check: ICheck) {
  const message = `Alert: Your check for ${check.method} ${check.protocol}://${check.url} is currently ${check.state}`;
  // tslint:disable:no-console
  try {
    await twilioService.sendSMS(`+${check.userPhone}`, message);
    console.info('Success: User was alerted to a status change in their check, via SMS');
  } catch (err) {
    console.error('Error: Could not send SMS alert to user who had a state change in their check');
  }
  // tslint:enable:no-console
}

async function gatherAllChecks() {
  const checks = await dataService.list<ICheck>(Directory.Checks);
  if (checks.length === 0) {
    // tslint:disable-next-line:no-console
    console.info('Could not find any checks to process');
  }
  for (const check of checks) {
    await validateCheckData(check);
  }
}

function loop() {
  setInterval(() => {
    gatherAllChecks();
  }, environment.checkInterval);
}

export async function init() {
  await gatherAllChecks();

  loop();
}
