import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';

describe('Background Tasks & WebSockets E2E Test Suite', () => {
  let app: INestApplication;
  let userToken: string;
  let clientSocket: Socket;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.listen(3001); // Listen on port 3001 for WebSocket E2E connection test

    // Register & Login to get token
    const timestamp = Date.now();
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: `jobs_${timestamp}@ddd.com`, fullName: 'Worker Tester', password: 'password123' })
      .expect(201);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: `jobs_${timestamp}@ddd.com`, password: 'password123' })
      .expect(200);

    userToken = login.body.accessToken;
  });

  afterAll(async () => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    await app.close();
  });

  it('1. Cronjob Execution: Trigger inventory audit command', async () => {
    const res = await request(app.getHttpServer())
      .post('/jobs/trigger-inventory-audit')
      .expect(201);

    expect(res.body.result).toContain('Inventory audit completed');
  });

  it('2. Delayed Job Execution: Schedule order timeout cancellation', async () => {
    const res = await request(app.getHttpServer())
      .post('/jobs/schedule-order-timeout')
      .send({ orderId: 'test-order-123', delaySeconds: 1 })
      .expect(201);

    expect(res.body.message).toContain('Delayed job scheduled');
  });

  it('3. Long-Running Task + WebSocket Real-time Progress Emission', (done) => {
    // Connect WebSocket Client to /notifications namespace
    clientSocket = io('http://localhost:3001/notifications', {
      transports: ['websocket'],
    });

    clientSocket.on('connect', async () => {
      // Trigger Long-Running Export Report Task
      const reportRes = await request(app.getHttpServer())
        .post('/jobs/export-report')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      const taskId = reportRes.body.taskId;
      expect(taskId).toBeDefined();

      // Subscribe to WebSocket task room
      clientSocket.emit('subscribeTask', { taskId });

      const progressSteps: number[] = [];

      // Listen to real-time progress events emitted by Worker over WebSocket
      clientSocket.on('reportProgress', (data) => {
        progressSteps.push(data.progress);

        if (data.progress === 100) {
          expect(progressSteps).toContain(10);
          expect(progressSteps).toContain(35);
          expect(progressSteps).toContain(65);
          expect(progressSteps).toContain(90);
          expect(progressSteps).toContain(100);
          expect(data.downloadUrl).toBeDefined();
          done();
        }
      });
    });
  }, 10000);
});
