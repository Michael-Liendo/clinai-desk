import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(
		MasterNameEnum.Values.consultations,
		(table) => {
			table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));

			// Identificadores
			table
				.uuid("patient_id")
				.notNullable()
				.references("id")
				.inTable(MasterNameEnum.Values.patients)
				.onDelete("CASCADE");

			table
				.uuid("user_id")
				.notNullable()
				.references("id")
				.inTable(MasterNameEnum.Values.users)
				.onDelete("CASCADE");

			table
				.uuid("company_id")
				.notNullable()
				.references("id")
				.inTable(MasterNameEnum.Values.companies)
				.onDelete("CASCADE");

			// Información clínica
			table.text("reason_for_consultation").notNullable(); // motivo de consulta
			table.text("symptoms").nullable(); // descripción de síntomas
			table.text("diagnosis").nullable(); // diagnóstico del médico
			table.text("treatment").nullable(); // tratamiento indicado
			table.text("notes").nullable(); // notas adicionales del médico

			// Información administrativa
			table.enum("status", ["open", "closed"]).notNullable().defaultTo("open");
			table.timestamp("consultation_date").notNullable();

			// Auditoría
			table.timestamps(true, true);

			// Indexes for better performance
			table.index(["patient_id"]);
			table.index(["user_id"]);
			table.index(["company_id"]);
			table.index(["consultation_date"]);
			table.index(["status"]);
			table.index(["patient_id", "consultation_date"]);
		},
	);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(MasterNameEnum.Values.consultations);
}
