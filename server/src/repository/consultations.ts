import type {
	IConsultation,
	IConsultationForCreate,
	IConsultationForUpdate,
} from "@clinai/shared";
import { InternalServerError } from "../utils/errorHandler";
import database from "./database";

export class Consultations {
	/**
	 * getByID - get a consultation by ID
	 * @param id string
	 * @returns IConsultation | undefined
	 */
	static async getByID(id: string): Promise<IConsultation | undefined> {
		const [consultation] = await database<IConsultation>("consultations").where({ id });
		return consultation;
	}

	/**
	 * find - unified method to find consultations with multiple filter options
	 * @param companyId string
	 * @param filters object with optional filters
	 * @returns { data: IConsultation[], count: number }
	 */
	static async find(
		companyId: string,
		filters: {
			patient_id?: string;
			user_id?: string;
			status?: "open" | "closed";
			searchTerm?: string;
			page?: number;
			limit?: number;
		} = {},
	): Promise<{ data: IConsultation[]; count: number }> {
		const { patient_id, user_id, status, searchTerm, page = 1, limit = 10 } = filters;
		const offset = (page - 1) * limit;

		// Build the base query
		const baseQuery = database<IConsultation>("consultations")
			.where("company_id", companyId);

		// Apply filters
		if (patient_id) {
			baseQuery.andWhere("patient_id", patient_id);
		}

		if (user_id) {
			baseQuery.andWhere("user_id", user_id);
		}

		if (status) {
			baseQuery.andWhere("status", status);
		}

		if (searchTerm) {
			const searchPattern = `%${searchTerm.trim().replace(/\s+/g, " ")}%`;
			baseQuery.andWhere(function () {
				this.whereILike("reason_for_consultation", searchPattern)
					.orWhereILike("symptoms", searchPattern)
					.orWhereILike("diagnosis", searchPattern)
					.orWhereILike("treatment", searchPattern);
			});
		}

		const [data, countResult] = await Promise.all([
			baseQuery
				.clone()
				.orderBy("consultation_date", "desc")
				.limit(limit)
				.offset(offset),
			baseQuery.clone().count("* as count").first() as unknown as Promise<{ count: number }>,
		]);

		const count = Number(countResult.count || 0);
		return { data, count };
	}


	/**
	 * create - creates a new consultation
	 * @param consultationDTO IConsultationForCreate
	 * @returns IConsultation
	 */
	static async create(
		consultationDTO: IConsultationForCreate,
	): Promise<IConsultation> {
		try {
			const consultationData = {
				...consultationDTO,
				created_at: new Date(),
				updated_at: new Date(),
			};

			const [consultation] = await database<IConsultation>("consultations")
				.insert(consultationData)
				.returning("*");

			if (!consultation) throw new InternalServerError("Error creating consultation");
			return consultation;
		} catch (error) {
			throw new InternalServerError(`Error creating consultation: ${error}`);
		}
	}

	/**
	 * update - updates a consultation's information
	 * @param id string
	 * @param consultationUpdates IConsultationForUpdate
	 * @param companyId string
	 * @returns IConsultation
	 */
	static async update(
		id: string,
		consultationUpdates: IConsultationForUpdate,
		companyId: string,
	): Promise<IConsultation> {
		try {
			const updateData = {
				...consultationUpdates,
				updated_at: new Date(),
			};

			const [updatedConsultation] = await database<IConsultation>("consultations")
				.where({ id, company_id: companyId })
				.update(updateData)
				.returning("*");

			if (!updatedConsultation) {
				throw new Error(`Consultation with id ${id} not found or access denied`);
			}

			return updatedConsultation;
		} catch (error) {
			throw new InternalServerError(`Error updating consultation: ${error}`);
		}
	}

	/**
	 * delete - permanently delete a consultation
	 * @param id string
	 * @param companyId string
	 * @returns boolean
	 */
	static async delete(id: string, companyId: string): Promise<boolean> {
		try {
			const rowsDeleted = await database("consultations")
				.where({ id, company_id: companyId })
				.del();

			if (rowsDeleted === 0) {
				throw new Error(`Consultation with id ${id} not found or access denied`);
			}

			return true;
		} catch (error) {
			throw new InternalServerError(`Error deleting consultation: ${error}`);
		}
	}

