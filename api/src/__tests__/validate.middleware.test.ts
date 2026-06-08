import { describe, it, expect, vi } from 'vitest';
import { validate } from '../middlewares/validate.middleware.js';
import { z } from 'zod';

const schema = z.object({ name: z.string() });

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('validate.middleware', () => {
  it('retourne 400 et message clair si données invalides', () => {
    const req = { body: { name: 123 } } as any;
    const res = mockResponse();
    const next = vi.fn();
    const middleware = validate(schema, 'body');

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Validation error',
      errors: expect.anything(),
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('appelle next() si données valides', () => {
    const req = { body: { name: 'John' } } as any;
    const res = mockResponse();
    const next = vi.fn();
    const middleware = validate(schema, 'body');

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
