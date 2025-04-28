import React, { useState, useMemo, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Search, Filter, Plus, Trash2 } from "lucide-react";

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
        <ChevronUp className="inline h-4 w-4 ml-1 opacity-70" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1 opacity-70" />
      )
    ) : null;

  const isAllOnPageSelected =
    paginated.length > 0 &&
    paginated
      .map(p => p.id)
      .filter(id => id && !String(id).startsWith("empty-"))
      .every(id => selectedRows.includes(id));

  return (
    <Card className="w-full bg-white h-full flex flex-col shadow-md rounded-lg overflow-hidden">
      <CardHeader className="bg-slate-50 pb-2 pt-3 px-4 border-b flex-shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Plans List
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0 md:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search..."
                className="pl-8 h-8 text-xs w-full rounded-md border-gray-300"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs border-gray-300">
                  <Filter className="mr-1.5 h-3.5 w-3.5" />
                  {disciplineFilter ? `Disc: ${disciplineFilter}` : "Filter"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
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
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 text-xs text-gray-600 hover:bg-gray-200"
            >
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddRow}
              className="h-8 text-xs border-gray-300 ml-auto"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveClick}
              disabled={!selectedRows.length}
              className="h-8 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Remove ({selectedRows.length})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="overflow-x-auto">
          <Table className="w-full min-w-[750px]" style={{ tableLayout: "fixed" }}>
            {[
              <TableHeader key="header" className="bg-gray-100 sticky top-0 z-10">
                <TableRow className="h-10">
                  <TableHead className="w-12 px-2">
                    <Checkbox
                      id="select-all"
                      aria-label="Select all rows on page"
                      checked={isAllOnPageSelected}
                      onCheckedChange={handleSelectAllChange}
                    />
                  </TableHead>
                  <TableHead
                    className="p-2 text-xs font-medium text-gray-600 cursor-pointer whitespace-nowrap w-[15%]"
                    onClick={() => handleSort("Discipline")}
                  >
                    Discipline{sortIndicator("Discipline")}
                  </TableHead>
                  <TableHead
                    className="p-2 text-xs font-medium text-gray-600 cursor-pointer whitespace-nowrap w-[25%]"
                    onClick={() => handleSort("SheetName")}
                  >
                    Sheet Name{sortIndicator("SheetName")}
                  </TableHead>
                  <TableHead
                    className="p-2 text-xs font-medium text-gray-600 cursor-pointer whitespace-nowrap w-[20%]"
                    onClick={() => handleSort("SheetNumber")}
                  >
                    Sheet Number{sortIndicator("SheetNumber")}
                  </TableHead>
                  <TableHead
                    className="p-2 text-xs font-medium text-gray-600 cursor-pointer text-right whitespace-nowrap w-[15%]"
                    onClick={() => handleSort("Revision")}
                  >
                    Revision{sortIndicator("Revision")}
                  </TableHead>
                  <TableHead
                    className="p-2 text-xs font-medium text-gray-600 cursor-pointer text-right whitespace-nowrap w-[20%]"
                    onClick={() => handleSort("RevisionDate")}
                  >
                    Rev. Date{sortIndicator("RevisionDate")}
                  </TableHead>
                </TableRow>
              </TableHeader>,

              <TableBody key="body">
                {sorted.length === 0 && (searchTerm || disciplineFilter) ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-gray-500">
                      No plans found matching criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  paddedRows.map(plan =>
                    plan.isPlaceholder ? (
                      <TableRow key={plan.id} className="h-9 border-b border-gray-200">
                        <TableCell colSpan={6} className="p-1 bg-gray-50" />
                      </TableRow>
                    ) : (
                      <TableRow
                        key={plan.id}
                        data-state={selectedRows.includes(plan.id) ? "selected" : ""}
                        className="h-9 border-b border-gray-200 hover:bg-blue-50 data-[state=selected]:bg-blue-100 transition-colors duration-100"
                      >
                        <TableCell className="px-2 py-0 align-middle">
                          <Checkbox
                            id={`select-${plan.id}`}
                            checked={selectedRows.includes(plan.id)}
                            onCheckedChange={checked =>
                              handleRowCheckboxChange(plan.id, !!checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="p-0 align-middle">
                          <Input
                            type="text"
                            value={plan.Discipline || ""}
                            onChange={e =>
                              handleCellInputChange(plan.id, "Discipline", e)
                            }
                            className="h-full w-full px-2 text-xs bg-transparent border-none focus:bg-white focus:border focus:border-blue-400 focus:ring-0 rounded-none"
                          />
                        </TableCell>
                        <TableCell className="p-0 align-middle">
                          <Input
                            type="text"
                            value={plan.SheetName || ""}
                            onChange={e =>
                              handleCellInputChange(plan.id, "SheetName", e)
                            }
                            className="h-full w-full px-2 text-xs bg-transparent border-none focus:bg-white focus:border focus:border-blue-400 focus:ring-0 rounded-none"
                          />
                        </TableCell>
                        <TableCell className="p-0 align-middle">
                          <Input
                            type="text"
                            value={plan.SheetNumber || ""}
                            onChange={e =>
                              handleCellInputChange(plan.id, "SheetNumber", e)
                            }
                            className="h-full w-full px-2 text-xs bg-transparent border-none focus:bg-white focus:border focus:border-blue-400 focus:ring-0 rounded-none"
                          />
                        </TableCell>
                        <TableCell className="p-0 align-middle">
                          <Input
                            type="text"
                            value={plan.Revision || ""}
                            onChange={e =>
                              handleCellInputChange(plan.id, "Revision", e)
                            }
                            className="h-full w-full px-2 text-xs text-right bg-transparent border-none focus:bg-white focus:border focus:border-blue-400 focus:ring-0 rounded-none"
                          />
                        </TableCell>
                        <TableCell className="p-0 align-middle">
                          <Input
                            type="date"
                            value={plan.RevisionDate || ""}
                            onChange={e =>
                              handleCellInputChange(plan.id, "RevisionDate", e)
                            }
                            className="h-full w-full px-2 text-xs text-right bg-transparent border-none focus:bg-white focus:border focus:border-blue-400 focus:ring-0 rounded-none"
                          />
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>,
            ]}
          </Table>
        </div>
      </CardContent>

      {totalPages > 1 && (
        <div className="flex justify-between items-center p-3 border-t bg-white flex-shrink-0">
          <span className="text-xs text-gray-600">
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
                  className={`h-7 px-2 text-xs ${
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => {
                const pageNum =
                  currentPage <= 2
                    ? i + 1
                    : Math.min(totalPages - 2, currentPage - 1) + i;
                return pageNum > totalPages || pageNum < 1 ? null : (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={e => {
                        e.preventDefault();
                        setCurrentPage(pageNum);
                      }}
                      isActive={currentPage === pageNum}
                      className="h-7 w-7 p-0 text-xs"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              {totalPages > 3 && currentPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="px-1 text-xs">...</span>
                </PaginationItem>
              )}
              {totalPages > 3 && currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      setCurrentPage(totalPages);
                    }}
                    className="h-7 w-7 p-0 text-xs"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={e => {
                    e.preventDefault();
                    setCurrentPage(p => Math.min(totalPages, p + 1));
                  }}
                  className={`h-7 px-2 text-xs ${
                    currentPage === totalPages ? "pointer-events-none opacity-50" : ""
                  }`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
}
