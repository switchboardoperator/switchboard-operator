FROM node:8

LABEL maintainer="Alvarium.io <hello@alvarium.io>"

COPY . /app

WORKDIR /app

RUN yarn && yarn build && \
  rm -fr src node_modules && \
  yarn --production

ENV NODE_ENV production

EXPOSE 3000

ENTRYPOINT node built/app.js
