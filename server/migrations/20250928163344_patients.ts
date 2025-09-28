import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(MasterNameEnum.Values.patients, (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
		table.boolean("is_active").notNullable().defaultTo(true);

		// Identificación básica
		table.string("first_name").notNullable();
		table.string("last_name").notNullable();
		table.string("dni").nullable();

		// Contacto
		table.string("email").nullable();
		table.string("phone").nullable();
		table.text("address").nullable();

		// Datos demográficos
		table.date("date_of_birth").nullable();
		table.enum("gender", ["male", "female", "other"]).nullable();
		table.string("occupation").nullable();

		// Pediátricos (si aplica)
		table.boolean("is_children").nullable();
		table.json("parent").nullable(); // { name: string, dni?: string }

		// Emergencia
		table.json("emergency_contact").nullable(); // { name: string, phone: string }

		// Historial médico
		table.json("medical_info").nullable(); // { allergies?, current_medications?, surgeries_history?, medical_history? }

		// Otros
		table.text("notes").nullable();

		// Interno
		table
			.uuid("company_id")
			.notNullable()
			.references("id")
			.inTable(MasterNameEnum.Values.companies)
			.onDelete("CASCADE");
		table.timestamps(true, true);

		// Indexes for better performance
		table.index(["company_id"]);
		table.index(["email"]);
		table.index(["first_name", "last_name"]);
		table.index(["dni"]);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(MasterNameEnum.Values.patients);
}
