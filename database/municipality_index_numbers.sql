-- Add column index_number on table brs.municipalities

ALTER TABLE brs.municipalities
ADD COLUMN index_number bigint;

-- Update column index_number

With x as
(
	SELECT event_id, row_number() OVER (order by event_id ASC) index_number
	FROM brs.municipalities
)

UPDATE brs.municipalities
SET index_number = x.index_number
FROM x
WHERE x.event_id = brs.municipalities.event_id;

-- Create index on column index_number

CREATE INDEX municipality_index_index_number
    ON brs.municipalities
    (index_number ASC NULLS LAST)
    TABLESPACE pg_default;