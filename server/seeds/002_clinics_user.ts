import type { Knex } from "knex";
import { faker } from "@faker-js/faker";

export async function seed(knex: Knex): Promise<void> {
  // Ensure required tables exist
  const hasUsers = await knex.schema.hasTable("users");
  const hasClinicsUser = await knex.schema.hasTable("clinics_user");
  const hasCompanies = await knex.schema.hasTable("companies");

  if (!hasUsers || !hasClinicsUser || !hasCompanies) {
    // Skip seeding if dependencies are missing
    return;
  }

  // Clear existing
  await knex("clinics_user").del();

  // Fetch some clinics and users
  const companies = await knex("companies").select("id");
  const users = await knex("users").select("id");

  if (companies.length === 0 || users.length === 0) return;

  const roles = ["admin", "doctor", "assistant"] as const;

  const rows = Array.from({ length: Math.min(20, users.length) }).map(() => {
    const company = faker.helpers.arrayElement(companies);
    const user = faker.helpers.arrayElement(users);
    const role = faker.helpers.arrayElement(roles);

    return {
      company_id: company.id,
      user_id: user.id,
      role,
    };
  });

  await knex("clinics_user").insert(rows);
}
