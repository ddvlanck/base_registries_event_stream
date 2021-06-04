-- Add column index_number to table brs.street_names

ALTER TABLE brs.street_names
ADD COLUMN index_number bigint;

-- Update column index_number

With x as
(
	SELECT event_id, row_number() OVER (order by event_id ASC) index_number
	FROM brs.street_names
)

UPDATE brs.street_names
SET index_number = x.index_number
FROM x
WHERE x.event_id = brs.street_names.event_id;

-- Create index on column index_number

CREATE INDEX street_name_index_index_number
    ON brs.street_names
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;