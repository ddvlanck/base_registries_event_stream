UPDATE brs.street_names
SET geographical_name = jsonb_set("geographical_name"::jsonb->0, '{@value}', to_jsonb(trim(BOTH '"' FROM "geographical_name"::jsonb->0->>'@value')))