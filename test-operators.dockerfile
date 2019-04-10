FROM node:8-alpine

LABEL maintainer="Òscar Casajuana <elboletaire@underave.net>"

COPY . /app

WORKDIR /app

ENV NODE_ENV development

RUN yarn && mv -f /app/test/test-operators.sh /usr/bin/test-operators && \
    chmod +x /usr/bin/test-operators
