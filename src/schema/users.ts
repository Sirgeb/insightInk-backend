import { z } from "zod";

export const SignUpSchema = z.object({
  fullname: z.string().min(3, "Full name is required"),
  email: z.string().email(),
  password: z.string().min(6),
});

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
