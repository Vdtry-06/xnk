-- ============================================================
-- USERS
-- ============================================================
INSERT INTO users (dtype, username, password, role)
SELECT 'ADMIN', 'admin', '123456', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

INSERT INTO users (dtype, username, password, role)
SELECT 'WAREHOUSE_STAFF', 'warehouse1', '123456', 'WAREHOUSE_STAFF'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'warehouse1');

INSERT INTO users (dtype, username, password, role)
SELECT 'WAREHOUSE_STAFF', 'warehouse2', '123456', 'WAREHOUSE_STAFF'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'warehouse2');

INSERT INTO users (dtype, username, password, role)
SELECT 'AGENT', 'agent1', '123456', 'AGENT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'agent1');

INSERT INTO users (dtype, username, password, role)
SELECT 'AGENT', 'agent2', '123456', 'AGENT'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'agent2');

-- ============================================================
-- MANAGERS
-- ============================================================
INSERT INTO managers (id)
SELECT id FROM users WHERE username = 'admin'
AND NOT EXISTS (SELECT 1 FROM managers WHERE id = (SELECT id FROM users WHERE username = 'admin'));

-- ============================================================
-- WAREHOUSE STAFFS
-- ============================================================
INSERT INTO warehouse_staffs (id, name)
SELECT id, 'Lê Văn Cường' FROM users WHERE username = 'warehouse1'
AND NOT EXISTS (SELECT 1 FROM warehouse_staffs WHERE id = (SELECT id FROM users WHERE username = 'warehouse1'));

INSERT INTO warehouse_staffs (id, name)
SELECT id, 'Phạm Thị Dung' FROM users WHERE username = 'warehouse2'
AND NOT EXISTS (SELECT 1 FROM warehouse_staffs WHERE id = (SELECT id FROM users WHERE username = 'warehouse2'));

-- ============================================================
-- AGENTS
-- ============================================================
INSERT INTO agents (id, code, name, phone, address, manager_id)
SELECT u.id, 'AG001', 'Đại lý Hà Nội', '0901234567', '123 Phố Huế, Hà Nội',
       (SELECT m.id FROM managers m JOIN users um ON um.id = m.id WHERE um.username = 'admin')
FROM users u WHERE u.username = 'agent1'
AND NOT EXISTS (SELECT 1 FROM agents WHERE id = (SELECT id FROM users WHERE username = 'agent1'));

INSERT INTO agents (id, code, name, phone, address, manager_id)
SELECT u.id, 'AG002', 'Đại lý TP.HCM', '0912345678', '456 Nguyễn Huệ, TP.HCM',
       (SELECT m.id FROM managers m JOIN users um ON um.id = m.id WHERE um.username = 'admin')
FROM users u WHERE u.username = 'agent2'
AND NOT EXISTS (SELECT 1 FROM agents WHERE id = (SELECT id FROM users WHERE username = 'agent2'));

UPDATE agents
SET manager_id = (SELECT m.id FROM managers m JOIN users um ON um.id = m.id WHERE um.username = 'admin')
WHERE code IN ('AG001', 'AG002') AND manager_id IS NULL;
