import type { IUser } from "@clinai/shared";
import type { FastifyRequest } from "fastify";

export interface Request extends FastifyRequest {
	user?: IUser;
}
