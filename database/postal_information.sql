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
