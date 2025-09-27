import type { Knex } from "knex";
import { faker } from "@faker-js/faker";

export async function seed(knex: Knex): Promise<void> {
  // Clear existing
  await knex("companies").del();

  const companies = Array.from({ length: 10 }).map(() => ({
    name: faker.company.name(),
    email: faker.internet.email().toLowerCase(),
    address: faker.location.streetAddress({ useFullAddress: true }),
    phone: faker.phone.number(),
    // is_active defaults to true in migration
  }));

  await knex("companies").insert(companies);
}
