FROM node:8

LABEL maintainer="Alvarium.io <hello@alvarium.io>"

COPY . /app

WORKDIR /app

ENV NODE_ENV development

RUN yarn && mv -f /app/test/test-operators.sh /usr/bin/test-operators && \
    chmod +x /usr/bin/test-operators
