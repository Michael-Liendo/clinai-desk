import type {
	IConsultation,
	IConsultationForCreate,
	IConsultationForUpdate,
} from "@clinai/shared";
import Repository from "../repository";
import Services from "../services";
import { BadRequestError, NotFoundError } from "../utils/errorHandler";

export default class ConsultationsService {
	/**
	 * Get consultation by ID with access validation
	 */
	static async getByID(id: string, userId: string): Promise<IConsultation> {
		const consultation = await Repository.consultations.getByID(id);
		if (!consultation) {
			throw new NotFoundError("Consultation not found");
		}

		// Validate user has access to the consultation's company
		await ConsultationsService.validateUserAccess(
			userId,
			consultation.company_id,
		);
		return consultation;
	}

	/**
	 * Unified method to find consultations with multiple filter options
	 */
	static async find(
		companyId: string,
		userId: string,
		filters: {
			q?: string;
			status?: "open" | "closed";
			patient_id?: string;
			doctor_id?: string;
			page?: number;
			limit?: number;
		} = {},
	): Promise<{ data: IConsultation[]; count: number }> {
		const { q, status, patient_id, doctor_id, page = 1, limit = 10 } = filters;

		// Validate user has access to the company
		await ConsultationsService.validateUserAccess(userId, companyId);

		// If patient_id is provided, validate the patient exists and belongs to the company
		if (patient_id) {
			const patient = await Repository.patients.getByID(patient_id);
			if (!patient || !patient.is_active) {
				throw new NotFoundError("Patient not found or inactive");
			}
			if (patient.company_id !== companyId) {
				throw new BadRequestError(
					"Patient does not belong to the specified company",
				);
			}
		}

		// Use the unified repository method with all filters
		return Repository.consultations.find(companyId, {
			patient_id,
			user_id: doctor_id,
			status,
			searchTerm: q,
			page,
			limit,
		});
	}

	/**
	 * Get consultations with patient information
	 */
	static async getConsultationsWithPatientInfo(
		companyId: string,
		userId: string,
		page = 1,
		limit = 10,
	): Promise<{
		data: Array<
			IConsultation & {
				patient: { first_name: string; last_name: string; dni?: string };
			}
		>;
		count: number;
	}> {
		await ConsultationsService.validateUserAccess(userId, companyId);
		return Repository.consultations.getConsultationsWithPatientInfo(
			companyId,
			page,
			limit,
		);
	}

	/**
	 * Create a new consultation
	 */
	static async create(
		consultationDTO: IConsultationForCreate,
		userId: string,
	): Promise<IConsultation> {
		// Validate user has access to the company
		await ConsultationsService.validateUserAccess(
			userId,
			consultationDTO.company_id,
		);

		// Validate the patient exists and belongs to the same company
		const patient = await Repository.patients.getByID(
			consultationDTO.patient_id,
		);
		if (!patient || !patient.is_active) {
			throw new BadRequestError("Patient not found or inactive");
		}
		if (patient.company_id !== consultationDTO.company_id) {
			throw new BadRequestError(
				"Patient does not belong to the specified company",
			);
		}

		// Validate the doctor exists and belongs to the same company
		const doctor = await Repository.users.getUserByID(consultationDTO.user_id);
		if (!doctor) {
			throw new BadRequestError("Doctor not found");
		}

		// Validate doctor has access to the company
		const doctorMemberships = await Services.companies_user.listByUser(
			consultationDTO.user_id,
		);
		const doctorHasAccess = doctorMemberships.some(
			(m) => m.company_id === consultationDTO.company_id,
		);
		if (!doctorHasAccess) {
			throw new BadRequestError("Doctor does not have access to this company");
		}

		return Repository.consultations.create(consultationDTO);
	}

