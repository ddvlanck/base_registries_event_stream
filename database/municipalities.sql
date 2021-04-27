-- Table: brs.municipalities

-- DROP TABLE brs."municipalities";

CREATE TABLE brs."municipalities"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,

    "timestamp" character varying(30) NOT NULL,
    "municipality_id" character varying(40) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),

    "official_language" character varying(50)[],
    "facility_language" character varying(50)[],
    "municipality_name" jsonb,
    "status" character varying,

    PRIMARY KEY ("event_id")
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

