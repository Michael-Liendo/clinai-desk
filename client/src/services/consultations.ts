import {
	type IConsultation,
	type IConsultationForCreate,
	type IConsultationForUpdate,
	type IPaginationRequest,
	type ISResponse,
	ConsultationSchema,
} from "@clinai/shared";
import fetch from "../utils/fetch";

export interface IConsultationFilters {
	q?: string;
	status?: "open" | "closed";
	patient_id?: string;
	doctor_id?: string;
}

export interface IConsultationWithPatient extends IConsultation {
	patient: {
		first_name: string;
		last_name: string;
		dni?: string;
	};
}

export interface IConsultationStats {
	total: number;
	open: number;
	closed: number;
}

export class ConsultationsService {
	/**
	 * Get a single consultation by ID
	 */
	static async getOne(id: string) {
		const request = await fetch(`/consultations/get/${id}`);
		const response: ISResponse<IConsultation | undefined> = await request.json();
		if (response.success === false) throw new Error("Error fetching consultation");
		return response.data ? ConsultationSchema.parse(response.data) : undefined;
	}

	/**
	 * Find consultations with multiple filter options
	 */
	static async find(
		companyId: string,
		filters?: IConsultationFilters,
		pagination?: IPaginationRequest,
	) {
		const queryParams = new URLSearchParams();
		
		if (filters?.q) queryParams.append("q", filters.q);
		if (filters?.status) queryParams.append("status", filters.status);
		if (filters?.patient_id) queryParams.append("patient_id", filters.patient_id);
		if (filters?.doctor_id) queryParams.append("doctor_id", filters.doctor_id);
		if (pagination?.page) queryParams.append("page", String(pagination.page));
		if (pagination?.limit) queryParams.append("limit", String(pagination.limit));

		const request = await fetch(
			`/consultations/find/${companyId}?${queryParams.toString()}`,
		);
		const response: ISResponse<IConsultation[]> = await request.json();
		if (response.success === false) throw new Error("Error fetching consultations");
		
		const data = ConsultationSchema.array().parse(response.data);
		return { ...response, data };
	}

	/**
	 * Get consultations with patient information
	 */
	static async findWithPatientInfo(
		companyId: string,
		pagination?: IPaginationRequest,
	) {
		const queryParams = new URLSearchParams();
		if (pagination?.page) queryParams.append("page", String(pagination.page));
		if (pagination?.limit) queryParams.append("limit", String(pagination.limit));

		const request = await fetch(
			`/consultations/with-patient/${companyId}?${queryParams.toString()}`,
		);
		const response: ISResponse<IConsultationWithPatient[]> = await request.json();
		if (response.success === false) throw new Error("Error fetching consultations with patient info");
		
		return response;
	}

	/**
	 * Create a new consultation
	 */
	static async create(dto: IConsultationForCreate) {
		const request = await fetch("/consultations/create", {
			method: "POST",
			body: JSON.stringify(dto),
		});
		const response: ISResponse<IConsultation> = await request.json();
		if (response.success === false) throw new Error("Error creating consultation");
		return ConsultationSchema.parse(response.data);
	}

	/**
	 * Update an existing consultation
	 */
	static async update(id: string, updates: IConsultationForUpdate) {
		const request = await fetch(`/consultations/update/${id}`, {
			method: "PUT",
			body: JSON.stringify(updates),
		});
		const response: ISResponse<IConsultation> = await request.json();
		if (response.success === false) throw new Error("Error updating consultation");
		return ConsultationSchema.parse(response.data);
	}

	/**
	 * Delete a consultation
	 */
	static async delete(id: string) {
		const request = await fetch(`/consultations/delete/${id}`, { 
			method: "DELETE" 
		});
		if (request.status === 400) throw new Error("Bad Request");
		return true;
	}

	/**
	 * Close a consultation
	 */
	static async close(id: string) {
		const request = await fetch(`/consultations/close/${id}`, {
			method: "PATCH",
			body: JSON.stringify({}),
		});
		const response: ISResponse<IConsultation> = await request.json();
		if (response.success === false) throw new Error("Error closing consultation");
		return ConsultationSchema.parse(response.data);
	}

	/**
	 * Reopen a consultation
	 */
	static async reopen(id: string) {
		const request = await fetch(`/consultations/reopen/${id}`, {
			method: "PATCH",
			body: JSON.stringify({}),
		});
		const response: ISResponse<IConsultation> = await request.json();
		if (response.success === false) throw new Error("Error reopening consultation");
		return ConsultationSchema.parse(response.data);
	}

	/**
	 * Get consultation statistics for a company
	 */
	static async getStats(companyId: string) {
		const request = await fetch(`/consultations/stats/${companyId}`);
		const response: ISResponse<IConsultationStats> = await request.json();
		if (response.success === false) throw new Error("Error fetching consultation stats");
		return response.data;
	}

	/**
	 * Get consultation count for a company
	 */
	static async getCount(companyId: string, status?: "open" | "closed") {
		const queryParams = new URLSearchParams();
		if (status) queryParams.append("status", status);

		const request = await fetch(
			`/consultations/count/${companyId}?${queryParams.toString()}`,
		);
		const response: ISResponse<{ count: number }> = await request.json();
		if (response.success === false) throw new Error("Error fetching consultation count");
		return response.data.count;
	}

	/**
	 * Helper methods for common use cases
	 */

	/**
	 * Get all consultations for a company
	 */
	static async getAll(companyId: string, pagination?: IPaginationRequest) {
		return ConsultationsService.find(companyId, {}, pagination);
	}

	/**
	 * Get open consultations for a company
	 */
	static async getOpen(companyId: string, pagination?: IPaginationRequest) {
		return ConsultationsService.find(companyId, { status: "open" }, pagination);
	}

	/**
	 * Get closed consultations for a company
	 */
	static async getClosed(companyId: string, pagination?: IPaginationRequest) {
		return ConsultationsService.find(companyId, { status: "closed" }, pagination);
	}

	/**
	 * Get consultations for a specific patient
	 */
	static async getByPatient(
		companyId: string,
		patientId: string,
		pagination?: IPaginationRequest,
	) {
		return ConsultationsService.find(companyId, { patient_id: patientId }, pagination);
	}

	/**
	 * Get consultations for a specific doctor
	 */
	static async getByDoctor(
		companyId: string,
		doctorId: string,
		pagination?: IPaginationRequest,
	) {
		return ConsultationsService.find(companyId, { doctor_id: doctorId }, pagination);
	}

	/**
	 * Search consultations by text
	 */
	static async search(
		companyId: string,
		searchTerm: string,
		pagination?: IPaginationRequest,
	) {
		return ConsultationsService.find(companyId, { q: searchTerm }, pagination);
	}

	/**
	 * Get open consultations for a specific patient
	 */
	static async getOpenByPatient(
		companyId: string,
		patientId: string,
		pagination?: IPaginationRequest,
	) {
		return ConsultationsService.find(
			companyId,
			{ patient_id: patientId, status: "open" },
			pagination,
		);
	}

	/**
	 * Search in open consultations
	 */
	static async searchOpen(
		companyId: string,
		searchTerm: string,
		pagination?: IPaginationRequest,
	) {
		return ConsultationsService.find(
			companyId,
			{ q: searchTerm, status: "open" },
			pagination,
		);
	}
}
