# Base registries event stream

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
