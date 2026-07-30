import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Order Fulfillment Saga & DDD E2E Test Suite', () => {
  let app: INestApplication;
  let customerToken: string;
  let warehouseKeeperToken: string;
  let adminToken: string;
  let productId: string;

  const timestamp = Date.now();
  const adminEmail = `admin_${timestamp}@ddd.com`;
  const keeperEmail = `keeper_${timestamp}@ddd.com`;
  const customerEmail = `customer_${timestamp}@ddd.com`;
  const sku = `SKU-MACBOOK-${timestamp}`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Register Customer, Warehouse Keeper & Admin Users', async () => {
    // Register Admin
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: adminEmail, fullName: 'Admin User', password: 'password123', role: 'ADMIN' })
      .expect(201);

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: adminEmail, password: 'password123' })
      .expect(200);
    adminToken = adminLogin.body.accessToken;

    // Register Warehouse Keeper
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: keeperEmail, fullName: 'Warehouse Keeper', password: 'password123', role: 'WAREHOUSE_KEEPER' })
      .expect(201);

    const keeperLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: keeperEmail, password: 'password123' })
      .expect(200);
    warehouseKeeperToken = keeperLogin.body.accessToken;

    // Register Customer
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: customerEmail, fullName: 'Customer One', password: 'password123', role: 'CUSTOMER' })
      .expect(201);

    const customerLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: customerEmail, password: 'password123' })
      .expect(200);
    customerToken = customerLogin.body.accessToken;

    expect(adminToken).toBeDefined();
    expect(warehouseKeeperToken).toBeDefined();
    expect(customerToken).toBeDefined();
  });

  it('2. Admin creates a Product in Catalog Context', async () => {
    const res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        sku,
        name: 'MacBook Pro M3',
        price: 150000,
        description: 'Apple Silicon M3 Chip',
      })
      .expect(201);

    productId = res.body.id;
    expect(productId).toBeDefined();
  });

  it('3. Warehouse Keeper adds Stock in Inventory Context', async () => {
    await request(app.getHttpServer())
      .post('/inventory/add-stock')
      .set('Authorization', `Bearer ${warehouseKeeperToken}`)
      .send({
        productId,
        quantity: 10,
      })
      .expect(201);

    const stockRes = await request(app.getHttpServer())
      .get(`/inventory/product/${productId}`)
      .expect(200);

    expect(stockRes.body.availableQuantity).toBe(10);
  });

  it('4. Customer places Order -> Saga automatically executes ReserveStock -> ProcessPayment -> ApproveOrder', async () => {
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId,
            productName: 'MacBook Pro M3',
            unitPrice: 150000,
            quantity: 2,
          },
        ],
      })
      .expect(201);

    const orderId = orderRes.body.orderId;
    expect(orderId).toBeDefined();

    // Give asynchronous events and Saga stream time to execute
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Verify Order is APPROVED
    const orderDetail = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(orderDetail.body.status).toBe('APPROVED');

    // Verify Inventory reserved & available stock updated
    const stockRes = await request(app.getHttpServer())
      .get(`/inventory/product/${productId}`)
      .expect(200);

    expect(stockRes.body.availableQuantity).toBe(8);
  });

  it('5. Analytics Dashboard Projection reflects real-time metrics', async () => {
    const dashboardRes = await request(app.getHttpServer())
      .get('/dashboard/summary')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(dashboardRes.body.totalOrders).toBeGreaterThanOrEqual(1);
    expect(dashboardRes.body.approvedOrders).toBeGreaterThanOrEqual(1);
  });

  it('6. Saga Compensating Action: Order exceeding limit fails payment -> Saga releases stock & cancels order', async () => {
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId,
            productName: 'MacBook Pro M3',
            unitPrice: 600000, // Exceeds payment limit of 500,000
            quantity: 1,
          },
        ],
      })
      .expect(201);

    const orderId = orderRes.body.orderId;

    // Allow Saga stream time to process failed payment & compensating actions
    await new Promise((resolve) => setTimeout(resolve, 800));

    const orderDetail = await request(app.getHttpServer())
      .get(`/orders/${orderId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .expect(200);

    expect(orderDetail.body.status).toBe('CANCELLED');
    expect(orderDetail.body.cancellationReason).toContain('Payment failed');
  });
});
