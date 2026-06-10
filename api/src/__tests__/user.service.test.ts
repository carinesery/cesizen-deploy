import { describe, it, expect, vi } from 'vitest';
import { createUserService } from '../services/user.service.js';
import { UserRoleEnum } from '../utils/enum.js';
import bcrypt from 'bcrypt';

const hashSpy = vi.spyOn(bcrypt, 'hash');

vi.mock('../prismaClient', () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockImplementation(({ where }) => {
        if (where.email === 'test@example.com') return { idUser: '1', email: 'test@example.com' };
        if (where.username === 'user1') return { idUser: '2', username: 'user1' };
        return null;
      }),
      create: vi.fn().mockImplementation((data) => data),
    },
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn().mockReturnValue('fake-token'),
  },
  sign: vi.fn().mockReturnValue('fake-token'),
}));

vi.mock('../services/mail.service', () => ({
  sendConfirmationEmail: vi.fn(),
}));

describe('createUserService', () => {
  it('refuse la création si email existe déjà', async () => {
    await expect(createUserService({
      username: 'user1',
      email: 'test@example.com',
      password: 'Password123!',
      role: UserRoleEnum.USER,
      termsConsent: true,
      privacyConsent: true,
    }, undefined)).rejects.toThrow('USER_ALREADY_EXISTS');
  });

  it('refuse la création si username existe déjà', async () => {
    await expect(createUserService({
      username: 'user1',
      email: 'nouveau@example.com',
      password: 'Password123!',
      role: UserRoleEnum.USER,
      termsConsent: true,
      privacyConsent: true,
    }, undefined)).rejects.toThrow('USERNAME_ALREADY_IN_USE');
  });

  it('hash correctement le mot de passe lors de la création', async () => {
    const data = {
      username: 'nouveau',
      email: 'nouveau@example.com',
      password: 'Password123!',
      role: UserRoleEnum.USER,
      termsConsent: true,
      privacyConsent: true,
    };
    await createUserService(data, undefined);
    expect(hashSpy).toHaveBeenCalledWith('Password123!', 10);
  });
});
