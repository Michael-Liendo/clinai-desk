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
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
	companyId: string;
	onCreated?: (user: IUser) => void;
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
			first_name: "",
			last_name: "",
			email: "",
			password: "",
			role: "doctor" as TCompanyUserRole,
		},
		validationSchema: toFormikValidationSchema(UserForRegisterSchema),
		validateOnChange: false,
		validateOnBlur: false,
		onSubmit: async (vals) => {
			try {
				// Try to register a new user first
				const registerRes = await Services.auth.register({
					first_name: vals.first_name,
					last_name: vals.last_name,
					email: vals.email,
					password: vals.password,
				});
				const user = registerRes?.data?.user as IUser | undefined;
				if (!user) throw new Error("No se pudo crear el usuario");

				// Link to company with role
				await Services.users_companies.create({
					company_id: companyId,
					user_id: user.id,
					role: vals.role,
				});

				toast({ title: "Usuario agregado a la clínica" });
				onCreated?.(user);
				resetForm();
				setOpen(false);
			} catch (e: any) {
				console.error(e);
				const errCode = e?.errors?.[0]?.code as string | undefined;
				// If the email is already registered, fetch existing user and link to company
				if (errCode === "EMAIL_ALREADY_EXISTS") {
					try {
						const existing = await Services.users.getByEmail(vals.email);
						if (!existing)
							throw new Error("No se encontró el usuario existente");
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
					title: "Error al crear el usuario",
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
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Agregar usuario a la clínica</DialogTitle>
					<DialogDescription>
						Crea un usuario y asígnalo a esta clínica con un rol.
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
						label="Contraseña"
						name="password"
						type="password"
						placeholder="* * * * * * *"
						value={values.password}
						error={errors.password as string}
						onChange={handleChange}
						required
					/>

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
				</form>

				<DialogFooter>
					<Button form="create-company-user" type="submit">
						Crear usuario
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
