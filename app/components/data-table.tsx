import { flexRender, TableOptions, useReactTable } from "@tanstack/react-table";
import { ColumnDef, getCoreRowModel } from "@tanstack/table-core";

import { Table, TableRow, TableBody, TableCell, TableHead, TableHeader } from "~/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  data,
  columns,
  options,
  withHeather = false,
}: DataTableProps<TData, TValue> & {
  withHeather?: boolean;
  options?: Omit<TableOptions<TData>, "data" | "columns" | "getCoreRowModel">;
}) {
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), ...options });

  return (
    <div className="rounded-md border">
      <Table>
        {withHeather ? (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        ) : null}
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : null}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
