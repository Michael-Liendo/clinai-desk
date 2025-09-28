import type {
	ICompany,
	ICompanyForRegister,
	ICompanyForUpdate,
	ISResponse,
} from "@clinai/shared";
import { CompanySchema } from "@clinai/shared";
import fetch from "../utils/fetch";

export class CompaniesService {
	static async getOne(id: string) {
		const request = await fetch(`/companies/${id}`);
		const response: ISResponse<ICompany | undefined> = await request.json();

		if (response.success === false) throw new Error("Error fetching company");

		return response.data ? CompanySchema.parse(response.data) : undefined;
	}

	static async create(data: ICompanyForRegister) {
		const request = await fetch("/companies", {
			method: "POST",
			body: JSON.stringify(data),
		});

		const response: ISResponse<ICompany> = await request.json();
		if (response.success === false) throw new Error("Error creating company");

		return CompanySchema.parse(response.data);
	}

	static async update(id: string, data: Partial<ICompanyForUpdate>) {
		const request = await fetch(`/companies/${id}`, {
			method: "PUT",
			body: JSON.stringify(data),
		});

		const response: ISResponse<boolean> = await request.json();
		if (response.success === false) throw new Error("Error updating company");

		return Boolean(response.data);
	}

	static async delete(id: string) {
		await fetch(`/companies/${id}`, {
			method: "DELETE",
		});
		return true;
	}
}
