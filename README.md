# ndi-cybersim-api

[Postgres docker image](https://hub.docker.com/_/postgres)

Start postgres docker: `docker-compose up -d`

Stop postgres docker: `docker-compose down`

Reset db (unmigrate => migrate => seed): `npm run reset-db`

- Migrate tables: `npm run migrate`

- Rollback tables: `npm run unmigrate`

- Seed NDI table: `npm run seed`

Start API: `npm run start`
