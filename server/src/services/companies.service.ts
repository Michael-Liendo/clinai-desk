import type {
	ICompany,
	ICompanyForRegister,
	ICompanyForUpdate,
} from "@clinai/shared";
import Repository from "../repository";
import { BadRequestError } from "../utils/errorHandler";

export default class CompaniesService {
	static async getByID(id: string): Promise<ICompany | undefined> {
		const company = await Repository.companies.getByID(id);
		return company;
	}

	static async create(dto: ICompanyForRegister): Promise<ICompany> {
		const existing = await Repository.companies.getByEmail(dto.email);
		if (existing) {
			throw new BadRequestError("Company email already exists");
		}

		const company = await Repository.companies.create(dto);
		return company;
	}

	static async update(
		id: string,
		companyUpdates: Partial<ICompanyForUpdate>,
	): Promise<boolean> {
		// Ensure company exists
		const current = await Repository.companies.getByID(id);
		if (!current) {
			throw new BadRequestError("Company not found");
		}

		// If updating email, normalize and ensure uniqueness (excluding current)
		if (companyUpdates.email) {
			companyUpdates.email = companyUpdates.email.trim().toLowerCase();
			const taken = await Repository.companies.getByEmail(companyUpdates.email);
			if (taken && taken.id !== id) {
				throw new BadRequestError("Company email already exists");
			}
		}

		const updated = await Repository.companies.update(id, companyUpdates);
		return updated;
	}

	static async delete(id: string): Promise<boolean> {
		// Ensure company exists before deleting
		const current = await Repository.companies.getByID(id);
		if (!current) {
			throw new BadRequestError("Company not found");
		}
		const deleted = await Repository.companies.delete(id);
		return deleted;
	}
}
