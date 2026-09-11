// src/tests/auth.test.ts
import request from 'supertest';
import app from '../index';
import { setupTestDB, clearTestDB, teardownTestDB } from './dbSetup';
import { randomEmail, randomUsername } from './helpers';

describe('Auth Routes', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  // ==========================
  // POST /api/register
  // ==========================
  describe('POST /api/register', () => {
    it('debería registrar un nuevo usuario', async () => {
      const res = await request(app).post('/api/register').send({
        username: randomUsername('newuser'),
        email: randomEmail(),
        password: 'Password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email');
    });

    it('debería fallar si el email ya está registrado (409)', async () => {
      const email = randomEmail();

      await request(app).post('/api/register').send({
        username: randomUsername('userone'),
        email,
        password: 'Password123',
      });

      const res = await request(app).post('/api/register').send({
        username: randomUsername('usertwo'),
        email,
        password: 'Password123',
      });

      expect(res.status).toBe(409);
    });

    it('debería fallar con datos inválidos (400)', async () => {
      const res = await request(app).post('/api/register').send({
        username: 'abc',           // muy corto
        email: 'no-es-un-email',   // email inválido
        password: '123',           // muy corto
      });

      expect(res.status).toBe(400);
    });

    it('debería fallar si el username no cumple el patrón', async () => {
      const res = await request(app).post('/api/register').send({
        username: 'solamenteletras', // sin números
        email: randomEmail(),
        password: 'Password123',
      });

      expect(res.status).toBe(400);
    });
  });

  // ==========================
  // POST /api/login
  // ==========================
  describe('POST /api/login', () => {
    it('debería loguear con credenciales válidas', async () => {
      const email = randomEmail();
      const username = randomUsername('loginuser');

      await request(app).post('/api/register').send({
        username,
        email,
        password: 'Password123',
      });

      const res = await request(app).post('/api/login').send({
        email,
        password: 'Password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', email);
    });

    it('debería fallar con password incorrecto (401)', async () => {
      const email = randomEmail();

      await request(app).post('/api/register').send({
        username: randomUsername('wrongpass'),
        email,
        password: 'Password123',
      });

      const res = await request(app).post('/api/login').send({
        email,
        password: 'OtraPassword456',
      });

      expect(res.status).toBe(401);
    });

    it('debería fallar si el usuario no existe (401)', async () => {
      const res = await request(app).post('/api/login').send({
        email: 'noexiste@example.com',
        password: 'Password123',
      });

      expect(res.status).toBe(401);
    });
  });

  // ==========================
  // GET /api/health
  // ==========================
  describe('GET /api/health', () => {
    it('debería retornar status ok', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });
});