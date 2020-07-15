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

To set up the project on your local environment run the following commands:

    - Clone the project by running git clone.
    - Install the node dependencies by running `npm install`
    - Create a .env file based on .env.example
    - Start Postgres by running `docker-compose up -d`
    - Start the API on localhost:3001 by running `npm start`

AWS environment:
The AWS environment supports both continuous integration and continuous deployment. The environment is made of the following components:

    - Github repository (nditech/CyberSim-Backend): Each change on the local repositories are pushed to a new branch in the Github remote. Once these changes are   reviewed, they are merged into the `master` branch.

    - CodePipeline (ndi-cybersim-backend-staging, ndi-cybersim-backend-prod): A CodePipeline project is created for both staging and production environments. For the staging environment a webhook is registered on Github, so each change on the `master` branch will trigger and automatic build on AWS. For the production environment no webhook is registered so changes on the `master` branch will require a manual release in CodePipeline.

    - CodeBuild (ndi-cybersim-backend): A single CodeBuild project is created to build and test both staging and production changes. After a change is triggered on CodePiepeline (manually or automatically), the source code is transferred to CodeBuild and the steps defined in the `buildspec.yml` file are  executed. These steps include the installation of node, npm packages and Postgres on a virtual machine and the execution of predefined database related testes. Once these tests are run, CodePiepeline begins the deployment.

    - Elastic Beanstalk (NdiCybersimBackend-staging, NdiCybersimBackend-prod): In Elastic Beanstalk (EB) a different environment is created for both staging and production. In both environment the node application is run inside Docker containers so an existing Dockerfile inside the source code is necessary for EB. The docker containers are created based on the Dockerfile. Once the deployment is compleated, the API will be live. For EB the following environment variables must be set:
        - PORT: The PORT must match the port exposed in the docker container which currently is 3001.
        - NODE_ENV: Must be either `production` or `development`. If the given value is 'development' the server will reset the Postgres Database on each restart.
        - DB_URL: The connection string for the Postgres Database which is the following: postgres://<USERNAME>:<PASSWORD>@<ENDPOINT>:<PORT>/<DB_NAME>
    These variables can be set seberatly for each EB environment under the Configuration/Software Tab of the AWS Console.

    - RDS (aa1p6s0h1so0mf9): A Postgres Database is created to store the data for both staging and production environments.
