import type { TMasterName } from "interfaces";
import { MasterNameEnum } from "../schema/server";

export function validateMasterName(masterName: string): boolean {
	return MasterNameEnum.options.includes(masterName as TMasterName);
}
