# ImportManager — 3 luồng nghiệp vụ chính

## Khởi chạy

```bash
docker-compose up --build
```

Mở http://localhost:3000

---

## Seed data (chạy 1 lần sau khi backend khởi động)

```bash
# Cách 1: qua psql trong container
docker exec -i app-postgres psql -U appuser -d appdb < seed.sql

# Cách 2: copy file vào container rồi chạy
docker cp seed.sql app-postgres:/seed.sql
docker exec -it app-postgres psql -U appuser -d appdb -f /seed.sql
```

---

## 3 Luồng nghiệp vụ

### Luồng 1 — Agent đặt hàng Online (`/sales-orders`)
1. Chọn đại lý → nhập sản phẩm (tên, link, SL, giá DK) → Gửi đơn → PENDING
2. Admin xem danh sách → nhấn **Duyệt** → APPROVED

### Luồng 2 — Nhập hàng từ NCC (`/purchase-orders`)
**Tab PO:**
1. Purchase Staff Chọn đơn APPROVED → chọn từng sản phẩm → nhập giá mua → chọn supplier + nhân viên → Tạo PO → SENT

**Tab Phiếu nhập kho:**
1. Khi hàng về → chọn PO → nhân viên kho → nhập SL nhận/lỗi cho từng SP → Tạo phiếu DRAFT
2. Kiểm tra xong → **Xác nhận** → CONFIRMED
3. Hệ thống tự đối soát: PO → FULLY_RECEIVED hoặc PARTIAL_RECEIVED

### Luồng 3 — Giao hàng cho Đại lý (`/delivery-notes`)
1. Chọn PO FULLY_RECEIVED → nhân viên kho → nhập mã vận đơn → Tạo phiếu giao
2. SalesOrder tự cập nhật: PROCESSING (đang giao 1 phần) → COMPLETED (tất cả supplier đã giao)

---

## API Endpoints

| Method | URL | Mô tả |
|--------|-----|-------|
| GET | /api/ref/agents | Danh sách đại lý |
| GET | /api/ref/suppliers | Danh sách nhà cung cấp |
| GET | /api/ref/purchase-staffs | Nhân viên mua hàng |
| GET | /api/ref/warehouse-staffs | Nhân viên kho |
| GET/POST | /api/sales-orders | Đơn hàng |
| PATCH | /api/sales-orders/{id}/approve | Duyệt đơn |
| GET/POST | /api/purchase-orders | Đơn mua hàng |
| GET/POST | /api/inbound-receipts | Phiếu nhập kho |
| PATCH | /api/inbound-receipts/{id}/confirm | Xác nhận phiếu nhập |
| GET/POST | /api/delivery-notes | Phiếu giao hàng |

## Fix Docker compose

docker system prune -a --volumes
docker image prune -a