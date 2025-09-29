import type { IPatient } from "@clinai/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EditPatientModal } from "@/components/entity/patient/edit-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InfoCard, InfoItem } from "@/components/ui/info-card";
import { useCompanyContext } from "@/context/CompanyContext";
import Services from "@/services";
import { useAuth } from "@/features/auth";

// Función para traducir géneros
function translateGender(gender: string | null | undefined): string {
	if (!gender) return "-";

	const translations: Record<string, string> = {
		male: "Masculino",
		female: "Femenino",
		other: "Otro",
	};

	return translations[gender] || gender;
}

// Función para calcular la edad
function calculateAge(
	dateOfBirth: string | Date | null | undefined,
): number | null {
	if (!dateOfBirth) return null;

	const birthDate = new Date(dateOfBirth);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < birthDate.getDate())
	) {
		age--;
	}

	return age >= 0 ? age : null;
}

// Función para obtener las iniciales del nombre
function getInitials(
	firstName: string | null | undefined,
	lastName: string | null | undefined,
): string {
	const first = firstName?.charAt(0)?.toUpperCase() || "";
	const last = lastName?.charAt(0)?.toUpperCase() || "";
	return first + last || "?";
}

export default function PatientDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const { activeCompany } = useCompanyContext();
	const { user } = useAuth();
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	// Estado para el modal de edición
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [focusSection, setFocusSection] = useState<
		"basic" | "contact" | "notes" | "medical"
	>("basic");

	// Función para abrir el modal con focus en una sección específica
	const openEditModal = (
		section: "basic" | "contact" | "notes" | "medical",
	) => {
		setFocusSection(section);
		setIsEditModalOpen(true);
	};

	// Función para guardar los cambios del paciente
	const handleSavePatient = async (updatedData: Partial<IPatient>) => {
		if (!id) return;

		try {
			await Services.patients.update(id, updatedData);
			queryClient.invalidateQueries({ queryKey: ["patient", id] });
		} catch (error) {
			console.error("Error al actualizar paciente:", error);
			throw error;
		}
	};

	// Función para crear una nueva consulta
	const handleCreateConsultation = async () => {
		if (!id || !activeCompany?.id || !data?.patient || !user?.id) return;

		// Verificar si ya hay una consulta abierta
		if (hasOpenConsultation) {
			console.warn("Ya existe una consulta abierta para este paciente");
			return;
		}

		try {
			// Crear la consulta con datos básicos
			const newConsultation = await Services.consultations.create({
				patient_id: id,
				user_id: user?.id,
				company_id: activeCompany.id,
				reason_for_consultation: "", // Se completará en la página de consulta
				consultation_date: new Date(),
				status: "open" as const,
			});

			// Invalidar las consultas para refrescar la lista
			queryClient.invalidateQueries({
				queryKey: ["patient-consultations", id, activeCompany.id],
			});

			// Navegar a la página de la consulta creada
			navigate(`/consultations/${newConsultation.id}`);
		} catch (error) {
			console.error("Error al crear consulta:", error);
			// Aquí podrías mostrar un toast o mensaje de error
		}
	};

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

	// Fetch de las consultas del paciente
	const { data: consultationsData, isLoading: isLoadingConsultations } =
		useQuery({
			queryKey: ["patient-consultations", id, activeCompany?.id],
			queryFn: async () => {
				if (!id || !activeCompany?.id) return { data: [], count: 0 };
				return await Services.consultations.getByPatient(activeCompany.id, id, {
					page: 1,
					limit: 10,
				});
			},
			enabled: !!id && !!activeCompany?.id,
		});

	// Verificar si hay consultas abiertas
	const hasOpenConsultation =
		consultationsData?.data?.some(
			(consultation) => consultation.status === "open",
		) || false;

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
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
			{isLoading ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center space-y-2">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
						<p className="text-muted-foreground">
							Cargando información del paciente...
						</p>
					</div>
				</div>
			) : error ? (
				<div className="flex items-center justify-center min-h-[400px]">
					<div className="text-center space-y-2">
						<p className="text-destructive font-medium">
							Error al cargar el paciente
						</p>
						<p className="text-sm text-muted-foreground">
							Por favor, intenta nuevamente
						</p>
					</div>
				</div>
			) : data?.patient ? (
				<>
					{/* Header del paciente con avatar, nombre y edad */}
					<div>
						<div className="max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex items-center gap-6 py-6">
								<Avatar className="h-20 w-20 ring-4 ring-primary/10">
									<AvatarImage
										src=""
										alt={`${data.patient.first_name} ${data.patient.last_name}`}
									/>
									<AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
										{getInitials(
											data.patient.first_name,
											data.patient.last_name,
										)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1 min-w-0">
									<h1 className="text-3xl font-bold text-gray-900 truncate">
										{data.patient.first_name} {data.patient.last_name}
									</h1>
									<div className="flex items-center gap-4 mt-2">
										<p className="text-lg text-muted-foreground">
											{calculateAge(data.patient.date_of_birth)
												? `${calculateAge(data.patient.date_of_birth)} años`
												: "Edad no disponible"}
										</p>
										<div className="h-4 w-px bg-border" />
										<p className="text-sm text-muted-foreground">
											{translateGender(data.patient.gender)}
										</p>
										{data.patient.dni && (
											<>
												<div className="h-4 w-px bg-border" />
												<p className="text-sm text-muted-foreground">
													DNI: {data.patient.dni}
												</p>
											</>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Contenido principal */}
					<div className="max-w-10/12 mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Columna 1: Información Básica y Antecedentes */}
							<div className="space-y-6">
								{/* Información Básica */}
								<InfoCard
									title="Información Básica"
									headerColor="primary"
									onEdit={() => openEditModal("basic")}
								>
									<div className="space-y-5">
										<InfoItem
											label="Edad"
											value={
												calculateAge(data.patient.date_of_birth)
													? `${calculateAge(data.patient.date_of_birth)} años`
													: "-"
											}
										/>
										{data.patient.dni && (
											<InfoItem label="DNI" value={data.patient.dni} />
										)}
										<InfoItem
											label="Sexo"
											value={translateGender(data.patient.gender)}
										/>
										<InfoItem
											label="Ocupación"
											value={
												<span className="text-right block">
													{data.patient.occupation || "No especificada"}
												</span>
											}
											isLast
										/>
									</div>
								</InfoCard>

								{/* Antecedentes */}
								<InfoCard
									title="Antecedentes"
									headerColor="orange"
									onEdit={() => openEditModal("medical")}
								>
									<div className="space-y-5">
										<InfoItem
											label="Alergias"
											value={data.patient.medical_info?.allergies || "-"}
											valueColor="text-green-600"
										/>
										<InfoItem
											label="Enfermedades"
											value={data.patient.medical_info?.medical_history || "-"}
										/>
										<InfoItem
											label="Cirugías"
											value={
												data.patient.medical_info?.surgeries_history || "-"
											}
											valueColor="text-green-600"
											isLast
										/>
									</div>
								</InfoCard>
							</div>

							{/* Columna 2: Consultas y Registros */}
							<div className="space-y-6">
								{/* Consultas recientes */}
								<InfoCard
									title="Consultas recientes"
									headerColor="blue"
									badge={
										consultationsData?.data &&
										consultationsData.data.length > 0 ? (
											<Badge
												variant="secondary"
												className="bg-blue-100 text-blue-700 hover:bg-blue-200"
											>
												{consultationsData.data.length} consulta
												{consultationsData.data.length !== 1 ? "s" : ""}
											</Badge>
										) : null
									}
								>
									{isLoadingConsultations ? (
										<div className="text-center py-8">
											<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2" />
											<p className="text-sm text-muted-foreground">
												Cargando consultas...
											</p>
										</div>
									) : consultationsData?.data &&
										consultationsData.data.length > 0 ? (
										<div className="space-y-3">
											{consultationsData.data
												.slice(0, 3)
												.map((consultation) => (
													<button
														key={consultation.id}
														type="button"
														className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors w-full text-left"
														onClick={() =>
															navigate(`/consultations/${consultation.id}`)
														}
													>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1">
																<Badge
																	variant={
																		consultation.status === "open"
																			? "default"
																			: "secondary"
																	}
																	className={
																		consultation.status === "open"
																			? "bg-green-100 text-green-700 text-xs"
																			: "bg-gray-100 text-gray-700 text-xs"
																	}
																>
																	{consultation.status === "open"
																		? "Abierta"
																		: "Cerrada"}
																</Badge>
																<span className="text-xs text-muted-foreground">
																	{new Date(
																		consultation.consultation_date,
																	).toLocaleDateString("es-ES")}
																</span>
															</div>
															<p className="text-sm font-medium truncate">
																{consultation.reason_for_consultation ||
																	"Sin motivo especificado"}
															</p>
															{consultation.diagnosis && (
																<p className="text-xs text-muted-foreground truncate">
																	{consultation.diagnosis}
																</p>
															)}
														</div>
														<div className="ml-2">
															<svg
																className="w-4 h-4 text-muted-foreground"
																fill="none"
																stroke="currentColor"
																viewBox="0 0 24 24"
															>
																<title>Ver consulta</title>
																<path
																	strokeLinecap="round"
																	strokeLinejoin="round"
																	strokeWidth={2}
																	d="M9 5l7 7-7 7"
																/>
															</svg>
														</div>
													</button>
												))}

											{/* Botón para crear nueva consulta */}
											<div className="pt-2 border-t">
												{hasOpenConsultation ? (
													<div className="text-center py-2">
														<p className="text-sm text-muted-foreground mb-2">
															Ya tienes una consulta abierta
														</p>
														<Button
															variant="outline"
															size="sm"
															disabled
															className="opacity-50 cursor-not-allowed"
														>
															Consulta en progreso
														</Button>
													</div>
												) : (
													<Button
														variant="outline"
														size="sm"
														className="w-full text-primary border-primary hover:bg-primary hover:text-white"
														onClick={handleCreateConsultation}
													>
														+ Nueva consulta
													</Button>
												)}
											</div>
										</div>
									) : (
										<div className="text-center py-8">
											<div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
												<svg
													className="w-8 h-8 text-muted-foreground"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<title>Icono de consultas</title>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
													/>
												</svg>
											</div>
											<p className="text-sm text-muted-foreground mb-4">
												No hay consultas registradas
											</p>
											<Button
												variant="outline"
												size="sm"
												className="text-primary border-primary hover:bg-primary hover:text-white"
												onClick={handleCreateConsultation}
											>
												Iniciar consulta
											</Button>
										</div>
									)}
								</InfoCard>
							</div>

							{/* Columna 3: Datos de contacto y Notas */}
							<div className="space-y-6">
								{/* Datos de contacto */}
								<InfoCard
									title="Datos de contacto"
									headerColor="green"
									onEdit={() => openEditModal("contact")}
								>
									<div className="space-y-4">
										<InfoItem
											label="Celular"
											value={data.patient.phone || "-"}
											valueColor="text-green-600"
										/>
										<InfoItem
											label="Email"
											value={
												<span className="text-green-600 truncate max-w-[150px] block text-right">
													{data.patient.email || "-"}
												</span>
											}
										/>
										<InfoItem
											label="Nacimiento"
											value={
												data.patient.date_of_birth
													? new Date(
															data.patient.date_of_birth,
														).toLocaleDateString("es-ES")
													: "-"
											}
										/>
										<InfoItem
											label="Dirección"
											value={
												<span className="text-right max-w-[150px] block">
													{data.patient.address || "No especificada"}
												</span>
											}
											isLast
										/>
									</div>
								</InfoCard>

								{/* Notas */}
								<InfoCard
									title="Notas médicas"
									headerColor="purple"
									className="pt-0"
									onEdit={() => openEditModal("notes")}
								>
									<div className="min-h-32 p-4 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
										<p className="text-sm text-muted-foreground whitespace-pre-wrap">
											{data.patient.notes ||
												"No hay notas disponibles. Haz clic para agregar..."}
										</p>
									</div>
									<div className="flex items-center justify-between mt-4">
										<p className="text-xs text-muted-foreground">
											🔒 Solo visible para el médico
										</p>
									</div>
								</InfoCard>
							</div>
						</div>
					</div>
				</>
			) : (
				<p>No se encontró el paciente.</p>
			)}

			{/* Modal de edición */}
			{data?.patient && (
				<EditPatientModal
					patient={data.patient}
					isOpen={isEditModalOpen}
					onClose={() => setIsEditModalOpen(false)}
					onSave={handleSavePatient}
					focusSection={focusSection}
				/>
			)}
		</div>
	);
}
