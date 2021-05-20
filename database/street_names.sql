CREATE TABLE brs."street_names"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying NOT NULL,

    "timestamp" character varying NOT NULL,
    "street_name_id" character varying NOT NULL,

    "object_id" bigint,
    "object_uri" character varying,

    "geographical_name" jsonb,

    "street_name_status" character varying,
    "homonym" character varying,
    "nis_code" character varying,

    PRIMARY KEY ("event_id")
)

TABLESPACE pg_default;

ALTER TABLE brs."street_names"
    OWNER to postgres;

COMMENT ON TABLE brs."street_names"
    IS 'Stores the complete street name objects.';

CREATE INDEX str_name_index
    ON brs.street_names
    (object_id ASC NULLS LAST)
    TABLESPACE pg_default;