DELIMITER $$

CREATE TRIGGER jaru_v2.before_update_SectionAttributeValue
AFTER UPDATE ON jaru_v2.SectionAttributeValue
FOR EACH ROW
BEGIN
  IF OLD.value <> NEW.value OR
     OLD.modifiedBy <> NEW.modifiedBy OR
     OLD.modelType <> NEW.modelType THEN

    -- Insertar en SectionAttributeValueHistory
    INSERT INTO jaru_v2.SectionAttributeValueHistory (
      sectionAttributeValueId,
      oldValue,
      changeDate,
      changedBy
    ) VALUES (
      OLD.sectionAttributeValueId,
      OLD.value,
      NOW(),
      NEW.modifiedBy
    );
  END IF;
END$$

DELIMITER ;