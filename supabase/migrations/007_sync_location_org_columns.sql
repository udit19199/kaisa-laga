UPDATE locations
SET
  organization_id = COALESCE(organization_id, org_id),
  org_id = COALESCE(org_id, organization_id)
WHERE organization_id IS NULL
   OR org_id IS NULL
   OR organization_id <> org_id;

CREATE OR REPLACE FUNCTION sync_location_org_columns()
RETURNS TRIGGER AS $$
BEGIN
  NEW.organization_id = COALESCE(NEW.organization_id, NEW.org_id);
  NEW.org_id = COALESCE(NEW.org_id, NEW.organization_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS locations_sync_org_columns ON locations;
CREATE TRIGGER locations_sync_org_columns
  BEFORE INSERT OR UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION sync_location_org_columns();
