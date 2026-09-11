// src/tests/billeteras.test.ts
import request from 'supertest';
import app from '../index';
import { setupTestDB, clearTestDB, teardownTestDB } from './dbSetup';
import { registerAndLogin, randomEmail, randomUsername } from './helpers';

describe('Billeteras Routes', () => {
  let token: string;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    token = await registerAndLogin({
      username: randomUsername('walletuser'),
      email: randomEmail(),
      password: 'Password123',
    });
  });

  // ==========================
  // POST /api/billeteras
  // ==========================
  describe('POST /api/billeteras', () => {
    it('debería crear una billetera', async () => {
      const res = await request(app)
        .post('/api/billeteras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
          network: 'XRP',
          name: 'Mi Billetera Test',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      // 👇 leer desde data
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.address).toBe('rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH');
    });

    it('debería fallar sin token de autenticación', async () => {
      const res = await request(app).post('/api/billeteras').send({
        address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        network: 'XRP',
      });

      expect(res.status).toBe(401);
    });

    it('debería fallar con datos incompletos', async () => {
      const res = await request(app)
        .post('/api/billeteras')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'sin address' });

      expect(res.status).toBe(400);
    });

    it('debería fallar con una red no soportada', async () => {
      const res = await request(app)
        .post('/api/billeteras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
          network: 'devnet',
        });

      expect(res.status).toBe(400);
    });
  });

  // ==========================
  // GET /api/billeteras
  // ==========================
  describe('GET /api/billeteras', () => {
    it('debería listar las billeteras del usuario', async () => {
      await request(app)
        .post('/api/billeteras')
        .set('Authorization', `Bearer ${token}`)
        .send({
          address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
          network: 'XRP',
        });

      const res = await request(app)
        .get('/api/billeteras')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // 👇 leer desde data
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
    });

    it('debería retornar un array vacío si no hay billeteras', async () => {
      const res = await request(app)
        .get('/api/billeteras')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      // 👇 leer desde data
      expect(res.body.data).toEqual([]);
    });

    it('debería fallar sin token', async () => {
      const res = await request(app).get('/api/billeteras');
      expect(res.status).toBe(401);
    });
  });
});