import type {
	IPatientForCreate,
	IPatientForUpdate,
	IUser,
} from "@clinai/shared";
import Services from "../services";
import type { Reply, Request } from "../types";

export async function getOne(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const patient = await Services.patients.getByID(id);
	return reply.code(200).send({ success: true, message: "Ok", data: patient });
}

export async function find(request: Request, reply: Reply) {
	const {
		q = "",
		page = "1",
		limit = "50",
		company_id,
	} = request.query as {
		q?: string;
		page?: string;
		limit?: string;
		company_id: string;
	};
	const pageNum = Number(page) || 1;
	const limitNum = Number(limit) || 50;
	const result = q
		? await Services.patients.find(company_id, q, pageNum, limitNum)
		: await Services.patients.getByCompany(company_id, pageNum, limitNum);

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
	const { company_id } = request.params as { company_id: string };
	const body = request.body as IPatientForCreate;
	const created = await Services.patients.create(body, company_id);
	return reply
		.code(201)
		.send({ success: true, message: "Patient created", data: created });
}

export async function update(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	const updates = request.body as Partial<IPatientForUpdate>;
	const updated = await Services.patients.update(id, updates, userId);
	return reply
		.code(200)
		.send({ success: true, message: "Patient updated", data: updated });
}

export async function remove(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	await Services.patients.delete(id, userId);
	return reply.code(204).send();
}

export async function hardRemove(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const { id: userId } = request.user as Required<IUser>;
	await Services.patients.hardDelete(id, userId);
	return reply.code(204).send();
}
