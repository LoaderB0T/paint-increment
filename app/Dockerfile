ARG skipBuild=false

FROM node:18.15.0-alpine3.17 AS base

RUN npm i -g pnpm

FROM base as dependencies

WORKDIR /app

COPY ./app/package.json .
COPY ./app/pnpm-lock.yaml .
RUN pnpm i

FROM base AS build

WORKDIR /app

COPY ./app .
COPY ./api/swagger.json .
COPY --from=dependencies /app/node_modules ./node_modules

RUN pnpm run codegen-docker
RUN pnpm run build

FROM base as deploy

WORKDIR /app

COPY ./app/config/angular.conf /etc/nginx/angular.conf
COPY ./app/config/nginx.conf /etc/nginx/nginx.conf
COPY ./app/config/security-headers.conf /etc/nginx/security-headers.conf

COPY --from=build /app/dist/paint-increment-client /usr/share/nginx/html

EXPOSE 80
