import { z } from "zod";

export const ConsultationSchema = z.object({
	id: z.string().uuid(),

	// Identificadores
	patient_id: z.string().uuid(),
	user_id: z.string().uuid(), // referencia al usuario médico
	company_id: z.string().uuid(),

	// Información clínica
	reason_for_consultation: z.string(), // motivo de consulta
	symptoms: z.string().nullable().optional(), // descripción de síntomas
	diagnosis: z.string().nullable().optional(), // diagnóstico del médico
	treatment: z.string().nullable().optional(), // tratamiento indicado
	notes: z.string().nullable().optional(), // notas adicionales del médico

	// Información administrativa
	status: z.enum(["open", "closed"]), // si la consulta quedó pendiente o finalizada
	consultation_date: z.coerce.date(), // fecha y hora de la consulta

	// Auditoría
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export const ConsultationForCreateSchema = ConsultationSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

export const ConsultationForUpdateSchema = ConsultationSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
	company_id: true,
}).partial();

// Inferred Types/Interfaces
export interface IConsultation extends z.infer<typeof ConsultationSchema> {}

export interface IConsultationForCreate
	extends z.infer<typeof ConsultationForCreateSchema> {}

export interface IConsultationForUpdate
	extends z.infer<typeof ConsultationForUpdateSchema> {}
