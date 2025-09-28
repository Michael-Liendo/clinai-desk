import {
	PatientSchema,
	type IPatient,
	type IPatientForCreate,
	type IPatientForUpdate,
	type IPaginationRequest,
	type ISResponse,
} from "@clinai/shared";
import fetch from "../utils/fetch";

export class PatientsService {
	static async getOne(id: string) {
		const request = await fetch(`/patients/get/${id}`);
		const response: ISResponse<IPatient | undefined> = await request.json();
		if (response.success === false) throw new Error("Error fetching patient");
		return response.data ? PatientSchema.parse(response.data) : undefined;
	}

	static async find(
		params: { company_id: string; q?: string },
		pagination?: IPaginationRequest,
	) {
		const queryParams = new URLSearchParams();
		if (params.q) queryParams.append("q", params.q);
		if (pagination?.page) queryParams.append("page", String(pagination.page));
		if (pagination?.limit)
			queryParams.append("limit", String(pagination.limit));

		const request = await fetch(
			`/patients/search/${params.company_id}?${queryParams.toString()}`,
		);
		const response: ISResponse<IPatient[]> = await request.json();
		const data = PatientSchema.array().parse(response.data);
		return { ...response, data };
	}

	static async create(company_id: string, dto: IPatientForCreate) {
		const request = await fetch(`/patients/create/${company_id}`, {
			method: "POST",
			body: JSON.stringify(dto),
		});
		const response: ISResponse<IPatient> = await request.json();
		if (response.success === false) throw new Error("Error creating patient");
		return PatientSchema.parse(response.data);
	}

	static async update(id: string, updates: IPatientForUpdate) {
		const request = await fetch(`/patients/update/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		});
		const response: ISResponse<IPatient> = await request.json();
		if (response.success === false) throw new Error("Error updating patient");
		return PatientSchema.parse(response.data);
	}

	static async delete(id: string) {
		const request = await fetch(`/patients/delete/${id}`, { method: "DELETE" });
		if (request.status === 400) throw new Error("Bad Request");
		return true;
	}

	static async hardDelete(id: string) {
		const request = await fetch(`/patients/hard/${id}`, { method: "DELETE" });
		if (request.status === 400) throw new Error("Bad Request");
		return true;
	}
}
