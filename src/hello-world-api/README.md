# hello-world-api

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

Please create a simple "Hello World" API. Meaning:

1. It should be a RESTful JSON API that listens on a port of your choice. 
2. When someone posts anything to the route `/hello`, you should return a welcome message, in _JSON_ format. This message can be anything you want.

## Prerequisites

You need to generate self-signed certificate for the HTTPS server:

```sh
cd src/hello-world-api/https
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
```

## API Specification

[Swagger Specification](hello-world-api.yaml) for the API

[Postman Collection](hello-world-api.postman_collection.json)

## Run

```sh
yarn start:hello-world-api
```

## Build

```sh
yarn build:hello-world-api
```

## Lint

```sh
yarn lint:hello-world-api

# With an attempt to fix selected rules
yarn lint:hello-world-api:fix
```

## Debug

Instructions for debugging in VS Code:

```json
{
  "name": "Hello World API",
  "type": "node",
  "request": "launch",
  "args": [
    "${workspaceFolder}/src/hello-world-api/index.ts"
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

1. Go to Debug panel in VS Code and select _Hello World API_
2. Click on Start Debugging
3. Set a breakpoint