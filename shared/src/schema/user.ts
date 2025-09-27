import { z } from "zod";

export const UserRoleEnum = z.enum(["USER", "SUPER_ADMIN"]);

export const UserForRegisterSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email().describe("unique"),
	password: z.string().min(4),
});

export const UserSchema = z.object({
	id: z.string(),
	is_active: z.boolean(),
	first_name: z.string(),
	last_name: z.string(),
	email: z.string().email().describe("unique"),
	role: UserRoleEnum,
	password: z.string().optional(),
	terms_accepted_at: z.coerce.date().nullable(),
	email_confirmed_at: z.coerce.date().nullable(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const UserLoginSchema = z.object({
	email: z.string().email().describe("unique"),
	password: z.string().min(4),
});

export const UserForUpdateSchema = z
	.object({
		email: z
			.string({ required_error: "El correo es requerido" })
			.email("El correo es invalido")
			.optional()
			.transform((value) => (value === "" ? undefined : value)),
		first_name: z
			.string({
				required_error: "El nombre es requerido",
			})
			.optional()
			.transform((value) => (value === "" ? undefined : value)),
		last_name: z
			.string({ required_error: "El apellido es requerido" })
			.optional()
			.transform((value) => (value === "" ? undefined : value)),
		password: z.string().optional(),
		old_password: z.string().optional(),
	})
	.refine(
		(data) => {
			return (
				(!data.password || data.old_password) &&
				(!data.old_password || data.password)
			);
		},
		{
			message:
				"Password and old_password must both be provided if one is present.",
			path: ["password"],
		},
	);
