-- ============================================================
-- RESET + SEED DATA (PostgreSQL)
-- ============================================================

BEGIN;

-- TRUNCATE TABLE
--   delivery_note_items,
--   delivery_notes,
--   payments,
--   order_items,
--   sales_orders,
--   agents,
--   warehouse_staffs,
--   managers,
--   users
-- RESTART IDENTITY CASCADE;

-- 1) USERS
INSERT INTO users (dtype, username, password, role) VALUES
  ('ADMIN',           'admin',      '123456', 'ADMIN'),
  ('ADMIN',           'admin2',     '123456', 'ADMIN'),
  ('AGENT',           'agent1',     '123456', 'AGENT'),
  ('AGENT',           'agent2',     '123456', 'AGENT'),
  ('AGENT',           'agent3',     '123456', 'AGENT'),
  ('WAREHOUSE_STAFF', 'warehouse1', '123456', 'WAREHOUSE_STAFF'),
  ('WAREHOUSE_STAFF', 'warehouse2', '123456', 'WAREHOUSE_STAFF');

-- 2) MANAGERS
INSERT INTO managers (id)
SELECT id FROM users WHERE username IN ('admin', 'admin2');

-- 3) AGENTS
INSERT INTO agents (id, code, name, phone, address, manager_id)
SELECT
  u.id,
  'AG001',
  'Dai ly Mien Bac',
  '0901111111',
  '12 Le Loi, Ha Noi',
  (SELECT m.id FROM managers m JOIN users um ON um.id = m.id WHERE um.username = 'admin')
FROM users u
WHERE u.username = 'agent1';

INSERT INTO agents (id, code, name, phone, address, manager_id)
SELECT
  u.id,
  'AG002',
  'Dai ly Mien Trung',
  '0902222222',
  '34 Nguyen Hue, Da Nang',
  (SELECT m.id FROM managers m JOIN users um ON um.id = m.id WHERE um.username = 'admin')
FROM users u
WHERE u.username = 'agent2';

INSERT INTO agents (id, code, name, phone, address, manager_id)
SELECT
  u.id,
  'AG003',
  'Dai ly Mien Nam',
  '0903333333',
  '56 Ly Tu Trong, TP HCM',
  (SELECT m.id FROM managers m JOIN users um ON um.id = m.id WHERE um.username = 'admin2')
FROM users u
WHERE u.username = 'agent3';

-- 4) WAREHOUSE STAFFS
INSERT INTO warehouse_staffs (id, name)
SELECT id, 'Le Van Kho' FROM users WHERE username = 'warehouse1';

INSERT INTO warehouse_staffs (id, name)
SELECT id, 'Pham Thi Nhap' FROM users WHERE username = 'warehouse2';

-- 5) SALES ORDERS
INSERT INTO sales_orders (agent_id, total_estimated_price, status, created_at, approved_by, approved_at)
VALUES
(
  (SELECT a.id FROM agents a WHERE a.code = 'AG001'),
  13000000.00,
  'COMPLETED',
  TIMESTAMP '2026-04-01 09:00:00',
  (SELECT m.id FROM managers m JOIN users u ON u.id = m.id WHERE u.username = 'admin'),
  TIMESTAMP '2026-04-01 10:00:00'
),
(
  (SELECT a.id FROM agents a WHERE a.code = 'AG002'),
  8200000.00,
  'APPROVED',
  TIMESTAMP '2026-04-03 11:00:00',
  (SELECT m.id FROM managers m JOIN users u ON u.id = m.id WHERE u.username = 'admin2'),
  TIMESTAMP '2026-04-03 12:00:00'
),
(
  (SELECT a.id FROM agents a WHERE a.code = 'AG003'),
  2500000.00,
  'PENDING',
  TIMESTAMP '2026-04-05 14:30:00',
  NULL,
  NULL
);

