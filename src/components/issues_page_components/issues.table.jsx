import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Eye,
} from "lucide-react";

/* ------------ helpers ------------ */
const getCustom = (issue, title) =>
  issue.customAttributes?.find((a) => a.title === title)?.readableValue ??
  "Not specified";

const statusColors = {
  open: "bg-yellow-100 text-yellow-800",
  answered: "bg-blue-100 text-blue-800",
  in_review: "bg-blue-100 text-blue-800",
  in_progress: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-800",
  urgent: "bg-red-100 text-red-800",
  unknown: "bg-gray-100 text-gray-800",
};

const renderStatusBadge = (status = "unknown") => {
  const key = status.toLowerCase?.() || "unknown";
  return (
    <Badge
      className={`${
        statusColors[key] || statusColors.unknown
      } flex items-center hover:bg-[#164aa2] hover:text-white transition-colors`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const priorityColors = {
  critical: "bg-purple-100 text-purple-800",
  hard: "bg-red-100 text-red-800",
  medium: "bg-blue-100 text-blue-800",
  low: "bg-green-100 text-green-800",
  unknown: "bg-gray-100 text-gray-800",
};

const renderPriorityBadge = (priority = "unknown") => {
  const key = priority.toLowerCase?.() || "unknown";
  return (
    <Badge
      className={`${
        priorityColors[key] || priorityColors.unknown
      } px-2 py-1 rounded-full font-medium hover:bg-[#164aa2] hover:text-white transition-colors`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};

/* ------------ component ------------ */
export default function IssuesTable({
  issues = [],
  onViewDetails,
  customColumns = [], // nombres de atributos personalizados
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const itemsPerPage = 10;

  /* ----- filtered & sorted list ----- */
  const list = useMemo(() => {
    let res = [...issues];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      res = res.filter(
        (i) =>
          (i.title ?? "").toLowerCase().includes(q) ||
          (i.description ?? "").toLowerCase().includes(q) ||
          String(i.displayId).includes(q) ||
          (i.status ?? "").toLowerCase().includes(q) ||
          (i.assignedTo ?? "").toLowerCase().includes(q)
      );
    }

    if (sortField) {
      res.sort((a, b) => {
        const av = (a[sortField] ?? "").toString();
        const bv = (b[sortField] ?? "").toString();
        return sortDirection === "asc"
          ? av.localeCompare(bv)
          : bv.localeCompare(av);
      });
    }

    return res;
  }, [issues, searchTerm, sortField, sortDirection]);

  /* ----- pagination ----- */
  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
  }, [list, currentPage]);

  const totalPages = Math.ceil(list.length / itemsPerPage);

  const sortIndicator = (f) =>
    sortField === f ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  return (
    <Card className="w-full bg-white">
      {/* header */}
      <CardHeader className="bg-slate-50 pb-2">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle className="text-xl font-bold">Issues List</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* search */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search issues…"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            {/* reset button */}
            <Button
              className="bg-[#2ea3e3] text-white"
              onClick={() => {
                setSearchTerm("");
                setSortField(null);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f6f6f6]">
              <TableRow>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => {
                    setSortField("displayId");
                    setSortDirection(
                      sortField === "displayId" && sortDirection === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  ID {sortIndicator("displayId")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => {
                    setSortField("title");
                    setSortDirection(
                      sortField === "title" && sortDirection === "asc"
                        ? "desc"
                        : "asc"
                    );
                  }}
                >
                  Title {sortIndicator("title")}
                </TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="p-2 text-black">Status</TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Created At
                </TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Due Date
                </TableHead>
                <TableHead className="p-2 text-black hidden lg:table-cell">
                  Updated
                </TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Assigned To
                </TableHead>
                <TableHead className="p-2 text-black">Priority</TableHead>
                {customColumns.map((c) => (
                  <TableHead
                    key={c}
                    className="p-2 text-black hidden lg:table-cell"
                  >
                    {c}
                  </TableHead>
                ))}
                <TableHead className="p-2 text-black text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.length ? (
                current.map((issue) => {
                  const prio = getCustom(issue, "Priority");
                  return (
                    <TableRow key={issue.id} className="hover:bg-gray-50">
                      <TableCell className="p-2">{issue.displayId}</TableCell>
                      <TableCell className="p-2 max-w-[200px] truncate">
                        {issue.title}
                      </TableCell>
                      <TableCell className="p-2 hidden md:table-cell max-w-[200px] truncate">
                        {issue.description}
                      </TableCell>
                      <TableCell className="p-2">
                        {renderStatusBadge(issue.status)}
                      </TableCell>
                      <TableCell className="p-2 hidden md:table-cell">
                        {issue.createdAt ? issue.createdAt.split("T")[0] : "-"}
                      </TableCell>
                      <TableCell className="p-2 hidden md:table-cell">
                        {issue.dueDate || "-"}
                      </TableCell>
                      <TableCell className="p-2 hidden lg:table-cell">
                        {issue.updatedAt ? issue.updatedAt.split("T")[0] : "-"}
                      </TableCell>
                      <TableCell className="p-2 hidden md:table-cell">
                        {issue.assignedTo || "-"}
                      </TableCell>
                      <TableCell className="p-2">
                        {renderPriorityBadge(prio)}
                      </TableCell>
                      {customColumns.map((c) => (
                        <TableCell
                          key={c}
                          className="p-2 text-black hidden lg:table-cell"
                        >
                          {getCustom(issue, c)}
                        </TableCell>
                      ))}
                      <TableCell className="p-2 text-right">
                        <Button
                          className="bg-[#2ea3e3] text-white"
                          size="sm"
                          onClick={() => onViewDetails?.(issue.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={customColumns.length + 9}
                    className="p-8 text-center text-gray-500"
                  >
                    No issues found matching your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {current.length} of {list.length} issues
            </span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className={
                      currentPage === 1 ? "opacity-50 pointer-events-none" : ""
                    }
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
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
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
