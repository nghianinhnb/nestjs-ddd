# NestJS DDD + Clean Architecture (Modular Monolith)

Dự án mẫu NestJS đáp ứng đầy đủ các tiêu chuẩn doanh nghiệp (**Enterprise Best Practices**):
- **Domain-Driven Design (DDD)**: Bounded Contexts, Aggregates, Value Objects, Domain Events, Repositories Port/Adapter.
- **Clean Architecture (Hexagonal / Onion)**: Phân tầng nghiêm ngặt `Domain` -> `Application` -> `Infrastructure` -> `Presentation`.
- **CQRS (Command Query Responsibility Segregation)**: Phân tách Command (Write) và Query (Read) side với `@nestjs/cqrs`.
- **Cross-Domain Saga Orchestration**: `OrderFulfillmentSaga` điều phối các giao dịch đa miền và **Compensating Transactions (Rollback)** tự động khi lỗi.
- **Event-Driven Architecture**: Tách biệt `Domain Events` (nội bộ context) và `Integration Events` (liên context).
- **CQRS Read Model Projection**: Projection tự động cho **Dashboard & Analytics** thời gian thực, sẵn sàng cắm **OLAP DB (ClickHouse / Elasticsearch)** khi scale microservices.
- **Identity & Access Management (IAM & RBAC)**: Phân quyền theo vai trò `CUSTOMER` (Khách hàng), `WAREHOUSE_KEEPER` (Thủ kho) và `ADMIN`.
- **Pragmatic Architecture**: So sánh trực quan giữa Module phức tạp (CQRS - `Ordering`, `Inventory`) và Module đơn giản (Layered CRUD - `Catalog`).

---

## 🏛 Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 MODULAR MONOLITH                                  |
|                                                                                   |
|  +------------------------+  +------------------------+  +---------------------+  |
|  |    Ordering Context    |  |   Inventory Context    |  |   Payment Context   |  |
|  |     (Complex CQRS)     |  |     (Complex CQRS)     |  |   (Event-Driven)    |  |
|  +-----------+------------+  +-----------+------------+  +----------+----------+  |
|              ^                           ^                          ^             |
|              |                           |                          |             |
|              +---------------------------+--------------------------+             |
|                                          |                                        |
|                          +---------------+---------------+                        |
|                          |    Order Fulfillment Saga     |                        |
|                          |      (Orchestrator)           |                        |
|                          +---------------+---------------+                        |
|                                                                                   |
|  +-----------------------+   +-----------------------+   +---------------------+  |
|  |    Catalog Context    |   |  Analytics Context    |   |  Identity & Auth    |  |
|  | (Simple Layered CRUD) |   | (CQRS Read Projection)|   | (IAM / RBAC Context)|  |
|  +-----------------------+   +-----------------------+   +---------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 📦 Bounded Contexts & Design Patterns

| Bounded Context | Architecture Pattern | Mô tả & Đặc điểm |
| :--- | :--- | :--- |
| **`Identity & Auth`** | IAM / RBAC Aggregate | Quản lý Người dùng, Bcrypt Password Value Object, JWT Token, Phân quyền Roles (`CUSTOMER`, `WAREHOUSE_KEEPER`, `ADMIN`). |
| **`Ordering`** | Complex CQRS + Aggregates | Quản lý vòng đời đơn hàng (Draft -> Placed -> Paid -> Approved / Cancelled). Aggregate Invariants, Domain Events & Integration Events. |
| **`Inventory`** | Complex CQRS + Invariants | Quản lý tồn kho sản phẩm, kiểm tra không cho reserve quá số lượng khả dụng (`availableQuantity`). Hỗ trợ Thủ kho nhập kho. |
| **`Payment`** | Event-Driven Gateway | Mô phỏng Cổng thanh toán. Phát hành `PaymentProcessedIntegrationEvent` hoặc `PaymentFailedIntegrationEvent`. |
| **`Fulfillment Saga`** | Saga Process Manager | Điều phối luồng xử lý đơn hàng: Order Placed -> Reserve Stock -> Process Payment -> Approve Order. **Tự động Rollback (Release Stock & Cancel Order)** khi Payment/Stock thất bại. |
| **`Analytics`** | CQRS Read Projection | Lắng nghe Integration Events để tự động tổng hợp dữ liệu vào Denormalized Read Table phục vụ **Dashboard API (O(1))**, chuẩn bị sẵn cho **OLAP DB**. |
| **`Catalog`** | Simple Layered CRUD | Quản lý danh mục sản phẩm (CRUD Product). Thể hiện tính thực tế của DDD: Không dùng CQRS/Aggregates đối với module CRUD đơn giản. |

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

### 1. Khởi động Dev Server
```bash
npm run start:dev
```
- Server chạy tại: `http://localhost:3000`
- API Documentation (Swagger UI): `http://localhost:3000/api/docs`

### 2. Chạy E2E Tests (Saga Workflow & Rollback Test)
```bash
npm run test:e2e
```

---

## 🛠 API Endpoints Key Flow

### 1. Đăng ký & Đăng nhập (`/auth`)
- `POST /auth/register`: Đăng ký tài khoản (`role`: `CUSTOMER` hoặc `WAREHOUSE_KEEPER`).
- `POST /auth/login`: Lấy JWT Access Token.

### 2. Nhập kho (`/inventory`)
- `POST /inventory/add-stock` *(Dành cho `WAREHOUSE_KEEPER` / `ADMIN`)*: Nhập thêm tồn kho cho sản phẩm.

### 3. Đặt đơn hàng & Kích hoạt Saga (`/orders`)
- `POST /orders` *(Dành cho `CUSTOMER`)*: Đặt hàng.
- **Saga sẽ tự động**:
  1. Gửi Command giữ hàng (`ReserveStockCommand`).
  2. Gửi Command thanh toán (`ProcessPaymentCommand`).
  3. Khi thanh toán thành công -> Đơn hàng đổi thành trạng thái `APPROVED`.
  4. Nếu thanh toán thất bại (ví dụ đơn > 500,000) -> **Saga tự động nhả tồn kho (`ReleaseStockCommand`) và đổi đơn thành `CANCELLED`**.

### 4. Xem Dashboard (`/dashboard`)
- `GET /dashboard/summary` *(Dành cho `ADMIN` / `WAREHOUSE_KEEPER`)*: Xem tổng số đơn hàng, đơn hoàn tất, đơn bị hủy và tổng doanh thu thời gian thực.
