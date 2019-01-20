import {
  request,
  RequestOptions,
} from 'https';
import { stringify } from 'querystring';

import { environment } from '../../config/config';
import { loggerService } from './logger.service';
import { Color } from '../models/color';

const debug = loggerService.debug('twilio');

export interface ITwilioService {
  sendSMS: (phone: string, message: string) => Promise<void>;
}

async function sendSMS(phone: string, message: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!environment.twilio.accountSid || !environment.twilio.authToken) {
      reject('Twilio account is not configured');
    } else if (!phone.match(/^\+\d{11,13}$/)) {
      reject('Phone number must be using E.164 phone number formatting');
    } else if (!(message.length > 0 && message.length <= 1600)) {
      reject('Length of message must be between 0 and 1600 characters');
    }

    const payload = {
      Body: message,
      From: environment.twilio.fromPhone,
      To: `${phone}`,
    };

    const stringPayload = stringify(payload);

    const requestOptions: RequestOptions = {
      auth: `${environment.twilio.accountSid}:${environment.twilio.authToken}`,
      headers: {
        'Content-Length': Buffer.byteLength(stringPayload),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${environment.twilio.accountSid}/Messages`,
      protocol: 'https:',
    };

    const clientRequest = request(requestOptions, (res) => {
      const status = res.statusCode;

      if (status === 200 || status === 201) {
        debug(Color.Green, `"${message}" has been successfully sent to ${payload.To} using Twilio`);
        resolve();
      } else {
        reject(`Status code returned was ${status}`);
      }
    });

    clientRequest.on('error', (err) => {
      reject(err);
    });

    clientRequest.write(stringPayload);

    clientRequest.end();
  });
}

export const twilioService: ITwilioService = {
  sendSMS,
};
