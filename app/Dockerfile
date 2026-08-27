FROM node:22-alpine3.24 AS base

RUN npm i -g pnpm@11.8.0

WORKDIR /app

COPY ./app/package.json .
COPY ./app/pnpm-lock.yaml .
COPY ./app/pnpm-workspace.yaml .
RUN pnpm i

FROM base AS builder

WORKDIR /app

COPY ./app .
COPY ./api/swagger.json .
COPY --from=base /app/node_modules ./node_modules

RUN pnpm run codegen
RUN pnpm run build


FROM node:22-alpine3.24

WORKDIR /app


COPY --from=builder /app/dist/awd-paint ./
ENV PORT=80
CMD node server/server.mjs

EXPOSE 80
