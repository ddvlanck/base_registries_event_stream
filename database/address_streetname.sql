CREATE TABLE brs."address_streetname"
(
    "streetname_id" character varying(50) NOT NULL,
    "persistent_identifier" character varying(200),
    "nis_code" character varying(50) NOT NULL,
    "event_id" BIGINT NOT NULL,
    "timestamp" character varying(50) NOT NULL,

    PRIMARY KEY ("streetname_id")
)


TABLESPACE pg_default;

ALTER TABLE brs."address_streetname"
    OWNER to postgres;

COMMENT ON TABLE brs."address_streetname"
    IS 'Stores the persistent identifier and name for each streetname, needed in addresses';

CREATE INDEX address_streetname_index
    ON brs.address_streetname
    (streetname_id ASC NULLS LAST)
    TABLESPACE pg_default;
