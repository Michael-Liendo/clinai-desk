import { z } from "zod";

export const ClinicUserRolesEnum = z.enum(["admin", "doctor", "assistant"]);

export const ClinicUserSchema = z.object({
	id: z.string().uuid(),
	company_id: z.string().uuid(),
	user_id: z.string().uuid(),
	role: ClinicUserRolesEnum,
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const ClinicUserForRegisterSchema = ClinicUserSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export const ClinicUserForUpdateSchema = ClinicUserSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

// Inferred Types/Interfaces
export type TClinicUserRole = z.infer<typeof ClinicUserRolesEnum>;

export interface IClinicUser extends z.infer<typeof ClinicUserSchema> {}

export interface IClinicUserForRegister
  extends z.infer<typeof ClinicUserForRegisterSchema> {}

export interface IClinicUserForUpdate
  extends z.infer<typeof ClinicUserForUpdateSchema> {}
