CREATE SCHEMA brs;

CREATE TABLE brs."StreetNames"
(
    "EventID" bigint NOT NULL,
    "EventName" text COLLATE pg_catalog."default" NOT NULL,
    "Timestamp" text COLLATE pg_catalog."default" NOT NULL,
    "StreetNameID" text COLLATE pg_catalog."default" NOT NULL,
    "StreetNameURI" text COLLATE pg_catalog."default",
    "GeographicalName" text COLLATE pg_catalog."default",
	"GeographicalNameLanguage" text COLLATE pg_catalog."default",
    "Status" text COLLATE pg_catalog."default",
    "NisCode" bigint,
    "IsComplete" text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE brs."StreetNames"
    OWNER to postgres;

CREATE TABLE brs."Municipalities"
(
    "EventID" bigint NOT NULL,
    "EventName" text COLLATE pg_catalog."default" NOT NULL,
    "Timestamp" text COLLATE pg_catalog."default" NOT NULL,
    "MunicipalityID" text COLLATE pg_catalog."default",
    "MunicipalityURI" text COLLATE pg_catalog."default",
    "OfficialLanguage" text[] COLLATE pg_catalog."default",
    "GeographicalName" text[] COLLATE pg_catalog."default",
    "GeographicalNameLanguage" text[] COLLATE pg_catalog."default",
    "Status" text COLLATE pg_catalog."default"
)

TABLESPACE pg_default;

ALTER TABLE brs."Municipalities"
    OWNER to postgres;

CREATE TABLE brs."Addresses"
(
    "EventID" bigint NOT NULL,
    "EventName" text COLLATE pg_catalog."default" NOT NULL,
    "Timestamp" text COLLATE pg_catalog."default" NOT NULL,
    "AddressID" text COLLATE pg_catalog."default" NOT NULL,
    "AddressURI" text COLLATE pg_catalog."default",
    "StreetNameID" text COLLATE pg_catalog."default",
    "PostalCode" bigint,
    "AddressStatus" text COLLATE pg_catalog."default",
    "HouseNumber" text COLLATE pg_catalog."default",
    "FlatNumber" text COLLATE pg_catalog."default",
    "PositionGeometryMethod" text COLLATE pg_catalog."default",
    "PositionSpecification" text COLLATE pg_catalog."default",
    "IsComplete" boolean,
    "OfficiallyAssigned" boolean,
    "AddressPosition" text COLLATE pg_catalog."default"
)

-- error with type of AdresPositie, so set on text for now

TABLESPACE pg_default;

ALTER TABLE brs."Addresses"
    OWNER to postgres;
