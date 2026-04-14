import { z } from "zod";

export const CheckoutSchema = z.object({
  sourceId: z.string().min(1, "Payment token is required"),
  customer: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^[\d\s+\-()]{8,15}$/, "Invalid phone number"),
    addressLine1: z.string().min(3, "Address is required").max(200),
    addressLine2: z.string().max(200).optional().default(""),
    city: z.string().min(2, "City is required").max(100),
    state: z.string().min(2, "State is required").max(50),
    postcode: z.string().regex(/^\d{4}$/, "Invalid Australian postcode"),
  }),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().positive().max(10),
      })
    )
    .min(1, "Cart cannot be empty"),
});

export const ContactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(2000, "Message must be under 2000 characters"),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type ContactInput = z.infer<typeof ContactSchema>;
