import React, { useState, useMemo} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function PlansTable({
  plans = [],
  onInputChange,
  onAddRow,
  onRemoveRows,
  selectedRows = [],
  setSelectedRows,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("SheetNumber");
  const [sortDirection, setSortDirection] = useState("asc");
  const [disciplineFilter, setDisciplineFilter] = useState("");
  const itemsPerPage = 10;

  const uniqueDisciplines = useMemo(
    () => Array.from(new Set(plans.map((p) => p.Discipline || "Unassigned"))),
    [plans]
  );

  // 1) Filtrado
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return plans.filter((p) => {
      const matchText =
        !term ||
        p.SheetName.toLowerCase().includes(term) ||
        p.SheetNumber.toLowerCase().includes(term) ||
        (p.Discipline || "").toLowerCase().includes(term) ||
        String(p.Revision).toLowerCase().includes(term) ||
        String(p.lastModifiedTime).toLowerCase().includes(term) ||
        (p.revisionProcess || "").toLowerCase().includes(term) ||
        (p.revisionStatus || "").toLowerCase().includes(term);
      const matchDisc = !disciplineFilter || p.Discipline === disciplineFilter;
      return matchText && matchDisc;
    });
  }, [plans, searchTerm, disciplineFilter]);

  // 2) Ordenamiento
  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortField) return arr;
    return arr.sort((a, b) => {
      let aVal = a[sortField] ?? "";
      let bVal = b[sortField] ?? "";
      // numérico para Revision
      if (sortField === "Revision") {
        aVal = parseInt(aVal, 10) || 0;
        bVal = parseInt(bVal, 10) || 0;
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      // fecha para lastModifiedTime
      if (sortField === "lastModifiedTime") {
        aVal = new Date(aVal).getTime() || 0;
        bVal = new Date(bVal).getTime() || 0;
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      // string compare
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortField, sortDirection]);

  // 3) Paginación
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage]);

  // 4) Placeholder para filas vacías
  const padded = useMemo(() => {
    const fill = itemsPerPage - paginated.length;
    return fill > 0
      ? [
          ...paginated,
          ...Array.from({ length: fill }, (_, i) => ({
            id: `empty-${currentPage}-${i}`,
            isPlaceholder: true,
          })),
        ]
      : paginated;
  }, [paginated, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));

  // Helpers de control
  const sortIndicator = (field) =>
    field === sortField ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  const handleSort = (field) => {
    const dir = field === sortField && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(dir);
    setCurrentPage(1);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-xl font-bold">Plans List</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
              <Input
                className="pl-8"
                placeholder="Search…"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Button onClick={() => {
                setSearchTerm("");
                setDisciplineFilter("");
                setSortField("SheetNumber");
                setSortDirection("asc");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  {disciplineFilter ? `Disc: ${disciplineFilter}` : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={() => {
                    setDisciplineFilter("");
                    setCurrentPage(1);
                  }}
                >
                  All Disciplines
                </DropdownMenuItem>
                {uniqueDisciplines.map((d) => (
                  <DropdownMenuItem
                    key={d}
                    onSelect={() => {
                      setDisciplineFilter(d);
                      setCurrentPage(1);
                    }}
                  >
                    {d}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={onAddRow}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onRemoveRows(selectedRows)}
              disabled={!selectedRows.length}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove ({selectedRows.length})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* 1. select all */}
                <TableHead className="p-2">
                  <Checkbox
                    checked={
                      paginated.length > 0 &&
                      paginated
                        .map((p) => p.id)
                        .filter((id) => !String(id).startsWith("empty-"))
                        .every((id) => selectedRows.includes(id))
                    }
                    onCheckedChange={(chk) =>
                      setSelectedRows(
                        chk
                          ? paginated
                              .map((p) => p.id)
                              .filter((id) => !String(id).startsWith("empty-"))
                          : []
                      )
                    }
                  />
                </TableHead>

                {/* 2. Discipline */}
                <TableHead
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("Discipline")}
                >
                  Discipline{sortIndicator("Discipline")}
                </TableHead>

                {/* 3. Sheet Name */}
                <TableHead
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("SheetName")}
                >
                  Sheet Name{sortIndicator("SheetName")}
                </TableHead>

                {/* 4. Sheet Number */}
                <TableHead
                  className="p-2 cursor-pointer"
                  onClick={() => handleSort("SheetNumber")}
                >
                  Sheet Number{sortIndicator("SheetNumber")}
                </TableHead>

                {/* 5. En carpeta */}
                <TableHead className="p-2 text-center">
                  In Folder
                </TableHead>

                {/* 6. Revision */}
                <TableHead
                  className="p-2 text-right cursor-pointer"
                  onClick={() => handleSort("Revision")}
                >
                  Revision{sortIndicator("Revision")}
                </TableHead>

                {/* 7. Last Modification Date */}
                <TableHead
                  className="p-2 text-right cursor-pointer"
                  onClick={() => handleSort("lastModifiedTime")}
                >
                  Last Mod. Date{sortIndicator("lastModifiedTime")}
                </TableHead>

                {/* 8. Revision Process */}
                <TableHead
                  className="p-2 text-center cursor-pointer"
                  onClick={() => handleSort("revisionProcess")}
                >
                  Process{sortIndicator("revisionProcess")}
                </TableHead>

                {/* 9. Revision Status */}
                <TableHead
                  className="p-2 text-center cursor-pointer"
                  onClick={() => handleSort("revisionStatus")}
                >
                  Status{sortIndicator("revisionStatus")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sorted.length === 0 && (searchTerm || disciplineFilter) ? (
                <TableRow>
                  <TableCell colSpan={9} className="p-8 text-center">
                    No plans found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                padded.map((plan) =>
                  plan.isPlaceholder ? (
                    <TableRow key={plan.id} className="h-9">
                      <TableCell colSpan={9} className="bg-gray-50" />
                    </TableRow>
                  ) : (
                    <TableRow key={plan.id} className="hover:bg-gray-50">
                      {/* 1 */}
                      <TableCell className="p-2">
                        <Checkbox
                          checked={selectedRows.includes(plan.id)}
                          onCheckedChange={(chk) =>
                            setSelectedRows((prev) =>
                              chk
                                ? [...prev, plan.id]
                                : prev.filter((x) => x !== plan.id)
                            )
                          }
                        />
                      </TableCell>

                      {/* 2 Discipline */}
                      <TableCell className="p-2">
                        <Input
                          className="border-none focus:ring-0 bg-transparent"
                          value={plan.Discipline}
                          onChange={(e) =>
                            onInputChange(plan.id, "Discipline", e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 3 SheetName */}
                      <TableCell className="p-2">
                        <Input
                          className="border-none focus:ring-0 bg-transparent"
                          value={plan.SheetName}
                          onChange={(e) =>
                            onInputChange(plan.id, "SheetName", e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 4 SheetNumber */}
                      <TableCell className="p-2">
                        <Input
                          className="border-none focus:ring-0 bg-transparent"
                          value={plan.SheetNumber}
                          onChange={(e) =>
                            onInputChange(plan.id, "SheetNumber", e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 5 exists */}
                      <TableCell className="p-2 text-center">
                        {plan.exists ? (
                          <span className="text-green-600">✔︎</span>
                        ) : (
                          <span className="text-red-500">✖︎</span>
                        )}
                      </TableCell>

                      {/* 6 Revision */}
                      <TableCell className="p-2 text-right">
                        <Input
                          type="text"
                          className="border-none focus:ring-0 bg-transparent text-right"
                          value={plan.Revision}
                          onChange={(e) =>
                            onInputChange(plan.id, "Revision", e.target.value)
                          }
                        />
                      </TableCell>

                      {/* 7 lastModifiedTime */}
                      <TableCell className="p-2 text-right">
                        {plan.lastModifiedTime}
                      </TableCell>

                      {/* 8 revisionProcess */}
                      <TableCell className="p-2 text-center">
                        {plan.revisionProcess || "Not in a revision process"}
                      </TableCell>

                      {/* 9 revisionStatus */}
                      <TableCell className="p-2 text-center">
                        {plan.revisionStatus || "Not Applicable"}
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {paginated.length} of {sorted.length}
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((p) => Math.min(totalPages, p + 1));
                    }}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
