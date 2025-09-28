import { z } from "zod";

// Schemas para objetos anidados
export const ParentInfoSchema = z
	.object({
		name: z.string(),
		dni: z.string().nullable().optional(),
	})
	.nullable()
	.optional();

export const EmergencyContactSchema = z
	.object({
		name: z.string(),
		phone: z.string(),
	})
	.nullable()
	.optional();

export const MedicalInfoSchema = z
	.object({
		allergies: z.string().nullable().optional(),
		current_medications: z.string().nullable().optional(),
		surgeries_history: z.string().nullable().optional(),
		medical_history: z.string().nullable().optional(),
	})
	.nullable()
	.optional();

export const PatientSchema = z.object({
	id: z.string(),
	is_active: z.boolean(),

	// Identificación básica
	first_name: z.string(),
	last_name: z.string(),
	dni: z.string().nullable().optional(), // documento oficial

	// Contacto
	email: z.string().email().nullable().optional(),
	phone: z.string().nullable().optional(),
	address: z.string().nullable().optional(),

	// Datos demográficos
	date_of_birth: z.coerce.date().nullable().optional(),
	gender: z.enum(["male", "female", "other"]).nullable().optional(),
	occupation: z.string().nullable().optional(),

	// Pediátricos (si aplica)
	is_children: z.boolean().nullable().optional(),
	parent: ParentInfoSchema,

	// Emergencia
	emergency_contact: EmergencyContactSchema,

	// Historial médico
	medical_info: MedicalInfoSchema,

	// Otros
	notes: z.string().nullable().optional(), // observaciones generales

	// Interno
	company_id: z.string().uuid(),
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const PatientForCreateSchema = PatientSchema.omit({
	id: true,
	is_active: true,
	created_at: true,
	updated_at: true,
});

export const PatientForUpdateSchema = PatientSchema.omit({
	id: true,
	is_active: true,
	created_at: true,
	updated_at: true,
	company_id: true,
}).partial();

// Inferred Types/Interfaces
export type IParentInfo = z.infer<typeof ParentInfoSchema>;
export type IEmergencyContact = z.infer<typeof EmergencyContactSchema>;
export type IMedicalInfo = z.infer<typeof MedicalInfoSchema>;

export interface IPatient extends z.infer<typeof PatientSchema> {}

export interface IPatientForCreate
	extends z.infer<typeof PatientForCreateSchema> {}

export interface IPatientForUpdate
	extends z.infer<typeof PatientForUpdateSchema> {}
