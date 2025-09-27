import type { ICompany, ICompanyForRegister } from "@clinai/shared";
import { InternalServerError } from "../utils/errorHandler";
import database from "./database";

export class Companies {
	/**
	 * getByEmail - get a company by email
	 * @param email string
	 * @returns ICompany | undefined
	 */
	static async getByEmail(email: string): Promise<ICompany | undefined> {
		const [company] = await database<ICompany>("companies").where({ email });
		return company;
	}

	/**
	 * getByID - get a company by ID
	 * @param id string
	 * @returns ICompany | undefined
	 */
	static async getByID(id: string): Promise<ICompany | undefined> {
		const [company] = await database<ICompany>("companies").where({ id });
		return company;
	}

	/**
	 * create - creates a company and returns the created row
	 * @param companyDTO ICompanyForRegister
	 * @returns ICompany
	 */
	static async create(companyDTO: ICompanyForRegister): Promise<ICompany> {
		const [company] = await database<ICompany>("companies")
			.insert(companyDTO)
			.returning("*");
		if (!company) throw new InternalServerError("Error creating company");
		return company;
	}

	/**
	 * update - updates a company's information
	 * @param id string
	 * @param companyUpdates Partial<ICompany>
	 * @returns boolean
	 */
	static async update(
		id: string,
		companyUpdates: Partial<ICompany>,
	): Promise<boolean> {
		try {
			const rowsUpdated = await database("companies")
				.where({ id })
				.update({ ...companyUpdates, updated_at: new Date() });

			if (rowsUpdated === 0) {
				throw new Error(`Company with id ${id} not found`);
			}

			return true;
		} catch (error) {
			throw new InternalServerError(`Error updating company: ${error}`);
		}
	}

	/**
	 * delete - deletes a company by ID
	 * @param id string
	 * @returns boolean
	 */
	static async delete(id: string): Promise<boolean> {
		try {
			const rowsDeleted = await database("companies").where({ id }).del();
			if (rowsDeleted === 0) {
				throw new Error(`Company with id ${id} not found`);
			}
			return true;
		} catch (error) {
			throw new InternalServerError(`Error deleting company: ${error}`);
		}
	}
}
