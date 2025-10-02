FROM node:22-alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn

COPY . .

RUN npx prisma generate

RUN npx prisma migrate dev

RUN yarn build

EXPOSE 3000

CMD ["yarn", "start:prod"]
