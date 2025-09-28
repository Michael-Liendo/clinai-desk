import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(MasterNameEnum.Values.users, (table) => {
		table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
		table.boolean("is_active").notNullable().defaultTo(true);
		table.string("first_name").notNullable();
		table.string("last_name").notNullable();
		table.string("email").notNullable().unique();
		table.string("phone").nullable();
		table.string("password").notNullable();
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(MasterNameEnum.Values.users);
}
