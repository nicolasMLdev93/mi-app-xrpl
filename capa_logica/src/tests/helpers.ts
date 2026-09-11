// src/tests/helpers.ts
import request from 'supertest';
import app from '../index';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token?: string;
}

// ⚠️ Tu validación exige: 7+ letras seguidas + 4+ números seguidos.
// Esta función garantiza ese formato sin importar el prefijo recibido.
export function randomUsername(prefix = 'testuser'): string {
  // Si el prefijo tiene menos de 7 letras, lo rellenamos con "user"
  let letters = prefix.replace(/[^A-Za-z]/g, '');
  while (letters.length < 7) {
    letters += 'user';
  }
  const numbers = Date.now().toString().slice(-4);
  return `${letters}${numbers}`;
}

export function randomEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
}

export async function registerAndLogin(user: TestUser): Promise<string> {
  const registerRes = await request(app).post('/api/register').send({
    username: user.username,
    email: user.email,
    password: user.password,
  });

  if (registerRes.status !== 201) {
    throw new Error(
      `Register falló (${registerRes.status}): ${JSON.stringify(registerRes.body)}`,
    );
  }

  const loginRes = await request(app).post('/api/login').send({
    email: user.email,
    password: user.password,
  });

  if (loginRes.status !== 200) {
    throw new Error(
      `Login falló (${loginRes.status}): ${JSON.stringify(loginRes.body)}`,
    );
  }

  return loginRes.body.data.token;
}