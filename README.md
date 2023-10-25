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
- **NODE_ENV**: Must be either `production`, `development`. (DEVNOTE: for local development it can be `test`. If the given value is `test` the server will reset the Postgres Database on each restart.)
- **DB_URL**: The connection string for the Postgres Database which is the following: postgres://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DB_NAME>. You can find the <HOST>:<PORT> information about the DB under the "Connectivity & security / Endpoint (/Port)" tab of the databases RDS page.

15. Optional environment variables:

- **MIGRATION_PASSWORD**: Required for creating a migration on the frontends "Migration" page. Defaults to "secret".
- **LOG_LEVEL**: Possible values: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'. If it's not set, defaults to 'error'.

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

# Data Migration

The application relies on a PostgreSQL database, but the initial data is sourced from an Airtable base. If you wish to customize the data for a new game, including events, locations, actions, and more, you can achieve this by modifying the data within the Airtable base.

Before running a new game with modified data, it is essential to perform a "migration" from Airtable to the PostgreSQL database.
Go to the `<host>/migration` page (e.g. (https://cybersim.demcloud.org/migrate)[https://cybersim.demcloud.org/migrate]) and follow the step-by-step guide below to complete the migration process:

## Step-by-Step Migration Guide

1. **Master Password**

   - Remember to set the `MIGRATION_PASSWORD` environment variable in the backend application to access the master password needed for the migration process.

2. **Access Airtable**

   - Visit [https://airtable.com](https://airtable.com) and log in to your Airtable account.

3. **Navigate to Developer Hub**

   - From the Airtable menu, navigate to the "Developer Hub."

4. **Generate a Personal Access Token**

   - Create a new "Personal access token" within the Developer Hub.

5. **Retrieve Airtable Base ID**

   - Go to the Airtable base you wish to migrate from and copy the BASE_ID segment from the page URL. It should look something like this: "https://airtable.com/BASE_ID/TABLE_ID/ETC...".
   - Paste the copied BASE_ID into the "Airtable base id" input field on the migration form.

6. **Initiate the Migration**
   - After filling in the relevant Airtable details, click the "Migrate the database" button.

By following these steps, you can successfully migrate data from Airtable to the PostgreSQL database, ensuring that your new game incorporates the customized data you have prepared.

# Airtable Handbook

### PURCHASED MITIGATIONS

In the game, mitigations are organized into groups according to their category. You can customize the order of these mitigations using the following steps:

1. Access the "purchase_mitigations" table.
2. In the toolbar, click on the "Group" option, and then select the "category" field. Airtable will automatically reorganize the mitigations, grouping them just as they appear in the application.
3. Within each category, you can rearrange the mitigations according to your preferences using the drag-and-drop feature. The order you set here will reflect how they appear in the actual game.

### LOCATIONS

Currently, the game exclusively accommodates exactly two locations. You have the flexibility to name these locations as you desire within the "locations" table.

:warning: **Please exercise caution and refrain from modifying the "location_code" fields. Altering the default values ('hq', 'local') here can disrupt the application's functionality!** :warning:

Changing the names of the locations in this section will solely impact how they are displayed in the header menu, tabs, and action titles. Role names (e.g., "HQ IT Team") remain distinct and should be configured separately within the **ROLES** table.

## DICTIONARY

You have the ability to modify the terminology associated with "polls" in this section. For instance, you can replace "poll" or "budget" with alternative words. To introduce a new synonym, simply edit the synonym column as needed.
