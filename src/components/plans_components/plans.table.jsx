import React, { useState, useMemo, useCallback } from "react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return (plans || []).filter(plan => {
      const textMatch =
        !term ||
        (plan.SheetName || "").toLowerCase().includes(term) ||
        (plan.SheetNumber || "").toLowerCase().includes(term) ||
        (plan.Discipline || "").toLowerCase().includes(term) ||
        String(plan.Revision || "").toLowerCase().includes(term) ||
        String(plan.RevisionDate || "").toLowerCase().includes(term);
      const discMatch =
        !disciplineFilter ||
        (plan.Discipline || "Unassigned") === disciplineFilter;
      return textMatch && discMatch;
    });
  }, [plans, searchTerm, disciplineFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (!sortField) return arr;
    return arr.sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      if (sortField === "Revision") {
        const na = parseInt(aVal, 10) || 0;
        const nb = parseInt(bVal, 10) || 0;
        return sortDirection === "asc" ? na - nb : nb - na;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortField, sortDirection]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  const paddedRows = useMemo(() => {
    const rows = [...paginated];
    const toAdd = itemsPerPage - rows.length;
    for (let i = 0; i < toAdd; i++) {
      rows.push({ id: `empty-${currentPage}-${i}`, isPlaceholder: true });
    }
    return rows;
  }, [paginated, itemsPerPage, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const uniqueDisciplines = Array.from(
    new Set((plans || []).map(p => p.Discipline || "Unassigned"))
  );

  const handleSort = useCallback(
    field => {
      const dir = field === sortField && sortDirection === "asc" ? "desc" : "asc";
      setSortField(field);
      setSortDirection(dir);
      setCurrentPage(1);
    },
    [sortField, sortDirection]
  );

  const handleReset = useCallback(() => {
    setSearchTerm("");
    setDisciplineFilter("");
    setSortField("SheetNumber");
    setSortDirection("asc");
    setCurrentPage(1);
  }, []);

  const handleRowCheckboxChange = useCallback(
    (id, checked) => {
      setSelectedRows(prev =>
        checked ? [...prev, id] : prev.filter(x => x !== id)
      );
    },
    [setSelectedRows]
  );

  const handleSelectAllChange = useCallback(
    checked => {
      const ids = paginated
        .map(p => p.id)
        .filter(id => id && !String(id).startsWith("empty-"));
      setSelectedRows(checked ? ids : []);
    },
    [paginated, setSelectedRows]
  );

  const handleCellInputChange = useCallback(
    (id, field, e) => {
      e.stopPropagation();
      onInputChange?.(id, field, e.target.value);
    },
    [onInputChange]
  );

  const handleRemoveClick = useCallback(() => {
    onRemoveRows?.(selectedRows);
  }, [onRemoveRows, selectedRows]);

  const sortIndicator = field =>
    field === sortField ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-xl font-bold">Plans List</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500 pointer-events-none" />
              <Input
                placeholder="Search..."
                className="pl-8"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Button
              className="bg-[#e2e2e2] text-black hover:bg-[#2ea3e3] hover:text-white transition-colors shadow-sm"
              onClick={handleReset}
            >
              Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-gray-300">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  {disciplineFilter ? `Disc: ${disciplineFilter}` : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-sm">
                <DropdownMenuItem
                  onSelect={() => {
                    setDisciplineFilter("");
                    setCurrentPage(1);
                  }}
                >
                  All Disciplines
                </DropdownMenuItem>
                {uniqueDisciplines.map(d => (
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
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRow}
              className="border-gray-300"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveClick}
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
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead className="p-2">
                  <Checkbox
                    id="select-all"
                    aria-label="Select all rows on page"
                    checked={
                      paginated.length > 0 &&
                      paginated
                        .map(p => p.id)
                        .filter(id => id && !String(id).startsWith("empty-"))
                        .every(id => selectedRows.includes(id))
                    }
                    onCheckedChange={handleSelectAllChange}
                  />
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => handleSort("Discipline")}
                >
                  Discipline{sortIndicator("Discipline")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => handleSort("SheetName")}
                >
                  Sheet Name{sortIndicator("SheetName")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => handleSort("SheetNumber")}
                >
                  Sheet Number{sortIndicator("SheetNumber")}
                </TableHead>
                <TableHead
                  className="p-2 text-black text-right cursor-pointer"
                  onClick={() => handleSort("Revision")}
                >
                  Revision{sortIndicator("Revision")}
                </TableHead>
                <TableHead
                  className="p-2 text-black text-right cursor-pointer"
                  onClick={() => handleSort("RevisionDate")}
                >
                  Rev. Date{sortIndicator("RevisionDate")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (searchTerm || disciplineFilter) ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center text-gray-500">
                    No plans found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                paddedRows.map(plan =>
                  plan.isPlaceholder ? (
                    <TableRow key={plan.id} className="h-9">
                      <TableCell colSpan={6} className="p-4 bg-gray-50" />
                    </TableRow>
                  ) : (
                    <TableRow
                      key={plan.id}
                      className="hover:bg-gray-50 transition-colors duration-100"
                    >
                      <TableCell className="p-2 align-middle">
                        <Checkbox
                          id={`select-${plan.id}`}
                          checked={selectedRows.includes(plan.id)}
                          onCheckedChange={checked =>
                            handleRowCheckboxChange(plan.id, !!checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle">
                        <Input
                          type="text"
                          value={plan.Discipline || ""}
                          onChange={e =>
                            handleCellInputChange(plan.id, "Discipline", e)
                          }
                          className="w-full bg-transparent border-none focus:bg-white focus:border focus:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle">
                        <Input
                          type="text"
                          value={plan.SheetName || ""}
                          onChange={e =>
                            handleCellInputChange(plan.id, "SheetName", e)
                          }
                          className="w-full bg-transparent border-none focus:bg-white focus:border focus:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle">
                        <Input
                          type="text"
                          value={plan.SheetNumber || ""}
                          onChange={e =>
                            handleCellInputChange(plan.id, "SheetNumber", e)
                          }
                          className="w-full bg-transparent border-none focus:bg-white focus:border focus:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle text-right">
                        <Input
                          type="text"
                          value={plan.Revision ?? ""}
                          onChange={e =>
                            handleCellInputChange(plan.id, "Revision", e)
                          }
                          className="w-full bg-transparent border-none focus:bg-white focus:border focus:ring-0"
                        />
                      </TableCell>
                      <TableCell className="p-2 align-middle text-right">
                        <Input
                          type="date"
                          value={plan.RevisionDate ?? ""}
                          onChange={e =>
                            handleCellInputChange(plan.id, "RevisionDate", e)
                          }
                          className="w-full bg-transparent border-none focus:bg-white focus:border focus:ring-0"
                        />
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
              Showing {paginated.length} of {sorted.length} plans
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(p => Math.max(1, p - 1));
                    }}
                    className={
                      currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                    }
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(p => Math.min(totalPages, p + 1));
                    }}
                    className={
                      currentPage === totalPages
                        ? "opacity-50 pointer-events-none"
                        : ""
                    }
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