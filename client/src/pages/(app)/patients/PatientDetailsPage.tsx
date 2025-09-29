import type { IPatient } from "@clinai/shared";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompanyContext } from "@/context/CompanyContext";
import Services from "@/services";

// Función para traducir géneros
function translateGender(gender: string | null | undefined): string {
	if (!gender) return "-";
	
	const translations: Record<string, string> = {
		male: "Masculino",
		female: "Femenino", 
		other: "Otro"
	};
	
	return translations[gender] || gender;
}

export default function PatientDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { activeCompany } = useCompanyContext();

	const { data, isLoading, error } = useQuery<
		{ patient?: IPatient } | undefined
	>({
		queryKey: ["patient", id],
		queryFn: async () => {
			if (!id) return { patient: undefined };
			const patient = await Services.patients.getOne(id);
			return { patient };
		},
		enabled: !!id,
	});

	if (!activeCompany?.id) {
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold mb-2">Paciente</h1>
				<p className="text-sm text-muted-foreground">
					Selecciona una empresa para ver información del paciente.
				</p>
			</div>
		);
	}

	return (
		<div className="p-4">
			<div className="flex flex-col space-y-2 mb-4">
				<h1 className="text-xl font-semibold">Detalles del paciente</h1>
				<p className="text-sm text-muted-foreground">
					Información detallada del paciente seleccionado.
				</p>
			</div>
			{isLoading ? (
				<p>Cargando...</p>
			) : error ? (
				<p className="text-destructive">Error al cargar el paciente.</p>
			) : data?.patient ? (
				<Card>
					<CardHeader>
						<CardTitle>
							{data.patient.first_name} {data.patient.last_name}
						</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-muted-foreground">DNI</p>
							<p className="font-medium">{data.patient.dni ?? "-"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Email</p>
							<p className="font-medium">{data.patient.email ?? "-"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Teléfono</p>
							<p className="font-medium">{data.patient.phone ?? "-"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Dirección</p>
							<p className="font-medium">{data.patient.address ?? "-"}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">
								Fecha de nacimiento
							</p>
							<p className="font-medium">
								{data.patient.date_of_birth
									? new Date(data.patient.date_of_birth).toLocaleDateString(
											"es-ES",
										)
									: "-"}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Género</p>
							<p className="font-medium">{translateGender(data.patient.gender)}</p>
						</div>
						<div className="md:col-span-2">
							<p className="text-sm text-muted-foreground">Notas</p>
							<p className="font-medium whitespace-pre-wrap">
								{data.patient.notes ?? "-"}
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<p>No se encontró el paciente.</p>
			)}
		</div>
	);
}
