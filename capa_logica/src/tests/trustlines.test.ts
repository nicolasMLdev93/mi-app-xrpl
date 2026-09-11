import request from 'supertest';
import app from '../index';
import { setupTestDB, clearTestDB, teardownTestDB } from './dbSetup';
import { registerAndLogin, randomEmail, randomUsername } from './helpers';

describe('TrustLines Routes', () => {
  let token: string;
  let walletId: number;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
    token = await registerAndLogin({
      username: randomUsername('trustlineuser'),
      email: randomEmail(),
      password: 'Password123',
    });

    const walletRes = await request(app)
      .post('/api/billeteras')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH',
        network: 'XRP',
      });

    // 👇 Ahora walletId sale de data.id
    walletId = walletRes.body.data.id;
  });

  // ==========================
  // POST /api/trustlines
  // ==========================
  describe('POST /api/trustlines', () => {
    it('debería crear una trustline', async () => {
      const res = await request(app)
        .post('/api/trustlines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          wallet_id: walletId,
          currency: 'RLUSD',
          issuer: 'rIssuerXXXXXXXXXXXXXXXXXXXXX',
          limit_amount: 1000,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.currency).toBe('RLUSD');
      expect(res.body.data.status).toBe('active');
    });

    it('debería fallar sin campos requeridos', async () => {
      const res = await request(app)
        .post('/api/trustlines')
        .set('Authorization', `Bearer ${token}`)
        .send({ currency: 'RLUSD' });

      expect(res.status).toBe(400);
    });

    it('debería fallar sin token', async () => {
      const res = await request(app).post('/api/trustlines').send({
        wallet_id: walletId,
        currency: 'RLUSD',
        issuer: 'rIssuerXXXXXXXXXXXXXXXXXXXXX',
        limit_amount: 1000,
      });

      expect(res.status).toBe(401);
    });
  });

  // ==========================
  // GET /api/billeteras/:wallet_id/trustlines
  // ==========================
  describe('GET /api/billeteras/:wallet_id/trustlines', () => {
    it('debería listar las trustlines de la billetera', async () => {
      await request(app)
        .post('/api/trustlines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          wallet_id: walletId,
          currency: 'RLUSD',
          issuer: 'rIssuerXXXXXXXXXXXXXXXXXXXXX',
          limit_amount: 1000,
        });

      const res = await request(app)
        .get(`/api/billeteras/${walletId}/trustlines`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
    });

    it('debería retornar un array vacío si no hay trustlines', async () => {
      const res = await request(app)
        .get(`/api/billeteras/${walletId}/trustlines`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  // ==========================
  // PUT /api/trustlines/:id
  // ==========================
  describe('PUT /api/trustlines/:id', () => {
    it('debería actualizar el limit_amount de una trustline', async () => {
      const createRes = await request(app)
        .post('/api/trustlines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          wallet_id: walletId,
          currency: 'RLUSD',
          issuer: 'rIssuerXXXXXXXXXXXXXXXXXXXXX',
          limit_amount: 1000,
        });

      const trustLineId = createRes.body.data.id;

      const res = await request(app)
        .put(`/api/trustlines/${trustLineId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ limit_amount: 5000 });

      expect(res.status).toBe(200);
      expect(Number(res.body.data.limit_amount)).toBe(5000);
    });

    it('debería retornar 404 si la trustline no existe', async () => {
      const res = await request(app)
        .put('/api/trustlines/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({ limit_amount: 5000 });

      expect(res.status).toBe(404);
    });
  });

  // ==========================
  // DELETE /api/trustlines/:id
  // ==========================
  describe('DELETE /api/trustlines/:id', () => {
    it('debería eliminar una trustline', async () => {
      const createRes = await request(app)
        .post('/api/trustlines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          wallet_id: walletId,
          currency: 'RLUSD',
          issuer: 'rIssuerXXXXXXXXXXXXXXXXXXXXX',
          limit_amount: 1000,
        });

      const trustLineId = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/trustlines/${trustLineId}`)
        .set('Authorization', `Bearer ${token}`);

      // ✅ Tu controller devuelve 200, no 204
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('debería retornar 404 si la trustline no existe', async () => {
      const res = await request(app)
        .delete('/api/trustlines/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});