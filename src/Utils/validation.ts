import * as zod from 'zod';

export const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: zod
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = zod.infer<typeof loginSchema>;

export const registerSchema = zod
  .object({
    name: zod.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
    email: zod.string().min(1, 'Email is required').email('Please enter a valid email address'),
    password: zod
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: zod.string().min(1, 'Confirm Password is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterFormValues = zod.infer<typeof registerSchema>;
