-- Table: brs.StreetNames

-- DROP TABLE brs."StreetNames";

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
