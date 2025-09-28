import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TextField } from "@/components/text-field";
import { useCompanyContext } from "@/context/CompanyContext";
import { PrivateRoutesEnum } from "@/data/routesEnums";
import Services from "@/services";
import type { IPatientForCreate } from "@clinai/shared";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PatientCreatePage() {
	const navigate = useNavigate();
	const { activeCompany } = useCompanyContext();

	const [form, setForm] = useState<IPatientForCreate>({
		first_name: "",
		last_name: "",
		dni: undefined,
		company_id: "",
		email: undefined,
		phone: undefined,
		address: undefined,
		date_of_birth: undefined as unknown as Date | undefined,
		gender: undefined,
		occupation: undefined,
		is_children: undefined,
		parent: undefined,
		emergency_contact: undefined,
		medical_info: undefined,
		notes: undefined,
	});

	useEffect(() => {
		if (activeCompany?.id) {
			setForm((prev) => ({ ...prev, company_id: activeCompany.id }));
		}
	}, [activeCompany?.id]);

	const isValid = useMemo(() => {
		return (
			form.first_name.trim().length > 0 && form.last_name.trim().length > 0
		);
	}, [form.first_name, form.last_name]);

	const { mutateAsync, isPending } = useMutation({
		mutationFn: async () => {
			if (!activeCompany?.id) throw new Error("No hay compañía activa");
			const created = await Services.patients.create(activeCompany.id, form);
			return created;
		},
		onSuccess: (patient) => {
			navigate(PrivateRoutesEnum.PatientDetails.replace(":id", patient.id));
		},
	});

	function handleChange<K extends keyof IPatientForCreate>(
		key: K,
		value: IPatientForCreate[K],
	) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	if (!activeCompany?.id) {
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold mb-2">Crear paciente</h1>
				<p className="text-sm text-muted-foreground">
					Selecciona una empresa para crear pacientes.
				</p>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex flex-col space-y-2 mb-4">
				<h1 className="text-xl font-semibold">Crear paciente</h1>
				<p className="text-sm text-muted-foreground">
					Completa la información del paciente. Los campos mínimos son Nombre y
					Apellido.
				</p>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>Información del paciente</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label>Nombre</Label>
							<TextField
								value={form.first_name}
								onChange={(e) => handleChange("first_name", e.target.value)}
								placeholder="Nombre"
							/>
						</div>
						<div>
							<Label>Apellido</Label>
							<TextField
								value={form.last_name}
								onChange={(e) => handleChange("last_name", e.target.value)}
								placeholder="Apellido"
							/>
						</div>
						<div>
							<Label>DNI</Label>
							<TextField
								value={form.dni ?? ""}
								onChange={(e) =>
									handleChange("dni", e.target.value || undefined)
								}
								placeholder="Documento de identidad"
							/>
						</div>
						<div>
							<Label>Email</Label>
							<TextField
								type="email"
								value={form.email ?? ""}
								onChange={(e) =>
									handleChange("email", e.target.value || undefined)
								}
								placeholder="correo@ejemplo.com"
							/>
						</div>
						<div>
							<Label>Teléfono</Label>
							<TextField
								value={form.phone ?? ""}
								onChange={(e) =>
									handleChange("phone", e.target.value || undefined)
								}
								placeholder="+58 000 0000"
							/>
						</div>
						<div>
							<Label>Dirección</Label>
							<TextField
								value={form.address ?? ""}
								onChange={(e) =>
									handleChange("address", e.target.value || undefined)
								}
								placeholder="Calle 123..."
							/>
						</div>
						<div>
							<Label>Fecha de nacimiento</Label>
							<TextField
								type="date"
								value={
									form.date_of_birth
										? new Date(form.date_of_birth).toISOString().slice(0, 10)
										: ""
								}
								onChange={(e) =>
									handleChange(
										"date_of_birth",
										e.target.value ? new Date(e.target.value) : undefined,
									)
								}
							/>
						</div>
						<div>
							<Label>Género</Label>
							<Select
								value={form.gender ?? ""}
								onValueChange={(val) =>
									handleChange(
										"gender",
										(val || undefined) as IPatientForCreate["gender"],
									)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Seleccione" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="male">Masculino</SelectItem>
									<SelectItem value="female">Femenino</SelectItem>
									<SelectItem value="other">Otro</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Ocupación</Label>
							<TextField
								value={form.occupation ?? ""}
								onChange={(e) =>
									handleChange("occupation", e.target.value || undefined)
								}
								placeholder="Profesión u ocupación"
							/>
						</div>
						<div>
							<Label>Notas</Label>
							<Textarea
								value={form.notes ?? ""}
								onChange={(e) =>
									handleChange("notes", e.target.value || undefined)
								}
								placeholder="Notas adicionales"
							/>
						</div>
					</div>

					<div className="mt-6 flex gap-2 justify-end">
						<Button variant="outline" onClick={() => navigate(-1)}>
							Cancelar
						</Button>
						<Button
							disabled={!isValid || isPending}
							onClick={() => mutateAsync()}
						>
							{isPending ? "Guardando..." : "Crear paciente"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