	/**
	 * closeConsultation - mark a consultation as closed
	 * @param id string
	 * @param companyId string
	 * @returns IConsultation
	 */
	static async closeConsultation(
		id: string,
		companyId: string,
	): Promise<IConsultation> {
		try {
			const [closedConsultation] = await database<IConsultation>("consultations")
				.where({ id, company_id: companyId })
				.update({
					status: "closed",
					updated_at: new Date(),
				})
				.returning("*");

			if (!closedConsultation) {
				throw new Error(`Consultation with id ${id} not found or access denied`);
			}

			return closedConsultation;
		} catch (error) {
			throw new InternalServerError(`Error closing consultation: ${error}`);
		}
	}

	/**
	 * reopenConsultation - mark a consultation as open
	 * @param id string
	 * @param companyId string
	 * @returns IConsultation
	 */
	static async reopenConsultation(
		id: string,
		companyId: string,
	): Promise<IConsultation> {
		try {
			const [reopenedConsultation] = await database<IConsultation>("consultations")
				.where({ id, company_id: companyId })
				.update({
					status: "open",
					updated_at: new Date(),
				})
				.returning("*");

			if (!reopenedConsultation) {
				throw new Error(`Consultation with id ${id} not found or access denied`);
			}

			return reopenedConsultation;
		} catch (error) {
			throw new InternalServerError(`Error reopening consultation: ${error}`);
		}
	}

	/**
	 * count - get total count of consultations for a company
	 * @param companyId string
	 * @returns number
	 */
	static async count(companyId: string): Promise<number> {
		const result = (await database<IConsultation>("consultations")
			.where({ company_id: companyId })
			.count("* as count")
			.first()) as { count: string } | undefined;

		return Number(result?.count || 0);
	}

	/**
	 * countByStatus - get count of consultations by status for a company
	 * @param companyId string
	 * @param status "open" | "closed"
	 * @returns number
	 */
	static async countByStatus(
		companyId: string,
		status: "open" | "closed",
	): Promise<number> {
		const result = (await database<IConsultation>("consultations")
			.where({ company_id: companyId, status })
			.count("* as count")
			.first()) as { count: string } | undefined;

		return Number(result?.count || 0);
	}

	/**
	 * getConsultationsWithPatientInfo - get consultations with patient information joined
	 * @param companyId string
	 * @param page number
	 * @param limit number
	 * @returns { data: Array<IConsultation & { patient: { first_name: string, last_name: string, dni?: string } }>, count: number }
	 */
	static async getConsultationsWithPatientInfo(
		companyId: string,
		page = 1,
		limit = 10,
	): Promise<{
		data: Array<IConsultation & { patient: { first_name: string; last_name: string; dni?: string } }>;
		count: number;
	}> {
		const offset = (page - 1) * limit;

		const [data, countResult] = await Promise.all([
			database<IConsultation>("consultations")
				.select(
					"consultations.*",
					"patients.first_name as patient_first_name",
					"patients.last_name as patient_last_name",
					"patients.dni as patient_dni",
				)
				.leftJoin("patients", "consultations.patient_id", "patients.id")
				.where({ "consultations.company_id": companyId })
				.orderBy("consultations.consultation_date", "desc")
				.limit(limit)
				.offset(offset),
			database<IConsultation>("consultations")
				.where({ company_id: companyId })
				.count("* as count")
				.first() as unknown as Promise<{ count: number }>,
		]);

		// Transform the data to include patient info
		const transformedData = data.map((row: any) => ({
			...row,
			patient: {
				first_name: row.patient_first_name,
				last_name: row.patient_last_name,
				dni: row.patient_dni,
			},
			// Remove the flattened patient fields
			patient_first_name: undefined,
			patient_last_name: undefined,
			patient_dni: undefined,
		}));

		const count = Number(countResult.count || 0);
		return { data: transformedData, count };
	}
}
