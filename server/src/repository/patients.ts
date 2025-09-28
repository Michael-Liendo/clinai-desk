import type {
	IPatient,
	IPatientForCreate,
	IPatientForUpdate,
} from "@clinai/shared";
import { InternalServerError } from "../utils/errorHandler";
import database from "./database";

export class Patients {
	/**
	 * getByID - get a patient by ID
	 * @param id string
	 * @returns IPatient | undefined
	 */
	static async getByID(id: string): Promise<IPatient | undefined> {
		const [patient] = await database<IPatient>("patients").where({ id });
		return patient;
	}

	/**
	 * getByCompany - get all patients for a company with pagination
	 * @param companyId string
	 * @param page number
	 * @param limit number
	 * @returns { data: IPatient[], count: number }
	 */
	static async getByCompany(
		companyId: string,
		page = 1,
		limit = 10,
	): Promise<{ data: IPatient[]; count: number }> {
		const offset = (page - 1) * limit;

		const [data, countResult] = await Promise.all([
			database<IPatient>("patients")
				.where({ company_id: companyId, is_active: true })
				.orderBy("created_at", "desc")
				.limit(limit)
				.offset(offset),
			database<IPatient>("patients")
				.where({ company_id: companyId, is_active: true })
				.count("* as count")
				.first(),
		]);

		const count = Number(countResult || 0);
		return { data, count };
	}

	/**
	 * find - search patients by name, DNI, or email with pagination
	 * @param companyId string
	 * @param searchTerm string
	 * @param page number
	 * @param limit number
	 * @returns { data: IPatient[], count: number }
	 */
	static async find(
		companyId: string,
		searchTerm: string,
		page = 1,
		limit = 10,
	): Promise<{ data: IPatient[]; count: number }> {
		const offset = (page - 1) * limit;
		const normalized = (searchTerm || "").trim().replace(/\s+/g, " ");
		const searchPattern = `%${normalized}%`;

		const baseQuery = database<IPatient>("patients")
			.where({ company_id: companyId, is_active: true })
			.andWhere(function () {
				this.whereILike("first_name", searchPattern)
					.orWhereILike("last_name", searchPattern)
					.orWhereILike("dni", searchPattern)
					.orWhereILike("email", searchPattern)
					.orWhereRaw("concat(first_name, ' ', last_name) ILIKE ?", [
						searchPattern,
					])
					.orWhereRaw("concat(last_name, ' ', first_name) ILIKE ?", [
						searchPattern,
					]);
			});

		const [data, countResult] = await Promise.all([
			baseQuery
				.clone()
				.orderBy("created_at", "desc")
				.limit(limit)
				.offset(offset),
			baseQuery.clone().count("* as count").first(),
		]);

		const count = Number(countResult || 0);
		return { data, count };
	}

	/**
	 * create - creates a new patient
	 * @param patientDTO IPatientForCreate
	 * @param companyId string
	 * @returns IPatient
	 */
	static async create(
		patientDTO: IPatientForCreate,
		companyId: string,
	): Promise<IPatient> {
		try {
			const patientData = {
				...patientDTO,
				company_id: companyId,
				is_active: true,
				created_at: new Date(),
				updated_at: new Date(),
			};

			const [patient] = await database<IPatient>("patients")
				.insert(patientData)
				.returning("*");

			if (!patient) throw new InternalServerError("Error creating patient");
			return patient;
		} catch (error) {
			throw new InternalServerError(`Error creating patient: ${error}`);
		}
	}

	/**
	 * update - updates a patient's information
	 * @param id string
	 * @param patientUpdates IPatientForUpdate
	 * @param companyId string
	 * @returns IPatient
	 */
	static async update(
		id: string,
		patientUpdates: IPatientForUpdate,
		companyId: string,
	): Promise<IPatient> {
		try {
			const updateData = {
				...patientUpdates,
				updated_at: new Date(),
			};

			const [updatedPatient] = await database<IPatient>("patients")
				.where({ id, company_id: companyId, is_active: true })
				.update(updateData)
				.returning("*");

			if (!updatedPatient) {
				throw new Error(`Patient with id ${id} not found or access denied`);
			}

			return updatedPatient;
		} catch (error) {
			throw new InternalServerError(`Error updating patient: ${error}`);
		}
	}

	/**
	 * delete - soft delete a patient (sets is_active to false)
	 * @param id string
	 * @param companyId string
	 * @returns boolean
	 */
	static async delete(id: string, companyId: string): Promise<boolean> {
		try {
			const rowsUpdated = await database("patients")
				.where({ id, company_id: companyId, is_active: true })
				.update({
					is_active: false,
					updated_at: new Date(),
				});

			if (rowsUpdated === 0) {
				throw new Error(`Patient with id ${id} not found or access denied`);
			}

			return true;
		} catch (error) {
			throw new InternalServerError(`Error deleting patient: ${error}`);
		}
	}

	/**
	 * hardDelete - permanently delete a patient (use with caution)
	 * @param id string
	 * @param companyId string
	 * @returns boolean
	 */
	static async hardDelete(id: string, companyId: string): Promise<boolean> {
		try {
			const rowsDeleted = await database("patients")
				.where({ id, company_id: companyId })
				.del();

			if (rowsDeleted === 0) {
				throw new Error(`Patient with id ${id} not found or access denied`);
			}

			return true;
		} catch (error) {
			throw new InternalServerError(
				`Error permanently deleting patient: ${error}`,
			);
		}
	}

	/**
	 * count - get total count of active patients for a company
	 * @param companyId string
	 * @returns number
	 */
	static async count(companyId: string): Promise<number> {
		const result = (await database<IPatient>("patients")
			.where({ company_id: companyId, is_active: true })
			.count("* as count")
			.first()) as { count: string } | undefined;

		return Number(result?.count || 0);
	}
}
