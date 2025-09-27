import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTableIfNotExists(
		MasterNameEnum.Values.clinics_user,
		(table) => {
			table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
			table.uuid("clinic_id").references("id").inTable("clinics").notNullable();
			table.uuid("user_id").references("id").inTable("users").notNullable();
			table.enum("role", ["admin", "doctor", "assistant"]).notNullable();
			table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
			table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
		},
	);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(MasterNameEnum.Values.clinics_user);
}
