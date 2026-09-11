// src/tests/transacciones.test.ts
import request from 'supertest';
import app from '../index';
import { setupTestDB, clearTestDB, teardownTestDB } from './dbSetup';
import { registerAndLogin, randomEmail, randomUsername } from './helpers';

describe('Transacciones Routes', () => {
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
      username: randomUsername('txuser'),
      email: randomEmail(),
      password: 'Password123',
    });
  });

  // ==========================
  // GET /api/transacciones
  // ==========================
  describe('GET /api/transacciones', () => {
    it('debería retornar un array vacío si no hay transacciones', async () => {
      const res = await request(app)
        .get('/api/transacciones')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it('debería fallar sin token', async () => {
      const res = await request(app).get('/api/transacciones');
      expect(res.status).toBe(401);
    });

    it('debería fallar con un token inválido', async () => {
      const res = await request(app)
        .get('/api/transacciones')
        .set('Authorization', 'Bearer token-falso');

      expect(res.status).toBe(401);
    });
  });
});