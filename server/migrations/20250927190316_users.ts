import { MasterNameEnum, UserRoleEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
	await knex.schema.createTable(MasterNameEnum.Values.users, (table) => {
		table
			.uuid("id")
			.unique()
			.defaultTo(knex.raw("uuid_generate_v4()"))
			.primary();
		table.boolean("is_active").notNullable().defaultTo(true);
		table.string("first_name").notNullable();
		table.string("last_name").notNullable();
		table.string("email").notNullable().unique();
		table
			.enum("role", UserRoleEnum.options)
			.notNullable()
			.defaultTo(UserRoleEnum.Enum.USER);

		table.string("password").notNullable();
		table.timestamp("terms_accepted_at").nullable();
		table.timestamp("email_confirmed_at").nullable();
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists(MasterNameEnum.Values.users);
}
