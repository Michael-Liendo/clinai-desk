import { MasterNameEnum } from "@clinai/shared";
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTableIfNotExists(
		MasterNameEnum.Values.companies_user,
		(table) => {
			table.uuid("id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
			table
				.uuid("company_id")
				.references("id")
				.inTable(MasterNameEnum.Values.companies)
				.notNullable();
			table
				.uuid("user_id")
				.references("id")
				.inTable(MasterNameEnum.Values.users)
				.notNullable();
			table.enum("role", ["admin", "doctor", "assistant"]).notNullable();
			table.timestamps(true, true);
		},
	);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(MasterNameEnum.Values.companies_user);
}
