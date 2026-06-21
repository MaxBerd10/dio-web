import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Email noto'g'ri formatda"),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.string().email("Email noto'g'ri formatda"),
    username: z
      .string()
      .min(3, 'Kamida 3 ta belgi')
      .max(30, "Ko'pi bilan 30 ta belgi")
      .regex(/^[a-zA-Z0-9_]+$/, 'Faqat harflar, raqamlar va _'),
    full_name: z.string().min(2, "Ism familya kiritilishi shart").max(150),
    password: z
      .string()
      .min(8, 'Kamida 8 ta belgi')
      .regex(/[A-Z]/, 'Kamida bitta katta harf')
      .regex(/[a-z]/, 'Kamida bitta kichik harf')
      .regex(/[0-9]/, 'Kamida bitta raqam'),
    password_confirm: z.string(),
    role: z.enum(['student', 'teacher']),
    invite_code: z.string().optional(),
    cefr_level: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).optional(),
    learning_goal: z.enum(['general', 'cefr', 'ielts']).optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'Parollar mos kelmadi',
    path: ['password_confirm'],
  })
  .refine(
    (data) => data.role !== 'teacher' || (data.invite_code && data.invite_code.length > 0),
    {
      message: "O'qituvchi kodi kiritilishi shart",
      path: ['invite_code'],
    },
  );

export type RegisterFormValues = z.infer<typeof registerSchema>;