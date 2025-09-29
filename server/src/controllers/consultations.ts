import type {
	IConsultationForCreate,
	IConsultationForUpdate,
	IUser,
} from "@clinai/shared";
import Services from "../services";
import type { Reply, Request } from "../types";
import { BadRequestError } from "../utils/errorHandler";

export async function getOne(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	const consultation = await Services.consultations.getByID(id, userId);
	return reply.code(200).send({ success: true, message: "Ok", data: consultation });
}

export async function find(request: Request, reply: Reply) {
	const { company_id } = request.params as { company_id: string };
	const { id: userId } = request.user as Required<IUser>;
	const {
		q,
		page = "1",
		limit = "50",
		status,
		patient_id,
		doctor_id,
	} = request.query as {
		q?: string;
		page?: string;
		limit?: string;
		status?: "open" | "closed";
		patient_id?: string;
		doctor_id?: string;
	};

	if (!company_id) {
		throw new BadRequestError("Company ID is required");
	}

	const pageNum = Number(page) || 1;
	const limitNum = Number(limit) || 50;

	// Use the unified find method with all filters
	const result = await Services.consultations.find(company_id, userId, {
		q,
		status,
		patient_id,
		doctor_id,
		page: pageNum,
		limit: limitNum,
	});

	const pagination = {
		page: pageNum,
		limit: limitNum,
		total: result.count,
		hasPreviousPage: pageNum > 1,
		hasNextPage: pageNum * limitNum < result.count,
	};

	return reply
		.code(200)
		.send({ success: true, message: "Ok", data: result.data, pagination });
}

export async function getWithPatientInfo(request: Request, reply: Reply) {
	const { company_id } = request.params as { company_id: string };
	const { id: userId } = request.user as Required<IUser>;
	const {
		page = "1",
		limit = "50",
	} = request.query as {
		page?: string;
		limit?: string;
	};

	if (!company_id) {
		throw new BadRequestError("Company ID is required");
	}

	const pageNum = Number(page) || 1;
	const limitNum = Number(limit) || 50;

	const result = await Services.consultations.getConsultationsWithPatientInfo(
		company_id,
		userId,
		pageNum,
		limitNum,
	);

	const pagination = {
		page: pageNum,
		limit: limitNum,
		total: result.count,
		hasPreviousPage: pageNum > 1,
		hasNextPage: pageNum * limitNum < result.count,
	};

	return reply
		.code(200)
		.send({ success: true, message: "Ok", data: result.data, pagination });
}

export async function create(request: Request, reply: Reply) {
	const { id: userId } = request.user as Required<IUser>;
	const body = request.body as IConsultationForCreate;
	const created = await Services.consultations.create(body, userId);
	return reply
		.code(201)
		.send({ success: true, message: "Consultation created", data: created });
}

export async function update(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	const updates = request.body as IConsultationForUpdate;
	const updated = await Services.consultations.update(id, updates, userId);
	return reply
		.code(200)
		.send({ success: true, message: "Consultation updated", data: updated });
}

export async function remove(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	await Services.consultations.delete(id, userId);
	return reply.code(204).send();
}

export async function closeConsultation(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	const closed = await Services.consultations.closeConsultation(id, userId);
	return reply
		.code(200)
		.send({ success: true, message: "Consultation closed", data: closed });
}

export async function reopenConsultation(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	const reopened = await Services.consultations.reopenConsultation(id, userId);
	return reply
		.code(200)
		.send({ success: true, message: "Consultation reopened", data: reopened });
}

export async function getStats(request: Request, reply: Reply) {
	const { company_id } = request.params as { company_id: string };
	const { id: userId } = request.user as Required<IUser>;

	if (!company_id) {
		throw new BadRequestError("Company ID is required");
	}

	const stats = await Services.consultations.getStats(company_id, userId);
	return reply
		.code(200)
		.send({ success: true, message: "Ok", data: stats });
}

export async function getCount(request: Request, reply: Reply) {
	const { company_id } = request.params as { company_id: string };
	const { id: userId } = request.user as Required<IUser>;
	const { status } = request.query as { status?: "open" | "closed" };

	if (!company_id) {
		throw new BadRequestError("Company ID is required");
	}

	const count = status
		? await Services.consultations.countByStatus(company_id, status, userId)
		: await Services.consultations.count(company_id, userId);

	return reply
		.code(200)
		.send({ success: true, message: "Ok", data: { count } });
}
