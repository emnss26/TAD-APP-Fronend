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
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

const badgeVariants = {
  open: { variant: "default", icon: <AlertCircle className="h-3 w-3 mr-1" /> },
  "in review": {
    variant: "secondary",
    icon: <Clock className="h-3 w-3 mr-1" />,
  },
  "in progress": {
    variant: "secondary",
    icon: <Clock className="h-3 w-3 mr-1" />,
  },
  answered: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
  closed: {
    variant: "outline",
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
  },
  urgent: {
    variant: "destructive",
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
  },
};

const renderStatusBadge = (status = "unknown") => {
  const key = status.toLowerCase();
  const current = badgeVariants[key] || { variant: "outline" };
  return (
    <Badge variant={current.variant} className="flex items-center">
      {current.icon}
      {status}
    </Badge>
  );
};

export default function RFITable({ rfis = [], onViewDetails }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...rfis];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (rfi) =>
          rfi.title.toLowerCase().includes(q) ||
          rfi.customIdentifier.toLowerCase().includes(q) ||
          rfi.status.toLowerCase().includes(q) ||
          rfi.assignedTo.toLowerCase().includes(q)
      );
    }
    if (sortField) {
      list.sort((a, b) => {
        const aVal = (a[sortField] || "").toString();
        const bVal = (b[sortField] || "").toString();
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      });
    }
    return list;
  }, [rfis, searchTerm, sortField, sortDirection]);

  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);

  const renderSortIndicator = (field) =>
    sortField === field ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-slate-50 pb-2">
        <div className="flex justify-between items-center gap-4">
          <CardTitle className="text-xl font-bold">RFI List</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search RFIs..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
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
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#f6f6f6]">
              <TableRow>
                {[
                  "customIdentifier",
                  "title",
                  "discipline",
                  "priority",
                  "status",
                  "createdAt",
                  "updatedAt",
                  "closedAt",
                  "assignedTo",
                  "reviewerId",
                  "managerId",
                ].map((field) => (
                  <TableHead
                    key={field}
                    className="p-2 cursor-pointer text-black capitalize"
                    onClick={() => handleSort(field)}
                  >
                    {field.replace(/([A-Z])/g, " $1")}{" "}
                    {renderSortIndicator(field)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.length ? (
                current.map((rfi) => (
                  <TableRow key={rfi.id} className="hover:bg-gray-50">
                    <TableCell className="p-2">
                      {rfi.customIdentifier}
                    </TableCell>
                    <TableCell className="p-2">{rfi.title}</TableCell>
                    <TableCell className="p-2">{rfi.discipline}</TableCell>
                    <TableCell className="p-2">{rfi.priority}</TableCell>
                    <TableCell className="p-2">
                      {renderStatusBadge(rfi.status)}
                    </TableCell>
                    <TableCell className="p-2">
                      {new Date(rfi.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="p-2">
                      {new Date(rfi.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="p-2">
                      {rfi.closedAt
                        ? new Date(rfi.closedAt).toLocaleDateString()
                        : "-"}
                    </TableCell>
                    <TableCell className="p-2">{rfi.assignedTo}</TableCell>
                    <TableCell className="p-2">{rfi.reviewerId}</TableCell>
                    <TableCell className="p-2">{rfi.managerId}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={11}
                    className="p-8 text-center text-gray-500"
                  >
                    No RFIs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {current.length} of {filteredAndSorted.length} RFIs
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
