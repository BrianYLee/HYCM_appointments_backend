DELIMITER $$
CREATE TRIGGER insert_employee_on_approve
AFTER UPDATE ON applications FOR EACH ROW
BEGIN
	IF OLD.is_approved IS NULL AND NEW.is_approved = TRUE THEN
		INSERT INTO employees (wechat_open_id, active, last_name, first_name, phone, department) VALUES (NEW.openid, TRUE, NEW.last_name, NEW.first_name, NEW.phone, NEW.department);
	END IF;
END $$
DELIMITER ;