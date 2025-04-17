import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink,
  PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  ChevronDown, ChevronUp, Search, SlidersHorizontal, Eye,
  AlertCircle, Clock, CheckCircle2,
} from "lucide-react";

/* ------------ helpers ------------ */
const getCustom = (issue, title) =>
  issue.customAttributes?.find((a) => a.title === title)?.readableValue ??
  "Not specified";

const renderStatusBadge = (status = "unknown") => {
  const key = status.toLowerCase?.() || "unknown";
  const badge = {
    open:    { variant: "default",     icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    answered:{ variant: "secondary",   icon: <Clock className="h-3 w-3 mr-1" /> },
    "in review":   { variant: "secondary",   icon: <Clock className="h-3 w-3 mr-1" /> },
    "in progress": { variant: "secondary",   icon: <Clock className="h-3 w-3 mr-1" /> },
    closed:  { variant: "outline",     icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
    urgent:  { variant: "destructive", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
    unknown: { variant: "outline",     icon: null },
  }[key] || { variant: "outline", icon: null };

  return (
    <Badge variant={badge.variant} className="flex items-center">
      {badge.icon}
      {status}
    </Badge>
  );
};

const renderPriorityBadge = (priority = "Not specified") => {
  const key = priority.toLowerCase?.() || "unknown";
  const colors = {
    critical: "bg-red-100 text-red-800",
    hard:     "bg-yellow-100 text-yellow-800",
    medium:   "bg-blue-100 text-blue-800",
    low:      "bg-green-100 text-green-800",
    unknown:  "bg-gray-100 text-gray-800",
  };
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors[key] || colors.unknown}`}>
      {priority}
    </span>
  );
};

/* ------------ component ------------ */
export default function IssuesTable({
  issues = [],
  onViewDetails,
  customColumns = [],      // ← nombres de atributos personalizados
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm]   = useState("");
  const [sortField, setSortField]     = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const itemsPerPage = 10;

  /* ----- filtrado y orden ----- */
  const list = useMemo(() => {
    let res = [...issues];

    /* búsqueda */
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      res = res.filter((i) =>
        (i.title ?? "").toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q) ||
        String(i.displayId).toLowerCase().includes(q) ||
        (i.status ?? "").toLowerCase().includes(q) ||
        (i.assignedTo ?? "").toLowerCase().includes(q)
      );
    }

    /* orden */
    if (sortField) {
      res.sort((a, b) => {
        const av = (a[sortField] ?? "").toString();
        const bv = (b[sortField] ?? "").toString();
        return sortDirection === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      });
    }

    return res;
  }, [issues, searchTerm, sortField, sortDirection]);

  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  }, [list, currentPage]);

  const totalPages = Math.ceil(list.length / itemsPerPage);

  const sortIndicator = (f) =>
    sortField === f ? (
      sortDirection === "asc" ? <ChevronUp className="inline h-4 w-4 ml-1" /> : <ChevronDown className="inline h-4 w-4 ml-1" />
    ) : null;

  /* ----- JSX ----- */
  return (
    <Card className="w-full shadow-lg border-0">
      {/* ---------- header ---------- */}
      <CardHeader className="bg-slate-50 pb-2">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle className="text-xl font-bold">Issues List</CardTitle>

          <div className="flex gap-2 w-full md:w-auto">
            {/* search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search issues…"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>

            {/* sort dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {["displayId", "dueDate", "priority", "status"].map((f) => (
                  <DropdownMenuItem key={f} onClick={() => {
                    setSortField(f);
                    setSortDirection(sortField === f && sortDirection === "asc" ? "desc" : "asc");
                  }}>
                    Sort by {f}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {/* ---------- table ---------- */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-100">
              <TableRow>
                <TableHead className="w-[80px] cursor-pointer" onClick={() => handleSort("displayId")}>
                  ID {sortIndicator("displayId")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("title")}>
                  Title {sortIndicator("title")}
                </TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Due Date</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                <TableHead>Priority</TableHead>

                {/* dinámicos */}
                {customColumns.map((c) => (
                  <TableHead key={c} className="hidden lg:table-cell">
                    {c}
                  </TableHead>
                ))}

                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {current.length ? (
                current.map((issue) => {
                  const prio = getCustom(issue, "Priority");
                  return (
                    <TableRow key={issue.id} className="hover:bg-slate-50">
                      <TableCell>{issue.displayId}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{issue.title}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">{issue.description}</TableCell>
                      <TableCell>{renderStatusBadge(issue.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">{issue.dueDate || "-"}</TableCell>
                      <TableCell className="hidden lg:table-cell">{issue.updatedAt || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{issue.assignedTo || "-"}</TableCell>
                      <TableCell>{renderPriorityBadge(prio)}</TableCell>

                      {customColumns.map((c) => (
                        <TableCell key={c} className="hidden lg:table-cell">
                          {getCustom(issue, c)}
                        </TableCell>
                      ))}

                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewDetails?.(issue.id)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={customColumns.length + 9} className="text-center py-8 text-muted-foreground">
                    No issues found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* ---------- pagination ---------- */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Showing {current.length} of {list.length} issues
            </span>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      isActive={currentPage === i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );

  /* ----- inner helper ----- */
  function handleSort(field) {
    if (sortField === field) setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  }
}
