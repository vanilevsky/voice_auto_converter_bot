FROM node:18.12.0

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

ENV NODE_ENV production
ENV PORT 80

COPY . .

EXPOSE 80

CMD ["yarn", "distribute"]
