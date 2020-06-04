# ndi-cybersim-api

[Socket IO API](https://github.com/socketio/socket.io/blob/master/docs/API.md)
[Postgres docker image](https://hub.docker.com/_/postgres)

Start postgres docker: `docker-compose up -d`

Migrate NDI table: `npm run migrate`
Rollback NDI table: `npm run unmigrate`
Seed NDI table: `npm run seed`
