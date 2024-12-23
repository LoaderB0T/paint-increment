FROM node:22-alpine3.20 AS base

RUN npm i -g pnpm

WORKDIR /app

COPY ./app/package.json .
COPY ./app/pnpm-lock.yaml .
RUN pnpm i

FROM base AS builder

WORKDIR /app

COPY ./app .
COPY ./api/swagger.json .
COPY --from=base /app/node_modules ./node_modules

RUN pnpm run codegen-docker
RUN pnpm run build


FROM node:22-alpine

WORKDIR /app

COPY ./app/config/angular.conf /etc/nginx/angular.conf
COPY ./app/config/nginx.conf /etc/nginx/nginx.conf
COPY ./app/config/security-headers.conf /etc/nginx/security-headers.conf

COPY --from=builder /app/dist/apps/host ./
ENV PORT 80
CMD node server/server.mjs

EXPOSE 80
