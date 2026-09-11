// src/tests/setup.ts
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.DB_NAME = ':memory:';
process.env.DB_USER = 'test';
process.env.DB_PASSWORD = '';
process.env.DB_HOST = 'localhost';

// Silenciar logs durante los tests
jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'info').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});

// 🎯 Mock global de xrpl para evitar cargar módulos ESM
jest.mock('xrpl', () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined) as any,
    disconnect: jest.fn().mockResolvedValue(undefined) as any,
    request: jest.fn().mockResolvedValue({ result: {} }) as any,
    submit: jest.fn().mockResolvedValue({ result: {} }) as any,
    isConnected: jest.fn().mockReturnValue(false) as any,
  };

  return {
    Client: jest.fn().mockImplementation(() => mockClient) as any,
    Wallet: {
      fromSeed: jest.fn(() => ({ address: 'rTestAddress', seed: 'sTestSeed' })) as any,
      fromSecret: jest.fn(() => ({ address: 'rTestAddress', seed: 'sTestSeed' })) as any,
      generate: jest.fn(() => ({ address: 'rTestAddress', seed: 'sTestSeed' })) as any,
    },
    isValidAddress: jest.fn(() => true) as any,
    dropsToXrp: jest.fn((d: string) => d) as any,
    xrpToDrops: jest.fn((x: string) => x) as any,
    encode: jest.fn() as any,
    decode: jest.fn() as any,
  };
});