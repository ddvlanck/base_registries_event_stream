-- Table: brs.Municipalities

-- DROP TABLE brs."Municipalities";

CREATE TABLE brs."municipalities"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,

    "timestamp" character varying(30) NOT NULL,
    "municipality_id" character varying(40) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),

    "official_languages" character varying(50)[],
    "facility_languages" character varying(50),
    "geographical_names" character varying (50)[],
    "geographical_name_languages" character varying(50)[],
    "status" character varying(50),

    PRIMARY KEY ("event_id")
)

-- TODO: Add index on object_id, complete

TABLESPACE pg_default;

ALTER TABLE brs."municipalities"
    OWNER to postgres;

COMMENT ON TABLE brs."municipalities"
    IS 'Stores the municipality objects.';

CREATE INDEX municipality_index
    ON brs.municipalities
    (object_id ASC NULLS LAST)
    TABLESPACE pg_default;

