-- Table: brs.Municipalities

-- DROP TABLE brs."Municipalities";

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