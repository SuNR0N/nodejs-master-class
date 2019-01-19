# The Node.js Master Class

Related course: [The Node.js Master Class](https://pirple.thinkific.com/courses/the-nodejs-master-class)

Table of Contents
=================

* [Prerequisites](#prerequisites)
* [Install](#install)
* [Run](#run)
* [Build](#build)
* [Lint](#lint)
* [Debug](#debug)

## Prerequisites

You need to have the following programs installed on your machine:
- [Node.js](https://nodejs.org/) (>= 10.15.0)
- [Yarn](https://yarnpkg.com/)

You need to generate self-signed certificate for the HTTPS server:

```sh
cd src/api/https
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

You need to create a _Twilio_ account in order to use the Twilio service:

1. [Sign up for Twilio](https://www.twilio.com/try-twilio) or use your existing account
2. Get your _TEST Credentials_ from the [Settings page](https://www.twilio.com/console/project/settings)
3. Set up your environment variables based on your credentials

```sh                                                                   
export TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
export TWILIO_AUTH_TOKEN=********************************
```

## Install

The actual course does not have any dependencies however as I implemented it using [TypeScript](https://www.typescriptlang.org/) it will need a few.

```sh
yarn
```

## Run

```sh
yarn start
```

## Build

```sh
yarn build
```

## Lint

```sh
yarn lint

# With an attempt to fix selected rules
yarn lint:fix
```

## Debug

Instructions for debugging in VS Code:

```json
{
  "name": "API",
  "type": "node",
  "request": "launch",
  "args": [
    "${workspaceFolder}/src/api/index.ts"
  ],
  "env": {
    "TWILIO_ACCOUNT_SID": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "TWILIO_AUTH_TOKEN": "********************************"
  },
  "runtimeArgs": [
    "--nolazy",
    "-r",
    "ts-node/register"
  ],
  "sourceMaps": true,
  "cwd": "${workspaceRoot}",
  "protocol": "inspector",
}
```

### API

1. Go to Debug panel in VS Code and select _API_
2. Click on Start Debugging
3. Set a breakpoint