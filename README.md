# ndi-cybersim-api

[Postgres docker image](https://hub.docker.com/_/postgres)

Start postgres docker: `docker-compose up -d`

Stop postgres docker: `docker-compose down`

Reset db (unmigrate => migrate => seed): `npm run reset-db`

- Migrate tables: `npm run migrate`

- Rollback tables: `npm run unmigrate`

- Seed NDI table: `npm run seed`

Run test: `npm run test`

Start API: `npm run start`

## To set up the project on your local environment run the following commands:

```
# Clone the project by running git clone.
$ git clone <REPO_LINK>
# Install the node dependencies by running
$ npm install
# Create a .env file based on .env.example
$ cp .env.example .env
# Start Postgres and Adminer by running
$ docker-compose up -d
# Start the API on localhost:3001 (if nothing changed in .env.example)
$ npm start
```

## For some basic source code explanation see the [wiki page](https://github.com/nditech/CyberSim-Backend/wiki)

# CyberSim-Backend Deployment Guide

- The CyberSim Game comprises two distinct applications: a Node.js-based backend API and a React-based frontend UI. This guide specifically covers the deployment process for the Node.js-based backend API. For instructions on deploying the frontend application, please refer to the [CyberSim-UI README](https://github.com/nditech/CyberSim-UI#readme).

1. [Set up the Elastic Beanstalk environment](#elastic-beanstalk-eg-ndicybersimgame-env)
2. [Set up the CodePipeline](#codepipeline-eg-ndicybersim-backend)

## Environment Component Naming Convention

The environment component name follows this format: `<ACCOUNT_ALIAS>@<COMPONENT_NAME>`.

## GitHub Repository (nditech/CyberSim-UI)

All local repository changes are pushed to new branches in the GitHub remote repository. These changes are reviewed and merged into the 'master' branch.

## CodePipeline (e.g., ndi@Cybersim-backend)

A separate CodePipeline project is created for each production environment. The pipeline consists of 2 stages:

### SOURCE

1. Set the _Source provider_ to "GitHub (Version 2)" and connect to the following repository: [nditech/CyberSim-Backend](https://github.com/nditech/CyberSim-Backend). Branch name should be `master`.
2. Keep the _Start the pipeline on source code change_ option checked to trigger automatic builds on AWS whenever changes are pushed to the `master` branch. (Troubleshooting: Manually trigger a release in CodePipeline)
3. Leave the _Output artifact format_ on the default "CodePipeline default".

### BUILD

Skip the build stage. It's not needed.

### DEPLOY

1. Set the _Deploy provider_ to "AWS Elastic Beanstalk".
2. [Select the Cybersim application and the environment you've just created.](#elastic-beanstalk-eg-ndicybersimgame-env)

## Elastic Beanstalk (e.g., ndi@Cybersimgame-env)

In Elastic Beanstalk (EB) a different environment is created for each game instance. In each environment, the node application is running inside a docker container so an existing Dockerfile inside the source code is necessary for EB. The docker image is created using the Dockerfile in the root. Once the deployment is compleated, the API will be live.

To create a new Elastic Beanstalk environment follow these steps:

1. For _Environment tier_ select "Web server environment".
2. _Environment name_ and _domain_ are arbitrary. This domain is required in the [frontend setup](https://github.com/nditech/CyberSim-UI#readme).
3. For _Platform_ select a managed Docker platform. Recommended: "Docker running on 64bit Amazon Linux 2@3.6.1"
4. You might want to deploy an existing version right away, you can do it under the _Application code_ setting.
5. Just leave the _Preset_ on "Single instance".
6. For _Service role_ settings:

- Existing service role --> "aws-elasticbeanstalk-service-role"
- Add your SSL key for easier access to the EC2 instance. You can create a new "EC2 keypair" under the "EC2 service console / Network & security / Key pairs".
- EC2 instance profile --> "aws-elasticbeanstalk-ec2-role"

7. VPC is not required.
8. Set the _Public IP adress_ to "Activated"
9. For _Database_ select "Enabled" and follow [these steps](#rds-eg-ndiaa1jiteus75zy8h)
10. For the _Instances_ and _Capacity_ settings leave everything on default.
11. Set the _Monitoring_ to "Basic".
12. _Managed updates_ to "false".
13. For _Rolling updates and deployments_ everything on default.
14. Under the _Platform software_ settings you must set these 3 environment variables. You can modify these variables later at any time under the Configuration/Software Tab of the AWS Console:

- **PORT**: The PORT must match the port exposed in the docker container which currently is **8080**.
- **NODE_ENV**: Must be either `production`, `development` or `test`. If the given value is `test` the server will reset the Postgres Database on each restart.
- **DB_URL**: The connection string for the Postgres Database which is the following: postgres://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>. You can find the <HOST>:<PORT> information about the DB under the "Connectivity & security / Endpoint (/Port)" tab of the databases RDS page.

15. Optional environment variables:

- **MIGRATION_PASSWORD**: Required for creating a migration on the frontends "Migration" page. Defaults to "secret".
- **LOG_LEVEL**: Only for the `test` NODE_ENV. Defaults to "error".

## RDS (e.g., ndi@aa1jiteus75zy8h)

A Postgres Database is created to store the data for each environment. When creating a DB for an Elastic Beanstalk environment, by default the database created will get a name like this `awseb-e-<Environment ID>-...`. The default name of the RDS database is **ebdb**.

Database settings:

1. _Engine_ - "postgres"
2. _Version_ - "15.3"
3. _Instance class_ - "db.t3.micro"
4. _Storage_ - "20GB"
5. _Username_ - arbitrary, required in the "DB_URL" environment variable
6. _Password_ - arbitrary, required in the "DB_URL" environment variable
7. _Availability_ - "Low"
8. _Deletion policy_ - "Snapshot"

This DB is only available for the EC2 instance running inside the EB environment. In order to connect to the DB from a different client, port forwarding must be configured. In order to create an ssh tunnel and forward the traffic from the DB to locahost run to following commands:

```
# Create the tunnel using ssh. Please note that you need the private key for this command.
$ ssh -N  -L 5432:aa1p6s0h1so0mf9.cp0uibxnlhse.us-east-2.rds.amazonaws.com:5432 ec2-user@3.133.74.121 -i <PRIVATE_KEY>
# Connect to the DB on localhost:5432
$ psql -U cybersim --password -h 127.0.0.1 -p 5432
```
