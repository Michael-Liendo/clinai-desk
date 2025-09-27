import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
	await knex.schema.createTable(MasterNameEnum.Values.companies, (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
		table.string("name").notNullable();
		table.string("email").notNullable().unique();
		table.string("address").notNullable();
		table.string("phone").notNullable();
		table.boolean("is_active").notNullable().defaultTo(true);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(MasterNameEnum.Values.companies);
}
