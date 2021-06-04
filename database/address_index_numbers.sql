-- Add column index_number to table brs.addresses

ALTER TABLE brs.addresses
ADD COLUMN index_number bigint;

-- Update column index_number

With x as
(
	SELECT event_id, row_number() OVER (order by event_id ASC) index_number
	FROM brs.addresses
	WHERE event_can_be_published = 'true'
)

UPDATE brs.addresses
SET index_number = x.index_number
FROM x
WHERE x.event_id = brs.addresses.event_id;

-- Create index on column index_number

CREATE INDEX address_index_index_number
    ON brs.addresses
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;