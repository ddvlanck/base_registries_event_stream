CREATE SCHEMA brs;

CREATE TABLE brs.projection_status
(
    "feed" character varying(40) NOT NULL,
    "position" bigint NOT NULL,
    PRIMARY KEY ("feed")
)

TABLESPACE pg_default;

ALTER TABLE brs.projection_status
    OWNER to postgres;

COMMENT ON TABLE brs.projection_status
    IS 'Stores the current position of the feed.';

CREATE TABLE brs."addresses"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,

    "address_id" character varying(40) NOT NULL,
    "timestamp" character varying(30) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),
    "streetname_id" character varying(40),

    "postal_code" character varying(4),
    "house_number" character varying(10),
    "box_number" character varying(10),
    "address_status" character varying(40),
    "address_position" character varying(50),
    "position_geometry_method" character varying(40),
    "position_specification" character varying(40),
    "complete" boolean,
    "officially_assigned" boolean,

    PRIMARY KEY ("event_id")
)


TABLESPACE pg_default;

ALTER TABLE brs."addresses"
    OWNER to postgres;

COMMENT ON TABLE brs."addresses"
    IS 'Stores the complete address objects.';

CREATE INDEX address_index
    ON brs.addresses
    (object_id ASC NULLS LAST, complete)
    TABLESPACE pg_default;

CREATE TABLE brs."street_names"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,

    "timestamp" character varying(30) NOT NULL,
    "street_name_id" character varying(40) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),

    "geographical_name" character varying(500),
    "geographical_name_language" character varying (4),

    "street_name_status" character varying(40),
    "nis_code" character varying(20),
    "complete" boolean,

    PRIMARY KEY ("event_id")
)

TABLESPACE pg_default;

ALTER TABLE brs."street_names"
    OWNER to postgres;

COMMENT ON TABLE brs."street_names"
    IS 'Stores the complete street name objects.';

CREATE INDEX str_name_index
    ON brs.street_names
    (object_id ASC NULLS LAST, complete)
    TABLESPACE pg_default;

CREATE TABLE brs."postal_information"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,
    "timestamp" character varying(30) NOT NULL,
    "postal_id" bigint NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),
    "postal_names" character varying(500)[],
    "postal_names_language" character varying(500)[],
    "nis_code" bigint,
    "status" character varying(50),

    PRIMARY KEY ("event_id")
)

-- TODO: Add index on object_id, complete

TABLESPACE pg_default;

ALTER TABLE brs."postal_information"
    OWNER to postgres;

COMMENT ON TABLE brs."postal_information"
    IS 'Stores the postal information objects.';

CREATE INDEX post_info_index
    ON brs.postal_information
    (object_id ASC NULLS LAST)
    TABLESPACE pg_default;

