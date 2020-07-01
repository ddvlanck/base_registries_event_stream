# Base registries event stream

## Quick Start

Start everything:

```bash
git clone git@github.com:ddvlanck/base_registries_event_stream.git
npm i
docker-compose up --build
```

Some example API endpoints you can use:

* [localhost:8000/address](http://localhost:8000/address)
* [localhost:8000/address/1305718](http://localhost:8000/address/1305718)

You can connect to PgAdmin at [localhost:8001](http://localhost:8001) with user `dev@dev.be` and password `dev`. The database to add is at host `db` using username `postgres` and password `dev`.

## Install it

Clone this repository and run `npm install`

## Running the server

There are 2 possibilities at the moment:

* Start the fetcher
* Start the data server

### Start fetcher

Run `npm build` followed by `npm run fetch` to start the fetcher. The fetcher will read the configuration file **feed_config.json** to know the starting point of the different streams. Only enabled streams in the configuration file will be processed.

NOTE: at this moment, the fetcher will only fetch the first page of the stream.

### Start the server

TODO

## Prerequisites

Both fetcher and server expect a PostgreSQL database to be running on its default port (`5432`). To start a database, go to the `database` folder and run the command `docker-compose up`.
