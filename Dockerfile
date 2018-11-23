FROM node

LABEL maintainer="Alvarium.io <hello@alvarium.io>"

COPY . /app

WORKDIR /app

RUN yarn && yarn build

ENV NODE_ENV production

EXPOSE 3000

ENTRYPOINT node built/app.js
