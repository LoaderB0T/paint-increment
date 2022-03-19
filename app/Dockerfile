# stage 1

ARG skipBuild=false

FROM node:16.14.2-alpine3.15 AS builder

ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY . .

RUN yarn codegen
RUN yarn build

# stage 2

FROM nginx:alpine

COPY config/angular.conf /etc/nginx/angular.conf
COPY config/nginx.conf /etc/nginx/nginx.conf
COPY config/security-headers.conf /etc/nginx/security-headers.conf

COPY --from=builder /app/dist/paint-increment-client /usr/share/nginx/html

EXPOSE 80
