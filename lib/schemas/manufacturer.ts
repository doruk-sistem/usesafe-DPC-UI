import * as z from "zod";

export const formSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  registrationNumber: z.string().min(1, "Registration number is required"),
  address: z.string().min(1, "Address is required"),
  country: z.string().min(1, "Country is required"),
  documents: z.array(z.any()),
  contactName: z.string().min(2, "Contact name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
});