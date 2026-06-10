import { describe, it, expect, vi } from 'vitest';
import { errorMiddleware } from '../middlewares/error.middleware.js';

describe('errorMiddleware', () => {
  it('retourne 500 et un message générique en cas d\'erreur', () => {
    const req = { url: '/test' } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as any;
    const next = vi.fn();
    const error = { message: 'Erreur test' };
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    errorMiddleware(error, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith('🔥 ERROR: ', 'Erreur test', 'sur', '/test');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Une erreur interne est survenue" });
    expect(next).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
