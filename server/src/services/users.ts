import type { IUser, IUserForUpdate } from "@clinai/shared";
import Repository from "../repository";
import { BadRequestError } from "../utils/errorHandler";
import { comparePassword, hashPassword } from "../utils/password";

export default class Users {
	static async getByID(userID: string): Promise<IUser | undefined> {
		const user = await Repository.users.getUserByID(userID);

		return user;
	}

	static async update(
		id: string,
		userUpdates: Partial<IUserForUpdate>,
		hash_old_password: string,
	): Promise<boolean> {
		if (userUpdates.password && userUpdates.old_password && hash_old_password) {
			if (
				!(await comparePassword(userUpdates.old_password, hash_old_password))
			) {
				throw new BadRequestError("Invalid password");
			}
			const hashedPassword = await hashPassword(userUpdates.password);
			userUpdates.password = hashedPassword;
		}
		// biome-ignore lint/correctness/noUnusedVariables: for no pass old password
		const { old_password: removedValue, ...userToUpdate } = userUpdates;

		const updated = await Repository.users.updateUser(id, userToUpdate);
		return updated;
	}

	static async delete(id: string): Promise<boolean> {
		const deleted = await Repository.users.deleteUser(id);
		return deleted;
	}
}
