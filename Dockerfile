FROM node:14.5.0-alpine

WORKDIR /app

COPY package* ./
COPY . .

RUN npm i --production

EXPOSE 8080

CMD ["node", "."]
