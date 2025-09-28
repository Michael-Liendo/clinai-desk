import type {
	ICompanyUser,
	ICompanyUserForRegister,
	ICompanyUserForUpdate,
} from "@clinai/shared";
import Repository from "../repository";
import { BadRequestError } from "../utils/errorHandler";

export default class CompaniesUserService {
	static async getByID(id: string): Promise<ICompanyUser | undefined> {
		const row = await Repository.companies_user.getByID(id);
		return row;
	}

	static async getByUser(user_id: string): Promise<ICompanyUser | undefined> {
		const row = await Repository.companies_user.getByUser(user_id);
		return row;
	}

	static async listByUser(user_id: string): Promise<ICompanyUser[]> {
		const rows = await Repository.companies_user.listByUser(user_id);
		return rows;
	}

	static async listByCompany(company_id: string): Promise<ICompanyUser[]> {
		const rows = await Repository.companies_user.listByCompany(company_id);
		return rows;
	}

	static async create(dto: ICompanyUserForRegister): Promise<ICompanyUser> {
		// If the association already exists, return it and do nothing
		const existingForUser = await Repository.companies_user.listByUser(
			dto.user_id,
		);
		const alreadyLinked = existingForUser.find(
			(r) => r.company_id === dto.company_id,
		);

		if (alreadyLinked) {
			throw new BadRequestError("User already linked to company");
		}

		const created = await Repository.companies_user.create(dto);
		return created;
	}

	static async update(
		id: string,
		updates: Partial<ICompanyUserForUpdate>,
	): Promise<boolean> {
		const updated = await Repository.companies_user.update(id, updates);
		return updated;
	}

	static async delete(id: string): Promise<boolean> {
		const deleted = await Repository.companies_user.delete(id);
		return deleted;
	}
}
