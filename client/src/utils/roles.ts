import type { TCompanyUserRole } from "@clinai/shared";

export function translateCompanyRole(role: TCompanyUserRole): string {
	switch (role) {
		case "admin":
			return "Administrador";
		case "doctor":
			return "Médico";
		case "assistant":
			return "Asistente";
		default:
			return role;
	}
}
