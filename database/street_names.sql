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
    "nis_code" bigint,
    "complete" boolean,

    PRIMARY KEY ("event_id")
)

-- TODO: Add index on object_id, complete

TABLESPACE pg_default;

ALTER TABLE brs."street_names"
    OWNER to postgres;

COMMENT ON TABLE brs."street_names"
    IS 'Stores the complete street name objects.';
