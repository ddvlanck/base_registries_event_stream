CREATE TABLE brs."buildings"
(
    "event_id" bigint NOT NULL,
    "event_name" character varying(200) NOT NULL,
    "timestamp" character varying(30) NOT NULL,

    "building_id" character varying(50) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),


    "building_status" character varying(50),
    "geometry_method" character varying(50),
    "geometry_polygon" character varying(1000),
    "building_units" character varying(50)[],
    "complete" boolean,

    PRIMARY KEY ("event_id")
);

CREATE TABLE brs."building_units"
(
    "building_unit_id" character varying(500) NOT NULL,
    "event_id" bigint NOT NULL,
    "building_id" character varying(50) NOT NULL,

    "object_id" bigint,
    "object_uri" character varying(500),

    "building_unit_status" character varying(50),
    "position_geometry_method" character varying(50),
    "geometry_point" character varying(50),
    "function" character varying(50),
    "complete" boolean,

    PRIMARY KEY ("building_unit_id", "event_id")
)

TABLESPACE pg_default;

ALTER TABLE brs."buildings"
    OWNER to postgres;


ALTER TABLE brs."building_units"
    OWNER to postgres;

COMMENT ON TABLE brs."buildings"
    IS 'Stores the complete building objects.';

COMMENT ON TABLE brs."building_units"
    IS 'Stores the complete building_unit objects.';

CREATE INDEX building_index
    ON brs.buildings
    (object_id ASC NULLS LAST, complete)
    TABLESPACE pg_default;


