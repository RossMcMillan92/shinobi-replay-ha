#!/bin/bash
set -e

echo Hello!
node -v
npm -v
yarn install --production
yarn start