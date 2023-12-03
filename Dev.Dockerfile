FROM node:18.12.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY ./ /usr/src/app

RUN yarn install

ENV NODE_ENV development
ENV PORT 80
ENV NODE_TLS_REJECT_UNAUTHORIZED 0

EXPOSE 80

CMD ["yarn", "develop"]
