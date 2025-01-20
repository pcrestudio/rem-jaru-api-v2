DROP TRIGGER IF EXISTS before_update_SectionAttributeValue;

CREATE TRIGGER before_update_SectionAttributeValue
BEFORE UPDATE ON SectionAttributeValue
FOR EACH ROW
INSERT INTO SectionAttributeValueHistory (sectionAttributeValueId, oldValue, changedBy)
VALUES (OLD.sectionAttributeId, OLD.value, 'trigger');