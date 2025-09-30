import type { IConsultation, IPatient } from "@clinai/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyContext } from "@/context/CompanyContext";
import Services from "@/services";

// Función para obtener las iniciales del nombre
function getInitials(
	firstName: string | null | undefined,
	lastName: string | null | undefined,
): string {
	const first = firstName?.charAt(0)?.toUpperCase() || "";
	const last = lastName?.charAt(0)?.toUpperCase() || "";
	return first + last || "?";
}

export default function ConsultationDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { activeCompany } = useCompanyContext();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Estados para el formulario
	const [isEditing, setIsEditing] = useState(true); // Empezar en modo edición para consultas nuevas
	const [formData, setFormData] = useState({
		reason_for_consultation: "",
		symptoms: "",
		diagnosis: "",
		treatment: "",
		notes: "",
	});

	// Cargar datos de la consulta
	const { data: consultationData, isLoading: isLoadingConsultation } = useQuery({
		queryKey: ["consultation", id],
		queryFn: async () => {
			if (!id) return { consultation: undefined };
			const consultation = await Services.consultations.getOne(id);
			return { consultation };
		},
		enabled: !!id,
	});

	// Efecto para actualizar el formulario cuando se cargan los datos
	useEffect(() => {
		if (consultationData?.consultation) {
			setFormData({
				reason_for_consultation: consultationData.consultation.reason_for_consultation || "",
				symptoms: consultationData.consultation.symptoms || "",
				diagnosis: consultationData.consultation.diagnosis || "",
				treatment: consultationData.consultation.treatment || "",
				notes: consultationData.consultation.notes || "",
			});
			// Si la consulta está cerrada, nunca permitir edición
			// Si la consulta ya tiene datos y está abierta, no empezar en modo edición
			if (consultationData.consultation.status === "closed") {
				setIsEditing(false);
			} else if (consultationData.consultation.reason_for_consultation) {
				setIsEditing(false);
			}
		}
	}, [consultationData]);

	// Cargar datos del paciente
	const { data: patientData, isLoading: isLoadingPatient } = useQuery<{
		patient?: IPatient;
	}>({
		queryKey: ["patient", consultationData?.consultation?.patient_id],
		queryFn: async () => {
			if (!consultationData?.consultation?.patient_id) return { patient: undefined };
			const patient = await Services.patients.getOne(consultationData.consultation.patient_id);
			return { patient };
		},
		enabled: !!consultationData?.consultation?.patient_id,
	});

	// Función para guardar cambios
	const handleSave = async () => {
		if (!id || !consultationData?.consultation) return;

		try {
			await Services.consultations.update(id, formData);
			queryClient.invalidateQueries({ queryKey: ["consultation", id] });
			setIsEditing(false);
		} catch (error) {
			console.error("Error al guardar consulta:", error);
		}
	};

	// Función para cerrar consulta
	const handleCloseConsultation = async () => {
		if (!id) return;

		try {
			await Services.consultations.close(id);
			queryClient.invalidateQueries({ queryKey: ["consultation", id] });
		} catch (error) {
			console.error("Error al cerrar consulta:", error);
		}
	};

	// Función para reabrir consulta
	const handleReopenConsultation = async () => {
		if (!id) return;

		try {
			await Services.consultations.reopen(id);
			queryClient.invalidateQueries({ queryKey: ["consultation", id] });
		} catch (error) {
			console.error("Error al reabrir consulta:", error);
		}
	};

	if (!activeCompany?.id) {
		return (
			<div className="p-4">
				<h1 className="text-xl font-semibold mb-2">Consulta</h1>
				<p className="text-sm text-muted-foreground">
					Selecciona una empresa para ver la consulta.
				</p>
			</div>
		);
	}

	if (isLoadingConsultation || isLoadingPatient) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-2">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
					<p className="text-muted-foreground">Cargando consulta...</p>
				</div>
			</div>
		);
	}

	const consultation = consultationData?.consultation;
	const patient = patientData?.patient;
	
	// Determinar si la consulta puede ser editada (solo si está abierta)
	const canEdit = consultation?.status === "open";
	const isEditingAndCanEdit = isEditing && canEdit;

	if (!consultation) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center space-y-2">
					<p className="text-destructive font-medium">Consulta no encontrada</p>
					<Button onClick={() => navigate("/patients")} variant="outline">
						Volver a pacientes
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
			{/* Header */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between py-6">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => navigate(`/patients/${patient?.id || ""}`)}
						>
							← Volver al paciente
						</Button>
						<div className="h-6 w-px bg-border" />
						<h1 className="text-2xl font-bold">Consulta Médica</h1>
						<Badge
							variant={consultation.status === "open" ? "default" : "secondary"}
							className={
								consultation.status === "open"
									? "bg-green-100 text-green-700"
									: "bg-gray-100 text-gray-700"
							}
						>
							{consultation.status === "open" ? "Abierta" : "Cerrada"}
						</Badge>
					</div>
					<div className="flex items-center gap-2">
						{consultation.status === "open" ? (
							<>
								{isEditing ? (
									<>
										<Button variant="outline" onClick={() => setIsEditing(false)}>
											Cancelar
										</Button>
										<Button onClick={handleSave}>Guardar</Button>
									</>
								) : (
									<Button 
										onClick={() => setIsEditing(true)}
										disabled={!canEdit}
									>
										Editar
									</Button>
								)}
								<Button variant="destructive" onClick={handleCloseConsultation}>
									Cerrar consulta
								</Button>
							</>
						) : (
							<Button variant="outline" onClick={handleReopenConsultation}>
								Reabrir consulta
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Contenido principal */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					{/* Información del paciente */}
					<div className="lg:col-span-1">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Información del Paciente</CardTitle>
							</CardHeader>
							<CardContent>
								{patient ? (
									<div className="space-y-4">
										<div className="flex items-center gap-3">
											<Avatar className="h-12 w-12">
												<AvatarImage src="" alt={`${patient.first_name} ${patient.last_name}`} />
												<AvatarFallback>
													{getInitials(patient.first_name, patient.last_name)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">
													{patient.first_name} {patient.last_name}
												</p>
												{patient.dni && (
													<p className="text-sm text-muted-foreground">DNI: {patient.dni}</p>
												)}
											</div>
										</div>
										<div className="space-y-2 text-sm">
											<p>
												<span className="font-medium">Teléfono:</span>{" "}
												{patient.phone || "No especificado"}
											</p>
											<p>
												<span className="font-medium">Email:</span>{" "}
												{patient.email || "No especificado"}
											</p>
										</div>
									</div>
								) : (
									<p className="text-muted-foreground">Cargando información del paciente...</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Formulario de consulta */}
					<div className="lg:col-span-3">
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Detalles de la Consulta</CardTitle>
								<p className="text-sm text-muted-foreground">
									Fecha: {new Date(consultation.consultation_date).toLocaleDateString("es-ES", {
										year: "numeric",
										month: "long",
										day: "numeric",
										hour: "2-digit",
										minute: "2-digit",
									})}
								</p>
							</CardHeader>
							<CardContent className="space-y-6">
								{/* Motivo de consulta */}
								<div className="space-y-2">
									<Label htmlFor="reason">Motivo de consulta</Label>
									{isEditingAndCanEdit ? (
										<Input
											id="reason"
											value={formData.reason_for_consultation}
											onChange={(e) =>
												setFormData({ ...formData, reason_for_consultation: e.target.value })
											}
											placeholder="Describe el motivo principal de la consulta"
										/>
									) : (
										<p className="text-sm bg-muted p-3 rounded-md">
											{formData.reason_for_consultation || "No especificado"}
										</p>
									)}
								</div>

								{/* Síntomas */}
								<div className="space-y-2">
									<Label htmlFor="symptoms">Síntomas</Label>
									{isEditingAndCanEdit ? (
										<Textarea
											id="symptoms"
											value={formData.symptoms}
											onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
											placeholder="Describe los síntomas del paciente"
											rows={3}
										/>
									) : (
										<p className="text-sm bg-muted p-3 rounded-md">
											{formData.symptoms || "No especificado"}
										</p>
									)}
								</div>

								{/* Diagnóstico */}
								<div className="space-y-2">
									<Label htmlFor="diagnosis">Diagnóstico</Label>
									{isEditingAndCanEdit ? (
										<Textarea
											id="diagnosis"
											value={formData.diagnosis}
											onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
											placeholder="Diagnóstico médico"
											rows={3}
										/>
									) : (
										<p className="text-sm bg-muted p-3 rounded-md">
											{formData.diagnosis || "No especificado"}
										</p>
									)}
								</div>

								{/* Tratamiento */}
								<div className="space-y-2">
									<Label htmlFor="treatment">Tratamiento</Label>
									{isEditingAndCanEdit ? (
										<Textarea
											id="treatment"
											value={formData.treatment}
											onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
											placeholder="Plan de tratamiento y medicamentos"
											rows={3}
										/>
									) : (
										<p className="text-sm bg-muted p-3 rounded-md">
											{formData.treatment || "No especificado"}
										</p>
									)}
								</div>

								{/* Notas adicionales */}
								<div className="space-y-2">
									<Label htmlFor="notes">Notas adicionales</Label>
									{isEditingAndCanEdit ? (
										<Textarea
											id="notes"
											value={formData.notes}
											onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
											placeholder="Notas adicionales del médico"
											rows={2}
										/>
									) : (
										<p className="text-sm bg-muted p-3 rounded-md">
											{formData.notes || "No hay notas adicionales"}
										</p>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
