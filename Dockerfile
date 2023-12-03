FROM node:18.12.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./ /usr/src/app

RUN yarn install

ENV NODE_ENV production

CMD ["yarn", "distribute"]
