-- Updates every first element in array of column geographical name
-- But sometimes array contains other items as well, so use with caution, because
-- if used to update second element in array, and array contains only 1 element,
-- it will return null.

UPDATE brs.street_names
SET geographical_name = jsonb_build_array(jsonb_set("geographical_name"::jsonb->0, '{@value}', to_jsonb(trim(BOTH '"' FROM "geographical_name"::jsonb->0->>'@value'))))