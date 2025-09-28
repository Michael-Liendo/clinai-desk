import z from "zod";

export const CompanySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email(),
	address: z.string(),
	phone: z.string(),
	is_active: z.boolean(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const CompanyForRegisterSchema = CompanySchema.omit({
	id: true,
	is_active: true,
	created_at: true,
	updated_at: true,
});

export const CompanyForUpdateSchema = CompanySchema.omit({
	id: true,
	is_active: true,
	created_at: true,
	updated_at: true,
});

// Inferred Types/Interfaces
export interface ICompany extends z.infer<typeof CompanySchema> {}

export interface ICompanyForRegister
	extends z.infer<typeof CompanyForRegisterSchema> {}

export interface ICompanyForUpdate
	extends z.infer<typeof CompanyForUpdateSchema> {}
