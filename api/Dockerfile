# stage 1

ARG skipBuild=false

FROM node:16

ENV YARN_CACHE_FOLDER=/tmp/yarn-cache

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN node -v

RUN yarn install

COPY . .

RUN yarn build

EXPOSE 80

ENV PORT 80

CMD yarn start:prod
