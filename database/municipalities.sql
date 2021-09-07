-- Table: brs.municipalities

-- DROP TABLE brs."municipalities";

CREATE TABLE brs."municipalities"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,

    "timestamp" character varying(30) NOT NULL,
    "record_generated_time" character varying NOT NULL,
    "municipality_id" character varying(40) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),

    "official_language" character varying(50)[],
    "facility_language" character varying(50)[],
    "municipality_name" jsonb,
    "status" character varying,
    "index_number" bigint,

    PRIMARY KEY ("event_id"),
    UNIQUE("record_generated_time", "municipality_id")
)

TABLESPACE pg_default;

ALTER TABLE brs."municipalities"
    OWNER to postgres;

COMMENT ON TABLE brs."municipalities"
    IS 'Stores the municipality objects.';

CREATE INDEX municipality_index
    ON brs.municipalities
    (object_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX municipality_index_index_number
    ON brs.municipalities
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;
