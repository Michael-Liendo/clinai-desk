import type { ICompanyForRegister, ICompanyForUpdate } from "@clinai/shared";
import Services from "../services";
import type { Reply, Request } from "../types";

export async function getOne(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const company = await Services.companies.getByID(id);
	return reply.code(200).send({ success: true, message: "Ok", data: company });
}

export async function create(request: Request, reply: Reply) {
	const body = request.body as ICompanyForRegister;
	const created = await Services.companies.create(body);
	return reply
		.code(201)
		.send({ success: true, message: "Company created", data: created });
}

export async function update(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	const updates = request.body as Partial<ICompanyForUpdate>;
	const updated = await Services.companies.update(id, updates);
	return reply
		.code(200)
		.send({ success: true, message: "Company updated", data: updated });
}

export async function remove(request: Request, reply: Reply) {
	const { id } = request.params as { id: string };
	await Services.companies.delete(id);
	return reply.code(204).send();
}
