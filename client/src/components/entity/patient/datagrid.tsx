import { DataTableColumnHeader } from "@/components/table/header";
import { Button } from "@/components/ui/button";
import { PrivateRoutesEnum } from "@/data/routesEnums";
import { Link } from "react-router-dom";
import type { IPatient } from "@clinai/shared";
import type { ColumnDef } from "@tanstack/react-table";

export const PatientsDatagrid: ColumnDef<IPatient>[] = [
	{
		accessorKey: "first_name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Nombre" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate font-medium">
					{row?.getValue("first_name")}
				</span>
			</div>
		),
	},
	{
		accessorKey: "last_name",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Apellido" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate font-medium">
					{row?.getValue("last_name")}
				</span>
			</div>
		),
	},
	{
		accessorKey: "dni",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="DNI" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate font-medium">
					{row?.getValue("dni") ?? "-"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "email",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Email" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate font-medium">
					{row?.getValue("email") ?? "-"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "phone",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Teléfono" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate font-medium">
					{row?.getValue("phone") ?? "-"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Fecha de creación" />
		),
		cell: ({ row }) => {
			const value = row.getValue("created_at") as Date | string | undefined;
			const date = value ? new Date(value) : undefined;
			return (
				<div className="flex space-x-2">
					<span className="truncate font-medium">
						{date
							? date.toLocaleDateString("es-ES", {
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
							})
							: "-"}
					</span>
				</div>
			);
		},
	},
	{
		id: "actions",
		header: () => null,
		cell: ({ row }) => {
			const id = row.original.id;
			return (
				<div className="flex justify-end">
					<Link to={PrivateRoutesEnum.PatientDetails.replace(":id", id)}>
						<Button size="sm" variant="outline">Ver</Button>
					</Link>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
