import React, { useState, useRef } from "react";
import { TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

export function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
    const [selectedRow, setSelectedRow] = useState<string | null>(null);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const [resizingColumnId, setResizingColumnId] = useState<string | null>(null);
    const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});

    const tableRef = useRef<HTMLTableElement>(null);

    const handleRowSelection = (rowId: string) => {
        setSelectedRow(rowId === selectedRow ? null : rowId);
    };

    const handleMouseDown = (columnId: string) => {
        setResizingColumnId(columnId);
    };

    const handleMouseUp = () => {
        setResizingColumnId(null);
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLTableElement>) => {
        if (resizingColumnId && tableRef.current) {
            const newColumnWidths = { ...columnWidths };
            const rect = tableRef.current.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            newColumnWidths[resizingColumnId] = offsetX;
            setColumnWidths(newColumnWidths);
        }
    };

    return (
        <div style={{ overflowX: "auto" }}>
            <div
                className="rounded-md border"
                style={{ overflowY: "auto", maxHeight: "400px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                <table ref={tableRef}>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <input type="checkbox" />
                            </TableCell>
                            {table.getHeaderGroups().map((headerGroup) =>
                                headerGroup.headers.map((header) => (
                                    <TableCell
                                        key={header.id}
                                        colSpan={header.colSpan}
                                        style={{ width: columnWidths[header.id] }}
                                    >
                                        <div
                                            style={{ overflow: "hidden", textOverflow: "ellipsis" }}
                                            onMouseDown={() => handleMouseDown(header.id)}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef.header,
                                                      header.getContext()
                                                  )}
                                        </div>
                                    </TableCell>
                                ))
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.id === selectedRow ? "selected" : ""}
                                >
                                    <TableCell>
                                        <input
                                            type="checkbox"
                                            checked={row.id === selectedRow}
                                            onChange={() => handleRowSelection(row.id)}
                                        />
                                    </TableCell>
                                    {row.getVisibleCells().map((cell, index) => (
                                        <TableCell
                                            key={cell.id}
                                            style={{ width: columnWidths[cell.column.id] }}
                                        >
                                            <div style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}




