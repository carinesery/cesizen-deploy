import { describe, it, expect, vi } from 'vitest';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { verifyJwt } from '../utils/jwt.js';

vi.mock('../utils/jwt', () => ({
  verifyJwt: vi.fn(),
}));

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('authMiddleware', () => {
  it.skip('refuse si header Authorization absent', async () => {});
  it.skip('refuse si token mal formé', async () => {});
  it.skip('refuse si token invalide', async () => {});
  // Pour le test d'accès autorisé, il faudrait mocker prisma et le user trouvé
});
