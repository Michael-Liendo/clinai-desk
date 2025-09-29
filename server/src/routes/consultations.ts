import { ConsultationForCreateSchema, ConsultationForUpdateSchema } from "@clinai/shared";
import type { FastifyInstance, RegisterOptions } from "fastify";
import {
	closeConsultation,
	create,
	find,
	getCount,
	getOne,
	getStats,
	getWithPatientInfo,
	remove,
	reopenConsultation,
	update,
} from "../controllers/consultations";
import { checkUser } from "../middlewares/checkUser";
import requestValidation from "../utils/requestValidation";

export default function consultations(
	fastify: FastifyInstance,
	_: RegisterOptions,
	done: () => void,
) {
	fastify.register(checkUser);

	// Find consultations for a company with multiple filter options
	// Supports query params: q, status, patient_id, doctor_id, page, limit
	fastify.route({
		method: "GET",
		url: "/find/:company_id",
		handler: find,
	});

	// Get consultations with patient information
	fastify.route({
		method: "GET",
		url: "/with-patient/:company_id",
		handler: getWithPatientInfo,
	});

	// Get consultation statistics for a company
	fastify.route({
		method: "GET",
		url: "/stats/:company_id",
		handler: getStats,
	});

	// Get consultation count for a company
	fastify.route({
		method: "GET",
		url: "/count/:company_id",
		handler: getCount,
	});

	// Create consultation
	fastify.route({
		method: "POST",
		url: "/create",
		preValidation: requestValidation(ConsultationForCreateSchema),
		handler: create,
	});

	// Get one consultation by id
	fastify.route({
		method: "GET",
		url: "/get/:id",
		handler: getOne,
	});

	// Update consultation
	fastify.route({
		method: "PUT",
		url: "/update/:id",
		preValidation: requestValidation(ConsultationForUpdateSchema),
		handler: update,
	});

	// Close consultation
	fastify.route({
		method: "PATCH",
		url: "/close/:id",
		handler: closeConsultation,
	});

	// Reopen consultation
	fastify.route({
		method: "PATCH",
		url: "/reopen/:id",
		handler: reopenConsultation,
	});

	// Delete consultation
	fastify.route({
		method: "DELETE",
		url: "/delete/:id",
		handler: remove,
	});

	done();
}
