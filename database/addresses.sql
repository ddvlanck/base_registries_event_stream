CREATE TABLE brs."addresses"
(
    "address_id" character varying(40) NOT NULL,
    "timestamp" character varying(30) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),
    "streetname_id" character varying(40),

    "postal_code" character varying(4),
    "house_number" character varying(10),
    "box_number" character varying(10),
    "address_status" character varying(20),
    "address_position" character varying(20),
    "position_geometry_method" character varying(20),
    "position_specification" character varying(20),
    "complete" boolean,
    "officially_assigned" boolean,

    PRIMARY KEY ("address_id", "timestamp")
)

-- TODO: Add index on object_id, complete

TABLESPACE pg_default;

ALTER TABLE brs."addresses"
    OWNER to postgres;
