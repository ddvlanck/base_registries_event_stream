CREATE TABLE brs."address_municipality"
(
    "municipality_id" character varying(50) NOT NULL,
    "persistent_identifier" character varying(200) NOT NULL,
    "nis_code" character varying NOT NULL,
    "municipality_name" character varying,
    "event_id" BIGINT NOT NULL,
    "timestamp" character varying(50) NOT NULL,

    PRIMARY KEY ("municipality_id")
)


TABLESPACE pg_default;

ALTER TABLE brs."address_municipality"
    OWNER to postgres;

COMMENT ON TABLE brs."address_municipality"
    IS 'Stores relevant information about municipalities, needed in addresses';

CREATE INDEX address_municipality_index
    ON brs.address_municipality
    (municipality_id ASC NULLS LAST)
    TABLESPACE pg_default;