import type {
	ICompanyUser,
	ICompanyUserForRegister,
	ICompanyUserForUpdate,
	ISResponse,
} from "@clinai/shared";
import { CompanyUserSchema } from "@clinai/shared";
import fetch from "../utils/fetch";

export class UsersCompaniesService {
	static async getOne(id: string) {
		const request = await fetch(`/users-companies/${id}`);
		const response: ISResponse<ICompanyUser | undefined> = await request.json();
		if (response.success === false)
			throw new Error("Error fetching company user");
		return response.data ? CompanyUserSchema.parse(response.data) : undefined;
	}

	static async getByUser(user_id: string) {
		const request = await fetch(`/users-companies/by-user/${user_id}`);
		const response: ISResponse<ICompanyUser | undefined> = await request.json();
		if (response.success === false) throw new Error("Error fetching by user");
		return response.data ? CompanyUserSchema.parse(response.data) : undefined;
	}

	static async listByCompany(company_id: string) {
		const request = await fetch(`/users-companies/by-company/${company_id}`);
		const response: ISResponse<ICompanyUser[]> = await request.json();
		if (response.success === false) throw new Error("Error listing by company");
		return CompanyUserSchema.array().parse(response.data);
	}

	static async create(data: ICompanyUserForRegister) {
		const request = await fetch("/users-companies", {
			method: "POST",
			body: JSON.stringify(data),
		});
		const response: ISResponse<ICompanyUser> = await request.json();
		if (response.success === false)
			throw new Error("Error creating company user");
		return CompanyUserSchema.parse(response.data);
	}

	static async update(id: string, data: Partial<ICompanyUserForUpdate>) {
		const request = await fetch(`/users-companies/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});
		const response: ISResponse<boolean> = await request.json();
		if (response.success === false)
			throw new Error("Error updating company user");
		return Boolean(response.data);
	}

	static async delete(id: string) {
		await fetch(`/users-companies/${id}`, { method: "DELETE" });
		return true;
	}
}
