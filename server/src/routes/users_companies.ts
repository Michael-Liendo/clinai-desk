import {
	CompanyUserForRegisterSchema,
	CompanyUserForUpdateSchema,
} from "@clinai/shared";
import type { FastifyInstance, RegisterOptions } from "fastify";
import {
	create,
	getByUser,
	getOne,
	listByCompany,
	listByUser,
	remove,
	update,
} from "../controllers/companies_user";
import requestValidation from "../utils/requestValidation";

export default function companiesUser(
	fastify: FastifyInstance,
	_: RegisterOptions,
	done: () => void,
) {
	fastify.route({
		method: "GET",
		url: "/:id",
		handler: getOne,
	});

	fastify.route({
		method: "GET",
		url: "/by-user/:user_id",
		handler: getByUser,
	});

	fastify.route({
		method: "GET",
		url: "/list-by-user/:user_id",
		handler: listByUser,
	});

	fastify.route({
		method: "GET",
		url: "/by-company/:company_id",
		handler: listByCompany,
	});

	fastify.route({
		method: "POST",
		url: "/",
		preValidation: requestValidation(CompanyUserForRegisterSchema),
		handler: create,
	});

	fastify.route({
		method: "PUT",
		url: "/:id",
		preValidation: requestValidation(CompanyUserForUpdateSchema),
		handler: update,
	});

	fastify.route({
		method: "DELETE",
		url: "/:id",
		handler: remove,
	});

	done();
}
