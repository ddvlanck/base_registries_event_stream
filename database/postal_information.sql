CREATE TABLE brs."postal_information"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,
    "timestamp" character varying(30) NOT NULL,
    "postal_code" bigint NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),
    "postal_names" jsonb,
    "status" character varying,
    "index_numer" bigint,

    PRIMARY KEY ("event_id")
)


TABLESPACE pg_default;

ALTER TABLE brs."postal_information"
    OWNER to postgres;

COMMENT ON TABLE brs."postal_information"
    IS 'Stores the postal information objects.';

CREATE INDEX post_info_index
    ON brs.postal_information
    (object_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX post_info_index_index_number
    ON brs.postal_information
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;    
