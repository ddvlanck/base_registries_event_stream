CREATE TABLE brs.projection_status
(
    "feed" character varying(40) NOT NULL,
    "position" bigint NOT NULL,
    PRIMARY KEY ("feed")
)

TABLESPACE pg_default;

ALTER TABLE brs.projection_status
    OWNER to postgres;

COMMENT ON TABLE brs.projection_status
    IS 'Stores the current position of the feed.';
