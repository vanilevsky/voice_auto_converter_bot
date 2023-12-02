FROM node:18.12.0-alpine

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package*.json yarn.lock ./

RUN yarn install

ENV NODE_ENV production
ENV PORT 80

COPY ./ /usr/src/app

EXPOSE 80

#CMD ["yarn", "distribute"]

CMD ["tail", "-f", "/dev/null"]