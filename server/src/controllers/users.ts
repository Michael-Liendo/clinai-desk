import type { IUser, IUserForUpdate } from "@clinai/shared";
import Services from "../services";
import type { Reply, Request } from "../types";

export async function me(request: Request, reply: Reply) {
	// biome-ignore lint/correctness/noUnusedVariables: remove the password from the response
	const { password, ...user } = request.user as IUser;
	return reply.code(200).send({ success: true, message: "Ok", data: user });
}

export async function update(req: Request, reply: Reply) {
	const { id, password } = req.user as Required<IUser>;
	const userUpdates = req.body as IUserForUpdate;

	const updated = await Services.user.update(id, userUpdates, password);
	reply
		.status(200)
		.send({ success: true, message: "User updated", data: updated });
}

export async function deleteUser(req: Request, reply: Reply) {
	const { id } = req.user as Required<IUser>;

	await Services.user.delete(id);

	reply.status(204);
}
