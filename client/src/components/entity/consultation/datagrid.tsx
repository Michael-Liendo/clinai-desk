import type { IConsultation } from "@clinai/shared";
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { DataTableColumnHeader } from "@/components/table/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrivateRoutesEnum } from "@/data/routesEnums";

export const ConsultationsDatagrid: ColumnDef<IConsultation>[] = [
	{
		accessorKey: "consultation_date",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Fecha" />
		),
		cell: ({ row }) => {
			const value = row.getValue("consultation_date") as Date | string | undefined;
			const date = value ? new Date(value) : undefined;
			return (
				<div className="flex space-x-2">
					<span className="truncate font-medium">
						{date
							? date.toLocaleDateString("es-ES", {
									month: "2-digit",
									day: "2-digit",
									year: "numeric",
									hour: "2-digit",
									minute: "2-digit",
								})
							: "-"}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "patient_id",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Paciente" />
		),
		cell: ({ row }) => {
			const patientId = row.getValue("patient_id") as string;
			return (
				<div className="flex space-x-2">
					<span className="truncate font-medium">
						{patientId ? `Paciente ${patientId.slice(0, 8)}...` : "Sin paciente"}
					</span>
				</div>
			);
		},
	},
	{
		accessorKey: "reason_for_consultation",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Motivo" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate max-w-[200px]">
					{row?.getValue("reason_for_consultation") || "Sin especificar"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "status",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Estado" />
		),
		cell: ({ row }) => {
			const status = row.getValue("status") as "open" | "closed";
			return (
				<Badge
					variant={status === "open" ? "default" : "secondary"}
					className={
						status === "open"
							? "bg-green-100 text-green-700"
							: "bg-gray-100 text-gray-700"
					}
				>
					{status === "open" ? "Abierta" : "Cerrada"}
				</Badge>
			);
		},
	},
	{
		accessorKey: "diagnosis",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Diagnóstico" />
		),
		cell: ({ row }) => (
			<div className="flex space-x-2">
				<span className="truncate max-w-[200px]">
					{row?.getValue("diagnosis") || "Sin diagnóstico"}
				</span>
			</div>
		),
	},
	{
		accessorKey: "created_at",
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Creada" />
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
					<Link to={PrivateRoutesEnum.ConsultationDetails.replace(":id", id)}>
						<Button size="sm" variant="outline">
							Ver
						</Button>
					</Link>
				</div>
			);
		},
		enableSorting: false,
		enableHiding: false,
	},
];
