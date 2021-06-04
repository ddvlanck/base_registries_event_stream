CREATE TABLE brs."addresses"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,

    "address_id" character varying(40) NOT NULL,
    "timestamp" character varying(50) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),
    "streetname_id" character varying(40),

    "postal_code" character varying(4),
    "house_number" character varying(10),
    "box_number" character varying(10),
    "address_status" character varying,
    "address_geometry" character varying,
    "position_geometry_method" character varying,
    "position_specification" character varying,
    "officially_assigned" boolean,
    "event_can_be_published" boolean,
    "index_number" bigint,

    PRIMARY KEY ("event_id")
)


TABLESPACE pg_default;

ALTER TABLE brs."addresses"
    OWNER to postgres;

COMMENT ON TABLE brs."addresses"
    IS 'Stores the complete address objects.';

CREATE INDEX address_index
    ON brs.addresses
    (object_id ASC NULLS LAST, event_can_be_published)
    TABLESPACE pg_default;

CREATE INDEX address_index_index_number
    ON brs.addresses
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;    
