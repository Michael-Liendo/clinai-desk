import type { ICompanyUser, ICompanyUserForRegister } from "@clinai/shared";
import { InternalServerError } from "../utils/errorHandler";
import database from "./database";

export class CompaniesUser {
	/**
	 * create - creates a companies_user relation and returns the created row
	 */
	static async create(dto: ICompanyUserForRegister): Promise<ICompanyUser> {
		const [row] = await database<ICompanyUser>("companies_user")
			.insert(dto)
			.returning("*");
		if (!row) throw new InternalServerError("Error creating companies_user");
		return row;
	}
	/**
	 * getByID - get a companies_user record by ID
	 */
	static async getByID(id: string): Promise<ICompanyUser | undefined> {
		const [row] = await database<ICompanyUser>("companies_user").where({ id });
		return row;
	}

	/**
	 * getByUser - get a relation by user_id
	 */
	static async getByUser(user_id: string): Promise<ICompanyUser | undefined> {
		const [row] = await database<ICompanyUser>("companies_user").where({
			user_id,
		});
		return row;
	}

	/**
	 * listByCompany - list all relations for a company
	 */
	static async listByCompany(company_id: string): Promise<ICompanyUser[]> {
		return database<ICompanyUser>("companies_user").where({ company_id });
	}

	/**
	 * update - updates a companies_user row by id
	 */
	static async update(
		id: string,
		updates: Partial<ICompanyUser>,
	): Promise<boolean> {
		try {
			const rowsUpdated = await database("companies_user")
				.where({ id })
				.update({ ...updates, updated_at: new Date() });

			if (rowsUpdated === 0) {
				throw new Error(`companies_user with id ${id} not found`);
			}

			return true;
		} catch (error) {
			throw new InternalServerError(`Error updating companies_user: ${error}`);
		}
	}

	/**
	 * delete - deletes a companies_user row by id
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			const rowsDeleted = await database("companies_user").where({ id }).del();
			if (rowsDeleted === 0) {
				throw new Error(`companies_user with id ${id} not found`);
			}
			return true;
		} catch (error) {
			throw new InternalServerError(`Error deleting companies_user: ${error}`);
		}
	}
}
