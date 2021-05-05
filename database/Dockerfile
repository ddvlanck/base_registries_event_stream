FROM postgres

LABEL maintainer "Informatie Vlaanderen <informatievlaanderen@vlaanderen.be>"

COPY init_db.sql /docker-entrypoint-initdb.d/01-init_db.sql
COPY projection_status.sql /docker-entrypoint-initdb.d/02-projection_status.sql
COPY municipalities.sql /docker-entrypoint-initdb.d/03-municipalities.sql
COPY postal_information.sql /docker-entrypoint-initdb.d/04-postal_information.sql
COPY street_names.sql /docker-entrypoint-initdb.d/05-street_names.sql
COPY addresses.sql /docker-entrypoint-initdb.d/06-addresses.sql
COPY address_municipality.sql /docker-entrypoint-initdb.d/07-address_municipality.sql
COPY address_streetname.sql /docker-entrypoint-initdb.d/08-address_streetname.sql

