FROM node:14.5.0-alpine

WORKDIR /app

COPY package* ./
COPY . .

RUN npm i

EXPOSE 3000

CMD ["node", "."]