	/**
	 * Update a consultation
	 */
	static async update(
		id: string,
		consultationUpdates: IConsultationForUpdate,
		userId: string,
	): Promise<IConsultation> {
		const current = await Repository.consultations.getByID(id);
		if (!current) {
			throw new NotFoundError("Consultation not found");
		}

		await ConsultationsService.validateUserAccess(userId, current.company_id);

		// If updating patient_id, validate the new patient
		if (consultationUpdates.patient_id) {
			const patient = await Repository.patients.getByID(
				consultationUpdates.patient_id,
			);
			if (!patient || !patient.is_active) {
				throw new BadRequestError("Patient not found or inactive");
			}
			if (patient.company_id !== current.company_id) {
				throw new BadRequestError(
					"Patient does not belong to the same company",
				);
			}
		}

		// If updating user_id (doctor), validate the new doctor
		if (consultationUpdates.user_id) {
			const doctor = await Repository.users.getUserByID(
				consultationUpdates.user_id,
			);
			if (!doctor) {
				throw new BadRequestError("Doctor not found");
			}

			const doctorMemberships = await Services.companies_user.listByUser(
				consultationUpdates.user_id,
			);
			const doctorHasAccess = doctorMemberships.some(
				(m) => m.company_id === current.company_id,
			);
			if (!doctorHasAccess) {
				throw new BadRequestError(
					"Doctor does not have access to this company",
				);
			}
		}

		return Repository.consultations.update(
			id,
			consultationUpdates,
			current.company_id,
		);
	}

	/**
	 * Delete a consultation
	 */
	static async delete(id: string, userId: string): Promise<boolean> {
		const current = await Repository.consultations.getByID(id);
		if (!current) {
			throw new NotFoundError("Consultation not found");
		}

		await ConsultationsService.validateUserAccess(userId, current.company_id);
		return Repository.consultations.delete(id, current.company_id);
	}

	/**
	 * Close a consultation
	 */
	static async closeConsultation(
		id: string,
		userId: string,
	): Promise<IConsultation> {
		const current = await Repository.consultations.getByID(id);
		if (!current) {
			throw new NotFoundError("Consultation not found");
		}

		if (current.status === "closed") {
			throw new BadRequestError("Consultation is already closed");
		}

		await ConsultationsService.validateUserAccess(userId, current.company_id);
		return Repository.consultations.closeConsultation(id, current.company_id);
	}

	/**
	 * Reopen a consultation
	 */
	static async reopenConsultation(
		id: string,
		userId: string,
	): Promise<IConsultation> {
		const current = await Repository.consultations.getByID(id);
		if (!current) {
			throw new NotFoundError("Consultation not found");
		}

		if (current.status === "open") {
			throw new BadRequestError("Consultation is already open");
		}

		await ConsultationsService.validateUserAccess(userId, current.company_id);
		return Repository.consultations.reopenConsultation(id, current.company_id);
	}

	/**
	 * Get consultation count for a company
	 */
	static async count(companyId: string, userId: string): Promise<number> {
		await ConsultationsService.validateUserAccess(userId, companyId);
		return Repository.consultations.count(companyId);
	}

	/**
	 * Get consultation count by status
	 */
	static async countByStatus(
		companyId: string,
		status: "open" | "closed",
		userId: string,
	): Promise<number> {
		await ConsultationsService.validateUserAccess(userId, companyId);
		return Repository.consultations.countByStatus(companyId, status);
	}

	/**
	 * Get consultation statistics for a company
	 */
	static async getStats(
		companyId: string,
		userId: string,
	): Promise<{
		total: number;
		open: number;
		closed: number;
	}> {
		await ConsultationsService.validateUserAccess(userId, companyId);

		const [total, open, closed] = await Promise.all([
			Repository.consultations.count(companyId),
			Repository.consultations.countByStatus(companyId, "open"),
			Repository.consultations.countByStatus(companyId, "closed"),
		]);

		return { total, open, closed };
	}

	/**
	 * Private method to validate user access to a company
	 */
	private static async validateUserAccess(
		userId: string,
		companyId: string,
	): Promise<void> {
		const memberships = await Services.companies_user.listByUser(userId);
		const canAccess = memberships.some((m) => m.company_id === companyId);
		if (!canAccess) {
			throw new BadRequestError("Access denied to this company");
		}
	}
}
