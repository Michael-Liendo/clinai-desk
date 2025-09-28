import { faker } from "@faker-js/faker";
import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	// Clear existing patients first
	await knex("patients").del();

	// Get all companies
	const companies = await knex<{ id: string }>("companies").select("id");

	const batch: unknown[] = [];

	for (const company of companies) {
		// Generate between 15 and 35 patients per company
		const count = faker.number.int({ min: 15, max: 35 });
		for (let i = 0; i < count; i++) {
			const isChildren = faker.datatype.boolean();
			const gender = faker.helpers.arrayElement(["male", "female", "other"]) as
				| "male"
				| "female"
				| "other";

			batch.push({
				first_name: faker.person.firstName(),
				last_name: faker.person.lastName(),
				dni: faker.helpers.maybe(() => faker.string.alphanumeric({ length: 10 }).toUpperCase(), { probability: 0.6 }),
				email: faker.helpers.maybe(() => faker.internet.email().toLowerCase(), { probability: 0.7 }),
				phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }),
				address: faker.helpers.maybe(() => faker.location.streetAddress({ useFullAddress: true }), { probability: 0.5 }),
				date_of_birth: faker.helpers.maybe(() => faker.date.birthdate({ min: 1, max: 90, mode: "age" }), { probability: 0.9 }),
				gender,
				occupation: faker.helpers.maybe(() => faker.person.jobTitle(), { probability: 0.5 }),
				is_children: isChildren ? true : null,
				parent: isChildren
					? { name: faker.person.fullName(), dni: faker.helpers.maybe(() => faker.string.alphanumeric({ length: 10 }).toUpperCase(), { probability: 0.5 }) }
					: null,
				emergency_contact: faker.helpers.maybe(
					() => ({ name: faker.person.fullName(), phone: faker.phone.number() }),
					{ probability: 0.5 },
				),
				medical_info: faker.helpers.maybe(
					() => ({
						allergies: faker.helpers.maybe(() => faker.lorem.words({ min: 1, max: 3 }), { probability: 0.4 }),
						current_medications: faker.helpers.maybe(() => faker.lorem.words({ min: 1, max: 3 }), { probability: 0.3 }),
						surgeries_history: faker.helpers.maybe(() => faker.lorem.words({ min: 1, max: 3 }), { probability: 0.2 }),
						medical_history: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.4 }),
					}),
					{ probability: 0.4 },
				),
				notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
				company_id: company.id,
				// is_active, created_at, updated_at are defaulted by schema
			});
		}
	}

	if (batch.length) {
		await knex("patients").insert(batch);
	}
}