-- 6) ORDER ITEMS
INSERT INTO order_items (sales_order_id, product_name, product_link, quantity, estimated_unit_price)
VALUES
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001' AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'),
  'May khoan Bosch GSB 13 RE',
  'https://example.com/bosch-gsb13re',
  5,
  1200000.00
),
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001' AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'),
  'May cat sat Makita M2401B',
  'https://example.com/makita-m2401b',
  2,
  3500000.00
),
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG002' AND s.created_at = TIMESTAMP '2026-04-03 11:00:00'),
  'Bo tua vit cach dien 13 chi tiet',
  'https://example.com/bo-tua-vit',
  10,
  320000.00
),
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG003' AND s.created_at = TIMESTAMP '2026-04-05 14:30:00'),
  'Kim bam dien mini 8 inch',
  'https://example.com/kim-bam-dien',
  20,
  125000.00
);

-- 7) PAYMENTS
INSERT INTO payments (
  sales_order_id, method, status, amount, note, created_at, paid_at, confirmed_by
)
VALUES
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001' AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'),
  'BANK_TRANSFER',
  'PAID',
  13000000.00,
  'Da chuyen khoan theo noi dung HD AG001',
  TIMESTAMP '2026-04-01 15:00:00',
  TIMESTAMP '2026-04-01 16:00:00',
  (SELECT m.id FROM managers m JOIN users u ON u.id = m.id WHERE u.username = 'admin')
),
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG002' AND s.created_at = TIMESTAMP '2026-04-03 11:00:00'),
  'BANK_TRANSFER',
  'PENDING',
  8200000.00,
  'Cho doi soat giao dich',
  TIMESTAMP '2026-04-03 13:00:00',
  NULL,
  NULL
),
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG003' AND s.created_at = TIMESTAMP '2026-04-05 14:30:00'),
  'CASH_ON_DELIVERY',
  'PENDING',
  2500000.00,
  'Thu tien khi giao hang',
  TIMESTAMP '2026-04-05 16:00:00',
  NULL,
  NULL
);

-- 8) DELIVERY NOTES
INSERT INTO delivery_notes (
  sales_order_id, agent_id, warehouse_staff_id,
  tracking_code, carrier_name, shipping_fee, created_at
)
VALUES
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001' AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'),
  (SELECT a.id FROM agents a WHERE a.code = 'AG001'),
  (SELECT ws.id FROM warehouse_staffs ws JOIN users u ON u.id = ws.id WHERE u.username = 'warehouse1'),
  'TRACK-AG001-001',
  'Giao Hang Nhanh',
  60000.00,
  TIMESTAMP '2026-04-02 09:30:00'
),
(
  (SELECT s.id FROM sales_orders s JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001' AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'),
  (SELECT a.id FROM agents a WHERE a.code = 'AG001'),
  (SELECT ws.id FROM warehouse_staffs ws JOIN users u ON u.id = ws.id WHERE u.username = 'warehouse2'),
  'TRACK-AG001-002',
  'Viettel Post',
  75000.00,
  TIMESTAMP '2026-04-02 10:00:00'
);

-- 9) DELIVERY NOTE ITEMS
INSERT INTO delivery_note_items (delivery_note_id, order_item_id, delivered_quantity)
VALUES
(
  (SELECT dn.id FROM delivery_notes dn WHERE dn.tracking_code = 'TRACK-AG001-001'),
  (SELECT oi.id
   FROM order_items oi
   JOIN sales_orders s ON s.id = oi.sales_order_id
   JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001'
     AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'
     AND oi.product_name = 'May khoan Bosch GSB 13 RE'),
  5
),
(
  (SELECT dn.id FROM delivery_notes dn WHERE dn.tracking_code = 'TRACK-AG001-002'),
  (SELECT oi.id
   FROM order_items oi
   JOIN sales_orders s ON s.id = oi.sales_order_id
   JOIN agents a ON a.id = s.agent_id
   WHERE a.code = 'AG001'
     AND s.created_at = TIMESTAMP '2026-04-01 09:00:00'
     AND oi.product_name = 'May cat sat Makita M2401B'),
  2
);

COMMIT;
