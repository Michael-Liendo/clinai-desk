import {
	type IUser,
	type TCompanyUserRole,
	UserForRegisterSchema,
} from "@clinai/shared";
import { useFormik } from "formik";
import { useEffect } from "react";
import { TextField } from "@/components/text-field";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/features/ui/useToast";
import Services from "@/services";
import { toFormikValidationSchema } from "@/utils/toFormikValidationSchema";

export function UserModalMutate({
	open,
	setOpen,
	companyId,
	onCreated,
	isEdit,
	user,
	onUpdated,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	companyId?: string; // optional when editing
	onCreated?: (user: IUser) => void;
	// edit mode
	isEdit?: boolean;
	user?: IUser;
	onUpdated?: (user: IUser) => void;
}) {
	const { toast } = useToast();

	const {
		values,
		errors,
		handleChange,
		handleSubmit,
		setFieldValue,
		resetForm,
	} = useFormik({
		initialValues: {
			first_name: isEdit ? (user?.first_name ?? "") : "",
			last_name: isEdit ? (user?.last_name ?? "") : "",
			email: isEdit ? (user?.email ?? "") : "",
			phone: isEdit ? ((user as any)?.phone ?? "") : "",
			password: "",
			role: "doctor" as TCompanyUserRole,
		},
		validationSchema: toFormikValidationSchema(UserForRegisterSchema),
		validateOnChange: false,
		validateOnBlur: false,
		enableReinitialize: true,
		onSubmit: async (vals) => {
			try {
				if (isEdit) {
					if (!user?.id) throw new Error("Usuario inválido");
					const ok = await Services.users.update({
						id: user.id,
						first_name: vals.first_name,
						last_name: vals.last_name,
						email: vals.email,
						phone: vals.phone || undefined,
						password: vals.password || undefined,
					} as any);
					if (!ok) throw new Error("No se pudo actualizar el usuario");
					toast({ title: "Perfil actualizado" });
					onUpdated?.({ ...(user as IUser), ...vals } as IUser);
					resetForm();
					setOpen(false);
					return;
				}

				// Create & link flow
				const registerRes = await Services.auth.register({
					first_name: vals.first_name,
					last_name: vals.last_name,
					email: vals.email,
					password: vals.password,
				});
				const created = registerRes?.data?.user as IUser | undefined;
				if (!created) throw new Error("No se pudo crear el usuario");

				if (!companyId)
					throw new Error("companyId requerido para crear usuario");

				await Services.users_companies.create({
					company_id: companyId,
					user_id: created.id,
					role: vals.role,
				});

				toast({ title: "Usuario agregado a la clínica" });
				onCreated?.(created);
				resetForm();
				setOpen(false);
			} catch (e: any) {
				console.error(e);
				const errCode = e?.errors?.[0]?.code as string | undefined;
				if (!isEdit && errCode === "EMAIL_ALREADY_EXISTS") {
					try {
						const existing = await Services.users.getByEmail(vals.email);
						if (!existing)
							throw new Error("No se encontró el usuario existente");
						if (!companyId)
							throw new Error("companyId requerido para vincular");
						await Services.users_companies.create({
							company_id: companyId,
							user_id: existing.id,
							role: vals.role,
						});
						toast({ title: "Usuario agregado a la clínica" });
						onCreated?.(existing);
						resetForm();
						setOpen(false);
						return;
					} catch (linkErr) {
						console.error(linkErr);
						toast({
							title: "No se pudo vincular el usuario existente",
							variant: "error",
						});
						return;
					}
				}

				const description =
					e?.errors?.[0]?.message || e?.message || "Error inesperado";
				toast({
					title: isEdit
						? "Error al actualizar el usuario"
						: "Error al crear el usuario",
					description,
					variant: "error",
				});
			}
		},
	});

	useEffect(() => {
		if (!open) {
			resetForm();
		}
	}, [open]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>
						{isEdit ? "Editar usuario" : "Agregar usuario a la clínica"}
					</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Actualiza la información del usuario."
							: "Crea un usuario y asígnalo a esta clínica con un rol."}
					</DialogDescription>
				</DialogHeader>

				<form
					id="create-company-user"
					className="space-y-4"
					onSubmit={handleSubmit}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<TextField
							label="Nombre"
							name="first_name"
							placeholder="Nombre"
							value={values.first_name}
							error={errors.first_name as string}
							onChange={handleChange}
							required
						/>
						<TextField
							label="Apellido"
							name="last_name"
							placeholder="Apellido"
							value={values.last_name}
							error={errors.last_name as string}
							onChange={handleChange}
							required
						/>
					</div>

					<TextField
						label="Correo"
						name="email"
						type="email"
						placeholder="correo@dominio.com"
						value={values.email}
						error={errors.email as string}
						onChange={handleChange}
						required
					/>

					<TextField
						label="Teléfono"
						name="phone"
						placeholder="Número de teléfono"
						value={(values as any).phone}
						onChange={handleChange}
					/>

					<TextField
						label={isEdit ? "Nueva contraseña" : "Contraseña"}
						name="password"
						type="password"
						placeholder={isEdit ? "••••••••" : "* * * * * * *"}
						value={values.password}
						error={errors.password as string}
						onChange={handleChange}
						required={!isEdit}
					/>

					{!isEdit && (
						<div className="space-y-1">
							<div className="text-sm font-medium">Rol</div>
							<Select
								value={values.role}
								onValueChange={(v) =>
									setFieldValue("role", v as TCompanyUserRole)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Selecciona un rol" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectLabel>Roles</SelectLabel>
										<SelectItem value="admin">Administrador</SelectItem>
										<SelectItem value="doctor">Médico</SelectItem>
										<SelectItem value="assistant">Asistente</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					)}
				</form>

				<DialogFooter>
					<Button form="create-company-user" type="submit">
						{isEdit ? "Guardar cambios" : "Crear usuario"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
