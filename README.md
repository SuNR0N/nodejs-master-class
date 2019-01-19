# The Node.js Master Class

Related course: [The Node.js Master Class](https://pirple.thinkific.com/courses/the-nodejs-master-class)

Table of Contents
=================

* [Prerequisites](#prerequisites)
* [Install](#install)
* [Run](#run)
* [Build](#build)
* [Lint](#lint)

## Prerequisites

You need to have the following programs installed on your machine:
- [Node.js](https://nodejs.org/) (>= 10.15.0)
- [Yarn](https://yarnpkg.com/)

You need to generate self-signed certificate for the HTTPS server:

```sh
cd src/api/https
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
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