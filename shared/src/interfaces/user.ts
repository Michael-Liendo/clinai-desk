import type { z } from "zod";
import type {
	UserForRegisterSchema,
	UserForUpdateSchema,
	UserLoginSchema,
	UserRoleEnum,
	UserSchema,
} from "../schema";

export type TUserRole = z.infer<typeof UserRoleEnum>;

export interface IUserForLogin extends z.infer<typeof UserLoginSchema> {}

export interface ILoggedInUser {
	token: string;
	user: IUser;
}

export interface IUserForRegister
	extends z.infer<typeof UserForRegisterSchema> {}

export interface IUser extends z.infer<typeof UserSchema> {}

export interface IUserForUpdate extends z.infer<typeof UserForUpdateSchema> {}
