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
