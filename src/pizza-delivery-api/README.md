# pizza-delivery-api

Table of Contents
=================

* [Requirements](#requirements)
* [Prerequisites](#prerequisites)
* [API Specification](#api-specification)
* [Run](#run)
* [Build](#build)
* [Lint](#lint)
* [Debug](#debug)

## Requirements

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

## Prerequisites

You need to generate self-signed certificate for the HTTPS server:

```sh
cd src/pizza-delivery/https
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

## API Specification

[Swagger Specification](pizza-delivery-api.yaml) for the API

[Postman Collection](pizza-delivery-api.postman_collection.json)

## Run

```sh
yarn start:pizza-delivery-api
```

## Build

```sh
yarn build:pizza-delivery-api
```

## Lint

```sh
yarn lint:pizza-delivery-api

# With an attempt to fix selected rules
yarn lint:pizza-delivery-api:fix
```

## Debug

Instructions for debugging in VS Code:

```json
{
  "name": "Pizza Delivery API",
  "type": "node",
  "request": "launch",
  "args": [
    "${workspaceFolder}/src/pizza-delivery-api/index.ts"
  ],
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

1. Go to Debug panel in VS Code and select _Pizza Delivery API_
2. Click on Start Debugging
3. Set a breakpoint