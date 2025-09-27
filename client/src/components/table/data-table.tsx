import type { IPaginationResponse } from "@clinai/shared";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type ColumnMeta,
	type ExpandedState,
	flexRender,
	getCoreRowModel,
	getFacetedRowModel,
	getFacetedUniqueValues,
	getFilteredRowModel,
	getGroupedRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type Row,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "../ui/table";
import { DataTablePagination } from "./DataTablePagination";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[] | undefined;
	loading?: boolean;
	pagination?: IPaginationResponse;
	grouping?: string[];
	onPageChange?: (pageIndex: number) => void;
	renderExpandedRow?: (rowData: TData) => React.ReactNode;
	onRowClick?: (rowData: TData) => void;
	renderGroupedRow?: (row: Row<TData>) => React.ReactNode;
	defaultExpandedKey?: string;
}

interface ExtendedColumnMeta<TData, TValue> extends ColumnMeta<TData, TValue> {
	isHidden?: boolean;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading,
	pagination,
	grouping,
	defaultExpandedKey,
	onPageChange,
	renderExpandedRow,
	onRowClick,
	renderGroupedRow,
}: DataTableProps<TData, TValue>) {
	const [tableExpanded, setTableExpanded] = useState<ExpandedState>({});
	const [hasSetInitialExpansion, setHasSetInitialExpansion] = useState(false);

	useEffect(() => {
		if (!hasSetInitialExpansion && defaultExpandedKey) {
			setTableExpanded({ [defaultExpandedKey]: true });
			setHasSetInitialExpansion(true);
		}
	}, [defaultExpandedKey, hasSetInitialExpansion]);

	const toggleRowExpansion = (id: string | number) => {
		setTableExpanded((old) => {
			if (!old || typeof old !== "object") return { [id]: true };

			const isExpanded = !!old[id];
			const newExpanded = { ...old };

			if (isExpanded) {
				delete newExpanded[id];
			} else {
				newExpanded[id] = true;
			}

			return newExpanded;
		});
	};

	const initialHiddenColumns = useMemo(() => {
		const hidden: VisibilityState = {};
		for (const value of columns) {
			const col = value as ColumnDef<TData, TValue> & {
				meta: ExtendedColumnMeta<TData, TValue>;
			};
			if (col.meta?.isHidden && col.id) {
				hidden[col.id] = false;
			}
		}
		return hidden;
	}, [columns]);

	const [rowSelection, setRowSelection] = useState({});
	const [columnVisibility, setColumnVisibility] =
		useState<VisibilityState>(initialHiddenColumns);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data: data ?? [],
		columns,
		pageCount: pagination ? Math.ceil(pagination.total / pagination.limit) : 0,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			grouping,
			columnFilters,
			pagination: {
				pageIndex: pagination?.page ?? 0,
				pageSize: pagination?.limit ?? 10,
			},
			expanded: tableExpanded,
		},
		onExpandedChange: setTableExpanded,
		manualPagination: true,
		autoResetExpanded: false,
		onRowSelectionChange: setRowSelection,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFacetedRowModel: getFacetedRowModel(),
		getFacetedUniqueValues: getFacetedUniqueValues(),
		getGroupedRowModel: grouping?.length ? getGroupedRowModel() : undefined,
		onPaginationChange: (newPagination) => {
			if (pagination) {
				if (typeof newPagination === "function") {
					onPageChange?.(
						newPagination({
							pageIndex: pagination.page,
							pageSize: pagination.limit,
						}).pageIndex,
					);
				} else {
					onPageChange?.(newPagination.pageIndex);
				}
			}
		},
	});

	return (
		<div className="space-y-4 w-full">
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} colSpan={header.colSpan}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell
									colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
									className="h-24 text-center"
								>
									Cargando...
								</TableCell>
							</TableRow>
						) : table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row, index) => {
								const isGrouped = row.getIsGrouped();
								const isExpanded = !!row.getIsExpanded();

								if (isGrouped) {
									return (
										<React.Fragment key={row.id}>
											{/* Fila grupo */}
											<TableRow
												className="cursor-pointer bg-gray-200"
												onClick={() => toggleRowExpansion(row.id)}
											>
												<TableCell
													colSpan={columns.length + (renderGroupedRow ? 1 : 0)}
												>
													<div className="flex items-center justify-between">
														{renderGroupedRow ? (
															renderGroupedRow(row)
														) : (
															<strong>
																{row.id} ({row.subRows.length})
															</strong>
														)}
														{isExpanded ? (
															<ChevronUp size={16} />
														) : (
															<ChevronDown size={16} />
														)}
													</div>
												</TableCell>
											</TableRow>

											{/* Filas hijas con botón de expansión */}
											{isExpanded &&
												row.subRows.map((subRow, index) => {
													const isSubRowExpanded = !!subRow.getIsExpanded();

													return (
														<React.Fragment key={subRow.id}>
															<TableRow
																data-state={
																	subRow.getIsSelected() && "selected"
																}
																className={
																	index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"
																}
																onClick={() => onRowClick?.(subRow.original)}
															>
																{subRow.getVisibleCells().map((cell) => (
																	<TableCell key={cell.id}>
																		{flexRender(
																			cell.column.columnDef.cell,
																			cell.getContext(),
																		)}
																	</TableCell>
																))}

																{renderExpandedRow && (
																	<TableCell>
																		<button
																			type="button"
																			className="cursor-pointer flex justify-around items-center"
																			onClick={(e) => {
																				e.stopPropagation();
																				toggleRowExpansion(subRow.id);
																			}}
																		>
																			{isSubRowExpanded ? (
																				<ChevronUp size={16} />
																			) : (
																				<ChevronDown size={16} />
																			)}
																		</button>
																	</TableCell>
																)}
															</TableRow>

															{isSubRowExpanded && renderExpandedRow && (
																<TableRow>
																	<TableCell colSpan={columns.length + 1}>
																		{renderExpandedRow(subRow.original)}
																	</TableCell>
																</TableRow>
															)}
														</React.Fragment>
													);
												})}
										</React.Fragment>
									);
								}

								return [
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										onClick={() => onRowClick?.(row.original)}
										className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
									>
										{row.getVisibleCells().map((cell) => (
											<TableCell key={cell.id}>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext(),
												)}
											</TableCell>
										))}
										{renderExpandedRow && (
											<TableCell>
												<button
													type="button"
													className="cursor-pointer flex justify-around items-center"
													onClick={(e) => {
														e.stopPropagation();
														toggleRowExpansion(row.id);
													}}
												>
													{isExpanded ? (
														<ChevronUp size={16} />
													) : (
														<ChevronDown size={16} />
													)}
												</button>
											</TableCell>
										)}
									</TableRow>,
									isExpanded && renderExpandedRow && (
										<TableRow key={`${row.id}-expanded`}>
											<TableCell colSpan={columns.length + 1}>
												{renderExpandedRow(row.original)}
											</TableCell>
										</TableRow>
									),
								];
							})
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length + (renderExpandedRow ? 1 : 0)}
									className="h-24 text-center"
								>
									Sin resultados.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{pagination && <DataTablePagination table={table} />}
		</div>
	);
}
