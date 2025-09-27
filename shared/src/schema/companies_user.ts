import { z } from "zod";

export const CompanyUserRolesEnum = z.enum(["admin", "doctor", "assistant"]);

export const CompanyUserSchema = z.object({
	id: z.string().uuid(),
	company_id: z.string().uuid(),
	user_id: z.string().uuid(),
	role: CompanyUserRolesEnum,
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const CompanyUserForRegisterSchema = CompanyUserSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export const CompanyUserForUpdateSchema = CompanyUserSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

// Inferred Types/Interfaces
export type TCompanyUserRole = z.infer<typeof CompanyUserRolesEnum>;

export interface ICompanyUser extends z.infer<typeof CompanyUserSchema> {}

export interface ICompanyUserForRegister
	extends z.infer<typeof CompanyUserForRegisterSchema> {}

export interface ICompanyUserForUpdate
	extends z.infer<typeof CompanyUserForUpdateSchema> {}
