import type { IncomingMessage, ServerResponse } from "node:http";
import type { IReply } from "@clinai/shared";
import type {
	FastifyReply,
	FastifySchema,
	FastifyTypeProviderDefault,
	RawServerDefault,
} from "fastify";

export type Reply = FastifyReply<
	RawServerDefault,
	IncomingMessage,
	ServerResponse<IncomingMessage>,
	{
		Reply: IReply;
	},
	unknown,
	FastifySchema,
	FastifyTypeProviderDefault
>;
