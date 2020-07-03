# Base registries event stream

This repository publishes event streams of base registries, such as addresses and street names as Linked Open Data and tries to be compliant with the data models of the Flemish Interoperability program ([OSLO](https://data.vlaanderen.be/) - Open Standards for Linked Organizations (only available in dutch)).

## Get started

Clone this repository and run `npm install`. There's a special dependency `depdencies/wait-for-postgres` that needs to be installed too. So navigate to this folder and run the `npm install` command again.

### Configuration

This repository contains one configuration file, called `config.json` that contains information about the database, domain name and also the feeds that need to be published. **So it's very important to change the domain name when deploying this application online**. Furthermore, the application will only process feeds that are enabled. Take a look at the feeds in the config file and enable/disable them.

To run this application, there are 2 possibilities: with or without Docker.

### Run with Docker

This is the easiest option. Just run the following command in the root folder (folder where the docker-compose file is located):
```
docker-compose up --build
```
That's it, you've done it! Docker will take care of everything and start the necessary components. 

#### PgAdmin

This docker-compose file also starts a frontend for the database, [PgAdmin](https://www.pgadmin.org/). You can connect to PgAdmin at port `8001` (when you run local: [localhost:8001](http://localhost:8001)) with user `dev@dev.be` and password `dev`. When this is the first time you start PgAdmin, right-click on Server and choose 'create server'. Give the server a name and enter the following information on the Connection tab:
- Host: `db`
- User: `postgres`
- Password: `dev`

#### Exposed ports

The API is available through its own port `3000` or through nginx (port `5000`)

### Run without Docker

When you choose to run this application without Docker, you have to do all the work yourself. The application expects a Postgres database to run on its default port (`5432`). Then, create a database and the necessary tables (scripts are provided in the `database` folder). It's easiest to use the values in the configuration file:
- Database name: `base_registries`
- Username: `postges`,
- Password: `dev`
When this is done, you're good to go. You will have to install PgAdmin yourself if you want to use it (download link [here](https://www.pgadmin.org/download/)).

Again, only enabled feeds will be processed, so check the configuration file if the feeds you want to process are enabled. To start the fetcher, run the command `npm run fetch` and it will start processing. To start the API, run `npm run start`. In the next section, the available endpoints are discussed

## API endpoints

The API endpoints that are available are the following:
- /address{?page} - This endpoint will return all events for all addresses, starting with the oldest event
- /address/:objectId{?page} - This endpoint will return all events for a specific address, starting with the oldest event
- /streetname{?page} - This endpoint will return all events for **all street names**, starting with the oldest event

