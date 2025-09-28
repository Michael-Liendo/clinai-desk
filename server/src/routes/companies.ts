import {
	CompanyForRegisterSchema,
	CompanyForUpdateSchema,
} from "@clinai/shared";
import type { FastifyInstance, RegisterOptions } from "fastify";
import { create, getOne, remove, update } from "../controllers/companies";
import requestValidation from "../utils/requestValidation";

export default function companies(
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
		method: "POST",
		url: "/",
		preValidation: requestValidation(CompanyForRegisterSchema),
		handler: create,
	});

	fastify.route({
		method: "PUT",
		url: "/:id",
		preValidation: requestValidation(CompanyForUpdateSchema),
		handler: update,
	});

	fastify.route({
		method: "DELETE",
		url: "/:id",
		handler: remove,
	});

	done();
}
