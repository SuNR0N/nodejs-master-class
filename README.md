# The Node.js Master Class

Related course: [The Node.js Master Class](https://pirple.thinkific.com/courses/the-nodejs-master-class)

Table of Contents
=================

* [Prerequisites](#prerequisites)
* [Install](#install)
* [Build](#build)
* [Lint](#lint)
* [API](#api)
  * [API Specification](#api-specification)
  * [Build API](#build-api)
  * [Run API](#run-api)
  * [Lint API](#lint-api)
  * [Debug API](#debug-api)
* [Homeworks](#homeworks)
  * [Homework Assignment #1](#homework-assignment-1)
  * [Homework Assignment #2](#homework-assignment-2)
* [Resources](#resources)

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

## API

### API Specification

[Swagger Specification](src/api/api.yaml) for the API

[Postman Collection](src/api/api.postman_collection.json)

### Build API

```sh
yarn build:api
```

### Run API

```sh
yarn start:api
```

### Lint API

```sh
yarn lint:api

# With an attempt to fix selected rules
yarn lint:api:fix
```

### Debug API

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

1. Go to Debug panel in VS Code and select _API_
2. Click on Start Debugging
3. Set a breakpoint

## Homeworks

### Homework Assignment #1

[Source](src/hello-world-api/README.md)

#### Requirements

Please create a simple "Hello World" API. Meaning:

1. It should be a RESTful JSON API that listens on a port of your choice. 
2. When someone posts anything to the route `/hello`, you should return a welcome message, in _JSON_ format. This message can be anything you want. 

### Homework Assignment #2

[Source](src/pizza-delivery-api/README.md)

#### Requirements

You are building the API for a pizza-delivery company. Don't worry about a frontend, just build the API. Here's the spec from your project manager: 

1. New users can be created, their information can be edited, and they can be deleted. We should store their name, email address, and street address.
2. Users can log in and log out by creating or destroying a token.
3. When a user is logged in, they should be able to GET all the possible menu items (these items can be hardcoded into the system). 
4. A logged-in user should be able to fill a shopping cart with menu items
5. A logged-in user should be able to create an order. You should integrate with the Sandbox of [Stripe.com](https://stripe.com/gb) to accept their payment.
_Note_: Use the stripe sandbox for your testing. Follow this link and click on the "tokens" tab to see the fake tokens you can use server-side to confirm the integration is working: https://stripe.com/docs/testing#cards
6. When an order is placed, you should email the user a receipt. You should integrate with the sandbox of [Mailgun.com](https://www.mailgun.com/) for this.
_Note_: Every _Mailgun_ account comes with a sandbox email account domain (whatever@sandbox123.mailgun.org) that you can send from by default. So, there's no need to setup any DNS for your domain for this task https://documentation.mailgun.com/en/latest/faqs.html#how-do-i-pick-a-domain-name-for-my-mailgun-account

_Important Note_: If you use external libraries (NPM) to integrate with _Stripe_ or _Mailgun_, you will not pass this assignment. You must write your API calls from scratch. Look up the "Curl" documentation for both APIs so you can figure out how to craft your API calls. 

This is an open-ended assignment. You may take any direction you'd like to go with it, as long as your project includes the requirements. It can include anything else you wish as well. 

And please: Don't forget to document how a client should interact with the API you create!

## Resources

- [Node.js v10.15.0 Documentation](https://nodejs.org/dist/latest-v10.x/docs/api/)