import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	// Deletes ALL existing entries
	await knex(MasterNameEnum.Values.consultations).del();

	// Get some existing data for foreign keys
	const companies = await knex(MasterNameEnum.Values.companies).select("id").limit(1);
	const patients = await knex(MasterNameEnum.Values.patients).select("id").limit(3);
	const doctors = await knex(MasterNameEnum.Values.users).select("id").limit(2);

	if (companies.length === 0 || patients.length === 0 || doctors.length === 0) {
		console.log("No hay datos suficientes para crear consultas de ejemplo");
		return;
	}

	const companyId = companies[0].id;
	const doctorId = doctors[0].id;

	// Inserts seed entries
	await knex(MasterNameEnum.Values.consultations).insert([
		{
			patient_id: patients[0]?.id,
			user_id: doctorId,
			company_id: companyId,
			reason_for_consultation: "Dolor abdominal",
			symptoms: "Dolor en la parte baja del abdomen, náuseas ocasionales, malestar general desde hace 2 días",
			diagnosis: "Gastroenteritis aguda",
			treatment: "Ibuprofeno 400mg cada 8 horas por 3 días, dieta blanda, hidratación abundante",
			notes: "Paciente refiere mejora con analgésicos. Recomendar seguimiento si persisten síntomas",
			status: "closed",
			consultation_date: new Date("2024-01-15T10:30:00"),
		},
		{
			patient_id: patients[1]?.id,
			user_id: doctorId,
			company_id: companyId,
			reason_for_consultation: "Control de presión arterial",
			symptoms: "Sin síntomas específicos, control rutinario",
			diagnosis: "Hipertensión arterial controlada",
			treatment: "Continuar con Enalapril 10mg diario, control en 3 meses",
			notes: "Presión arterial dentro de rangos normales. Paciente adherente al tratamiento",
			status: "closed",
			consultation_date: new Date("2024-01-16T14:00:00"),
		},
		{
			patient_id: patients[2]?.id,
			user_id: doctors[1]?.id || doctorId,
			company_id: companyId,
			reason_for_consultation: "Dolor de cabeza persistente",
			symptoms: "Cefalea frontal intensa, fotofobia, duración de 3 días",
			diagnosis: null, // Pendiente de estudios
			treatment: "Paracetamol 500mg cada 6 horas, reposo",
			notes: "Solicitar TAC cerebral. Evaluar en 48 horas si no mejora",
			status: "open",
			consultation_date: new Date("2024-01-17T09:15:00"),
		},
	]);
}
