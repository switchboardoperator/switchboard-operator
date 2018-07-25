FROM node

MAINTAINER Genar Trias <genar@alvarium.io>

COPY . /app

WORKDIR /app

RUN npm install && npm run build

ENV NODE_ENV production

EXPOSE 3000

ENTRYPOINT node built/app.js
