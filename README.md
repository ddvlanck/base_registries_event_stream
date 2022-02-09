# Base Registries Linked Data Event Streams

![Build status](https://github.com/ddvlanck/base_registries_event_stream/actions/workflows/ci.yml/badge.svg)

This repository publishes the various entities in the address registry as a Linked Data Event Stream. Every object in this Linked Data Event Stream complies with one of the official data model of the Flemish Interoperability program ([OSLO](https://data.vlaanderen.be/) - website in Dutch), short for Open Standards for Linked Organizations 

The fetcher in this repository reads the original event streams (ATOM feeds) of the address registry and stores the objects which comply with the data model. The API exposes the objects within a Linked Data Event Stream.

## Get started

Clone this repository and run `npm install`. There's a special dependency `dependencies/wait-for-postgres` that needs to be installed too. So navigate to this folder and run the `npm install` command again.

### Configuration

This repository contains one configuration file, called `config.json` that contains information about the database, domain name and also the feeds that need to be published. It is important to configure this file before starting, because in this file, users have to enable or disable which original event streams must be replicated.

**Note: in order to be able to fetch the original streams, an API key is needed! Please direct your question to the team of the address registry.**

## Starting the application

### With Docker
Just run the following command in the root folder (folder where the docker-compose file is located):

```bash
docker-compose up --build
```

That's it, you've done it! Docker will take care of everything and start the necessary components.

### Without Docker

When you choose to run this application without Docker, you have to do all the work yourself. The application expects a Postgres database to run on its default port (5432). Then, create a database and the necessary tables (scripts are provided in the database folder). It's easiest to use the values in the configuration file:

- Database name: `base_registries`
- Username: `postgres`,
- Password: `dev`

When this is done, you're good to go. You will have to install PgAdmin yourself if you want to use it (download link [here](https://www.pgadmin.org/download/)). Again, only enabled feeds will be processed, so check the configuration file if the feeds you want to process are enabled. To start the fetcher, run the command `npm run fetch` and it will start processing. To start the API, run `npm run start`

### PgAdmin

The docker-compose file also starts a frontend for the database, [PgAdmin](https://www.pgadmin.org/). You can connect to PgAdmin at port `8001` (when you run local: [localhost:8001](http://localhost:8001)) with user `dev@dev.be` and password `dev`. When this is the first time you start PgAdmin, right-click on Server and choose 'create server'. Give the server a name and enter the following information on the Connection tab:

- Host: `db`
- User: `postgres`
- Password: `dev`

### Exposed ports

The API is available through its own port `3000` or through nginx (port `5000`)

## API endpoints

The API endpoints that are available are the following:

- `/adres{?generatedAtTime}` - This endpoint will return all events for **all addresses**
- `/straatnaam{?generatedAtTime}` - This endpoint will return all events for **all street names**
- `/postinfo{?generatedAtTime}` - This endpoint will return all events for **all postal info events**
- `/gemeente{?generatedAtTime}`- This endpoint will return all events for **all municipality events**

## Important note

One would assume that an event stream always has a time-based fragmenating, starting with the oldest event. However, in Flanders the address registry does not always receive the events at the time they occurred, due to latency, human errors, ... . That means that in the Linked Data Event Streams for the entities in the Flemish address registry, events are published in the order they were received by the system. This ensures that it is possible that an event from for example 2019, is published this year, and thus in this case we can't apply a time-based fragmentation.
