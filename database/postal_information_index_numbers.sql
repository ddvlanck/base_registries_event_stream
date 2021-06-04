-- Add column index_number on table brs.postal_information

ALTER TABLE brs.postal_information
ADD COLUMN index_number bigint;

-- Update column index_number

With x as
(
	SELECT event_id, row_number() OVER (order by event_id ASC) index_number
	FROM brs.postal_information
)

UPDATE brs.postal_information
SET index_number = x.index_number
FROM x
WHERE x.event_id = brs.postal_information.event_id;

-- Create index on column index_number

CREATE INDEX postal_information_index_index_number
    ON brs.postal_information
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;