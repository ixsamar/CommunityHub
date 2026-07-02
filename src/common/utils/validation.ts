import * as zod from 'zod';

export const loginSchema = zod.object({
  email: zod
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: zod
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = zod.infer<typeof loginSchema>;
