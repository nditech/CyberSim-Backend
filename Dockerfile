FROM node:14.5.0-alpine

WORKDIR /app

COPY package* ./
COPY . .

RUN npm i --production

EXPOSE 3001

CMD ["node", "."]
