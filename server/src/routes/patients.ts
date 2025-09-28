import { PatientForCreateSchema, PatientForUpdateSchema } from "@clinai/shared";
import type { FastifyInstance, RegisterOptions } from "fastify";
import {
	create,
	find,
	getOne,
	hardRemove,
	remove,
	update,
} from "../controllers/patients";
import { checkUser } from "../middlewares/checkUser";
import requestValidation from "../utils/requestValidation";

export default function patients(
	fastify: FastifyInstance,
	_: RegisterOptions,
	done: () => void,
) {
	fastify.register(checkUser);

	// Search patients for a company
	fastify.route({
		method: "GET",
		url: "/search/:company_id",
		handler: find,
	});

	// Create patient
	fastify.route({
		method: "POST",
		url: "/create/:company_id",
		preValidation: requestValidation(PatientForCreateSchema),
		handler: create,
	});

	// Get one patient by id
	fastify.route({
		method: "GET",
		url: "/get/:id",
		handler: getOne,
	});

	// Update patient
	fastify.route({
		method: "PUT",
		url: "/update/:id",
		preValidation: requestValidation(PatientForUpdateSchema),
		handler: update,
	});

	// Soft delete patient
	fastify.route({
		method: "DELETE",
		url: "/delete/:id",
		handler: remove,
	});

	// Hard delete patient
	fastify.route({
		method: "DELETE",
		url: "/hard/:id",
		handler: hardRemove,
	});

	done();
}
