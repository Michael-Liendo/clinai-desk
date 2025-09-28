import type {
  ICompanyUserForRegister,
  ICompanyUserForUpdate,
} from "@clinai/shared";
import Services from "../services";
import type { Reply, Request } from "../types";

export async function getOne(request: Request, reply: Reply) {
  const { id } = request.params as { id: string };
  const row = await Services.companies_user.getByID(id);
  return reply.code(200).send({ success: true, message: "Ok", data: row });
}

export async function getByUser(request: Request, reply: Reply) {
  const { user_id } = request.params as { user_id: string };
  const row = await Services.companies_user.getByUser(user_id);
  return reply.code(200).send({ success: true, message: "Ok", data: row });
}

export async function listByCompany(request: Request, reply: Reply) {
  const { company_id } = request.params as { company_id: string };
  const rows = await Services.companies_user.listByCompany(company_id);
  return reply.code(200).send({ success: true, message: "Ok", data: rows });
}

export async function create(request: Request, reply: Reply) {
  const body = request.body as ICompanyUserForRegister;
  const created = await Services.companies_user.create(body);
  return reply
    .code(201)
    .send({ success: true, message: "Company user created", data: created });
}

export async function update(request: Request, reply: Reply) {
  const { id } = request.params as { id: string };
  const updates = request.body as Partial<ICompanyUserForUpdate>;
  const updated = await Services.companies_user.update(id, updates);
  return reply
    .code(200)
    .send({ success: true, message: "Company user updated", data: updated });
}

export async function remove(request: Request, reply: Reply) {
  const { id } = request.params as { id: string };
  await Services.companies_user.delete(id);
  return reply.code(204).send();
}
