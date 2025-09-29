import { type IPatient, PatientForUpdateSchema } from "@clinai/shared";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useFormik } from "formik";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { TextField } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/features/ui/useToast";
import { cn } from "@/utils/cn";
import { toFormikValidationSchema } from "@/utils/toFormikValidationSchema";

interface EditPatientModalProps {
	patient: IPatient;
	isOpen: boolean;
	onClose: () => void;
	onSave: (updatedPatient: Partial<IPatient>) => Promise<void>;
	onUpdated?: (patient: IPatient) => void;
	focusSection?: "basic" | "contact" | "notes" | "medical";
}

export function EditPatientModal({
	patient,
	isOpen,
	onClose,
	onSave,
	onUpdated,
	focusSection = "basic",
}: EditPatientModalProps) {
	const { toast } = useToast();

	// Referencias para hacer focus en los campos
	const firstNameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);
	const notesRef = useRef<HTMLTextAreaElement>(null);
	const allergiesRef = useRef<HTMLTextAreaElement>(null);

	// Configuración de Formik
	const {
		values,
		errors,
		handleChange,
		handleSubmit,
		setFieldValue,
		resetForm,
		isSubmitting,
	} = useFormik({
		initialValues: {
			first_name: patient.first_name || "",
			last_name: patient.last_name || "",
			email: patient.email || "",
			phone: patient.phone || "",
			dni: patient.dni || "",
			address: patient.address || "",
			date_of_birth: patient.date_of_birth
				? new Date(patient.date_of_birth)
				: null,
			gender: patient.gender || "",
			occupation: patient.occupation || "",
			notes: patient.notes || "",
			emergency_contact: patient.emergency_contact,
			medical_info: patient.medical_info,
			parent: patient.parent,
			is_children: patient.is_children,
		},
		validationSchema: toFormikValidationSchema(PatientForUpdateSchema),
		enableReinitialize: true,
		onSubmit: async (vals) => {
			try {
				const updatedData = {
					...vals,
					date_of_birth: vals.date_of_birth
						? vals.date_of_birth.toISOString()
						: null,
				};

				await onSave(updatedData as Partial<IPatient>);
				toast({ title: "Paciente actualizado exitosamente" });
				onUpdated?.({ ...patient, ...vals } as IPatient);
				resetForm();
				onClose();
			} catch (error) {
				console.error("Error al actualizar paciente:", error);
				toast({
					title: "Error al actualizar",
					description: "No se pudo actualizar el paciente",
					variant: "error",
				});
			}
		},
	});

	// Efecto para hacer focus al campo correspondiente cuando se abre el modal
	useEffect(() => {
		if (isOpen) {
			// Pequeño delay para asegurar que el modal esté completamente renderizado
			const timer = setTimeout(() => {
				switch (focusSection) {
					case "basic":
						firstNameRef.current?.focus();
						break;
					case "contact":
						emailRef.current?.focus();
						break;
					case "notes":
						notesRef.current?.focus();
						break;
					case "medical":
						allergiesRef.current?.focus();
						break;
					default:
						firstNameRef.current?.focus();
				}
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [isOpen, focusSection]);

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Editar paciente</DialogTitle>
					<DialogDescription>
						Modifica la información del paciente. Los campos marcados con * son
						obligatorios.
					</DialogDescription>
				</DialogHeader>

				<form
					id="patient-form"
					onSubmit={handleSubmit}
					className="py-4 space-y-6"
				>
					{/* Información personal */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-primary">
							Información personal
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<TextField
								label="Nombre"
								ref={firstNameRef}
								id="first_name"
								name="first_name"
								error={errors.first_name}
								value={values.first_name}
								onChange={handleChange}
								placeholder="Nombre del paciente"
								required
							/>

							<TextField
								label="Apellido"
								id="last_name"
								name="last_name"
								value={values.last_name}
								onChange={handleChange}
								error={errors.last_name}
								placeholder="Apellido del paciente"
								required
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<TextField
								label="DNI"
								id="dni"
								name="dni"
								value={values.dni}
								onChange={handleChange}
								error={errors.dni}
								placeholder="Número de documento"
							/>
							<div>
								<Label htmlFor="gender">Género</Label>
								<Select
									value={values.gender}
									onValueChange={(value) => setFieldValue("gender", value)}
								>
									<SelectTrigger>
										<SelectValue placeholder="Seleccionar género" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="male">Masculino</SelectItem>
										<SelectItem value="female">Femenino</SelectItem>
										<SelectItem value="other">Otro</SelectItem>
									</SelectContent>
								</Select>
								{errors.gender && (
									<p className="text-sm text-destructive mt-1">
										{errors.gender}
									</p>
								)}
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<Label>Fecha de nacimiento</Label>
								<Popover>
									<PopoverTrigger asChild>
										<Button
											variant="outline"
											className={cn(
												"w-full justify-start text-left font-normal",
												!values.date_of_birth && "text-muted-foreground",
											)}
										>
											<CalendarIcon className="mr-2 h-4 w-4" />
											{values.date_of_birth ? (
												format(values.date_of_birth, "PPP", { locale: es })
											) : (
												<span>Seleccionar fecha</span>
											)}
										</Button>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0">
										<Calendar
											mode="single"
											selected={values.date_of_birth || undefined}
											onSelect={(date) =>
												setFieldValue("date_of_birth", date || null)
											}
											initialFocus
											locale={es}
										/>
									</PopoverContent>
								</Popover>
								{errors.date_of_birth && (
									<p className="text-sm text-destructive mt-1">
										{errors.date_of_birth}
									</p>
								)}
							</div>

							<TextField
								label="Ocupación"
								id="occupation"
								name="occupation"
								value={values.occupation}
								onChange={handleChange}
								placeholder="Ocupación del paciente"
								error={errors.occupation}
							/>
						</div>
					</div>

					{/* Información de contacto */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-green-700">
							Datos de contacto
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<TextField
								label="Email"
								ref={emailRef}
								id="email"
								name="email"
								type="email"
								value={values.email}
								onChange={handleChange}
								error={errors.email}
								placeholder="correo@ejemplo.com"
							/>
							<TextField
								label="Teléfono"
								id="phone"
								name="phone"
								value={values.phone}
								onChange={handleChange}
								error={errors.phone}
								placeholder="Número de teléfono"
							/>
						</div>

						<div>
							<Label htmlFor="address">Dirección</Label>
							<Textarea
								id="address"
								name="address"
								value={values.address}
								onChange={handleChange}
								placeholder="Dirección completa del paciente"
								rows={3}
							/>
							{errors.address && (
								<p className="text-sm text-destructive mt-1">
									{errors.address}
								</p>
							)}
						</div>
					</div>

					{/* Antecedentes médicos */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-orange-700">
							Antecedentes médicos
						</h3>
						<div className="space-y-4">
							<div>
								<Label htmlFor="allergies">Alergias</Label>
								<Textarea
									ref={allergiesRef}
									id="allergies"
									name="allergies"
									value={values.medical_info?.allergies ?? ""}
									onChange={(e) =>
										setFieldValue("medical_info.allergies", e.target.value)
									}
									placeholder="Alergias conocidas del paciente..."
									rows={2}
									className="resize-none"
								/>
								{errors.medical_info && (
									<p className="text-sm text-destructive mt-1">
										{errors.medical_info}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="diseases">Enfermedades</Label>
								<Textarea
									id="diseases"
									name="diseases"
									value={values.medical_info?.medical_history ?? ""}
									onChange={(e) =>
										setFieldValue(
											"medical_info.medical_history",
											e.target.value,
										)
									}
									placeholder="Enfermedades o condiciones médicas..."
									rows={2}
									className="resize-none"
								/>
								{errors.medical_info && (
									<p className="text-sm text-destructive mt-1">
										{errors.medical_info}
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="surgeries">Cirugías</Label>
								<Textarea
									id="surgeries"
									name="surgeries"
									value={values.medical_info?.surgeries_history ?? ""}
									onChange={(e) =>
										setFieldValue(
											"medical_info.surgeries_history",
											e.target.value,
										)
									}
									placeholder="Cirugías o procedimientos realizados..."
									rows={2}
									className="resize-none"
								/>
								{errors.medical_info && (
									<p className="text-sm text-destructive mt-1">
										{errors.medical_info}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Notas médicas */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-purple-700">
							Notas médicas
						</h3>
						<div>
							<Label htmlFor="notes">Notas confidenciales</Label>
							<Textarea
								ref={notesRef}
								id="notes"
								name="notes"
								value={values.notes ?? ""}
								onChange={(e) => setFieldValue("notes", e.target.value)}
								placeholder="Notas médicas del paciente..."
								rows={4}
								className="resize-none"
							/>
							{errors.notes && (
								<p className="text-sm text-destructive mt-1">{errors.notes}</p>
							)}
							<p className="text-xs text-muted-foreground mt-2">
								🔒 Esta información es confidencial y solo visible para el
								médico
							</p>
						</div>
					</div>
				</form>

				<DialogFooter>
					<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
						Cancelar
					</Button>
					<Button type="submit" form="patient-form" disabled={isSubmitting}>
						{isSubmitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Guardando...
							</>
						) : (
							"Guardar cambios"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
