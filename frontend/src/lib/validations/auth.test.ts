import { describe, expect, it } from 'vitest';

import { loginSchema, registerSchema } from './auth';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validStudent = {
    email: 'student@example.com',
    username: 'student_uz',
    full_name: 'Ali Valiyev',
    password: 'MyPass99!',
    password_confirm: 'MyPass99!',
    role: 'student' as const,
    learning_goal: 'general' as const,
  };

  it('accepts valid student registration', () => {
    const result = registerSchema.safeParse(validStudent);
    expect(result.success).toBe(true);
  });

  it('rejects password mismatch', () => {
    const result = registerSchema.safeParse({
      ...validStudent,
      password_confirm: 'Different99!',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('password_confirm'))).toBe(true);
    }
  });

  it('requires invite code for teachers', () => {
    const result = registerSchema.safeParse({
      ...validStudent,
      role: 'teacher',
      invite_code: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts teacher with invite code', () => {
    const result = registerSchema.safeParse({
      ...validStudent,
      role: 'teacher',
      invite_code: 'SECRET123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects weak password without uppercase', () => {
    const result = registerSchema.safeParse({
      ...validStudent,
      password: 'weakpass1',
      password_confirm: 'weakpass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid username characters', () => {
    const result = registerSchema.safeParse({
      ...validStudent,
      username: 'bad user!',
    });
    expect(result.success).toBe(false);
  });
});
