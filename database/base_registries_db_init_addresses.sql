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
