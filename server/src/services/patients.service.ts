import type {
	IPatient,
	IPatientForCreate,
	IPatientForUpdate,
} from "@clinai/shared";
import Repository from "../repository";
import Services from "../services";
import { BadRequestError, NotFoundError } from "../utils/errorHandler";

export default class PatientsService {
	static async getByID(id: string): Promise<IPatient> {
		const patient = await Repository.patients.getByID(id);
		if (!patient) {
			throw new NotFoundError("Patient not found");
		}
		return patient;
	}

	static async getByCompany(
		companyId: string,
		page = 1,
		limit = 10,
	): Promise<{ data: IPatient[]; count: number }> {
		return Repository.patients.getByCompany(companyId, page, limit);
	}

	static async find(
		companyId: string,
		searchTerm: string,
		page = 1,
		limit = 10,
	): Promise<{ data: IPatient[]; count: number }> {
		return Repository.patients.find(companyId, searchTerm, page, limit);
	}

	static async create(
		patientDTO: IPatientForCreate,
		companyId: string,
	): Promise<IPatient> {
		const created = await Repository.patients.create(patientDTO, companyId);
		return created;
	}

	static async update(
		id: string,
		patientUpdates: Partial<IPatientForUpdate>,
		userId: string,
	): Promise<IPatient> {
		const current = await Repository.patients.getByID(id);
		if (!current || !current.is_active) {
			throw new BadRequestError("Patient not found or inactive");
		}

		// Ensure the user has access to the patient's company
		const memberships = await Services.companies_user.listByUser(userId);
		const canAccess = memberships.some(
			(m) => m.company_id === current.company_id,
		);
		if (!canAccess) {
			throw new BadRequestError("Access denied");
		}

		const updated = await Repository.patients.update(
			id,
			patientUpdates,
			current.company_id,
		);
		return updated;
	}

	static async delete(id: string, userId: string): Promise<boolean> {
		const current = await Repository.patients.getByID(id);
		if (!current || !current.is_active) {
			throw new BadRequestError("Patient not found or inactive");
		}
		const memberships = await Services.companies_user.listByUser(userId);
		const canAccess = memberships.some(
			(m) => m.company_id === current.company_id,
		);
		if (!canAccess) {
			throw new BadRequestError("Access denied");
		}
		return Repository.patients.delete(id, current.company_id);
	}

	static async hardDelete(id: string, userId: string): Promise<boolean> {
		const current = await Repository.patients.getByID(id);
		if (!current) {
			throw new BadRequestError("Patient not found");
		}
		const memberships = await Services.companies_user.listByUser(userId);
		const canAccess = memberships.some(
			(m) => m.company_id === current.company_id,
		);
		if (!canAccess) {
			throw new BadRequestError("Access denied");
		}
		return Repository.patients.hardDelete(id, current.company_id);
	}

	static async count(companyId: string): Promise<number> {
		return Repository.patients.count(companyId);
	}
}
