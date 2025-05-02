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

const statusMap = {
  "Waiting for submission": {
    variant: "default",
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
  },
  Submitted: { variant: "secondary", icon: <Clock className="h-3 w-3 mr-1" /> },
  "In review": {
    variant: "secondary",
    icon: <Clock className="h-3 w-3 mr-1" />,
  },
  Closed: {
    variant: "outline",
    icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
  },
};

const renderStatusBadgeSub = (status) => {
  const current = statusMap[status] || { variant: "outline" };
  return (
    <Badge variant={current.variant} className="flex items-center">
      {current.icon}
      {status}
    </Badge>
  );
};

export default function SubmittalsTable({ submittals = [] }) {
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
    let list = [...submittals];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.identifier.toLowerCase().includes(q) ||
          s.stateId.toLowerCase().includes(q)
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
  }, [submittals, searchTerm, sortField, sortDirection]);

  const current = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSorted.slice(start, start + itemsPerPage);
  }, [filteredAndSorted, currentPage]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const renderSortIndicator = (f) =>
    sortField === f ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex justify-between items-center gap-4">
          <CardTitle className="text-xl font-bold">Submittals List</CardTitle>
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search Submittals..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Button
              className="bg-[#e2e2e2] text-black hover:bg-[#2ea3e3] hover:text-white transition-colors shadow-sm"
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
            <TableHeader className="bg-[#ffffff]">
              <TableRow>
                {[
                  "identifier",
                  "title",
                  "specDetails",
                  "stateId",
                  "managerName",
                  "submittedByName",
                ].map((f) => (
                  <TableHead
                    key={f}
                    className="p-2 cursor-pointer text-black capitalize"
                    onClick={() => handleSort(f)}
                  >
                    {f.replace(/([A-Z])/g, " $1")} {renderSortIndicator(f)}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {current.length ? (
                current.map((sub) => (
                  <TableRow key={sub.id} className="hover:bg-gray-50">
                    <TableCell className="p-2">{sub.identifier}</TableCell>
                    <TableCell className="p-2">{sub.title}</TableCell>
                    <TableCell className="p-2">
                      {sub.specDetails?.title || "-"}
                    </TableCell>
                    <TableCell className="p-2">
                      {renderStatusBadgeSub(sub.stateId)}
                    </TableCell>
                    <TableCell className="p-2">{sub.managerName}</TableCell>
                    <TableCell className="p-2">{sub.submittedByName}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="p-8 text-center text-gray-500"
                  >
                    No submittals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {current.length} of {filteredAndSorted.length} submittals
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
