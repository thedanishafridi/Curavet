import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Case Schema
export const caseSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20),
  category: z.enum(['Surgery', 'Medical Treatment', 'Rehabilitation', 'Recovery', 'Other']),
  location: z.string().min(3),
  goalAmount: z.number().positive(),
  petName: z.string().optional(),
  image: z.string().optional(),
  images: z.array(z.string()).optional(),
});

// Donation Schema
export const donationSchema = z.object({
  caseId: z.string().regex(/^[0-9a-fA-D]{24}$/i, 'Invalid Case ID'),
  amount: z.number().positive(),
  message: z.string().max(500).optional(),
});

// Auth Schema
export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'vet', 'donor']).optional(),
});

// Middleware Factory
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors.map(e => ({ path: e.path, message: e.message }))
        });
      }
      next(error);
    }
  };
};
