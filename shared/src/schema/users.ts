import { z } from "zod";

export const UserSchema = z.object({
	id: z.string(),
	is_active: z.boolean(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email().describe("unique"),
	phone: z.string().optional(),
	password: z.string().optional(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const UserForRegisterSchema = UserSchema.omit({
	id: true,
	is_active: true,
	created_at: true,
	updated_at: true,
});

export const UserLoginSchema = UserSchema.pick({
	email: true,
	password: true,
});

export const UserForUpdateSchema = UserSchema.omit({
	id: true,
	is_active: true,
	created_at: true,
	updated_at: true,
});

// Inferred Types/Interfaces
export interface IUser extends z.infer<typeof UserSchema> {}

export interface IUserForRegister extends z.infer<typeof UserForRegisterSchema> {}

export interface IUserForLogin extends z.infer<typeof UserLoginSchema> {}

export interface IUserForUpdate extends z.infer<typeof UserForUpdateSchema> {}

export interface ILoggedInUser {
  token: string;
  user: IUser;
}
