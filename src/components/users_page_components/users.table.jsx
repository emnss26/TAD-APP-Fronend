import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

/* ------------ helpers de state ------------ */
const stateColors = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  inactive: "bg-red-100 text-red-800",
  unknown: "bg-gray-100 text-gray-800",
};
const renderStateBadge = (state = "unknown") => {
  const key = state.toLowerCase() || "unknown";
  return (
    <Badge
      className={`${
        stateColors[key] || stateColors.unknown
      } flex items-center hover:bg-[#164aa2] hover:text-white transition-colors`}
    >
      {state.charAt(0).toUpperCase() + state.slice(1)}
    </Badge>
  );
};

/* ------------ component ------------ */
export default function UsersTable({ users = [] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };
  const sortIndicator = (field) =>
    sortField === field ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  const getRoleDisplay = (u) =>
    !u.roles || u.roles.length === 0
      ? "Not specified"
      : u.roles.map((r) => r.name).join(", ");
  const getCompanyColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    return `hsl(${h}, 70%, 85%)`;
  };
  const getInitials = (name) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);

  // Filtrado
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const q = searchTerm.toLowerCase();
      const matchText =
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.companyName || "").toLowerCase().includes(q);
      const matchStatus = statusFilter ? u.status === statusFilter : true;
      const matchCompany = companyFilter
        ? u.companyName === companyFilter
        : true;
      const matchRole = roleFilter
        ? u.roles?.some((r) => r.name === roleFilter)
        : true;
      return matchText && matchStatus && matchCompany && matchRole;
    });
  }, [users, searchTerm, statusFilter, companyFilter, roleFilter]);

  // Ordenamiento
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? "";
      const bVal = b[sortField] ?? "";
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filtered, sortField, sortDirection]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const uniqueStatuses = Array.from(new Set(users.map((u) => u.status))).filter(
    Boolean
  );
  const uniqueCompanies = Array.from(
    new Set(users.map((u) => u.companyName))
  ).filter(Boolean);
  const uniqueRoles = Array.from(
    new Set(users.flatMap((u) => (u.roles ? u.roles.map((r) => r.name) : [])))
  ).filter(Boolean);

  return (
    <Card className="w-full bg-white">
      <CardHeader className="bg-gray-50 pb-2">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <CardTitle className="text-xl font-bold">Users Table</CardTitle>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users…"
                className="pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Button
              className="bg-[#e2e2e2] text-black hover:bg-[#2ea3e3] hover:text-white transition-colors shadow-sm"
              onClick={() => {
                setSearchTerm("");
                setSortField("name");
                setSortDirection("asc");
                setStatusFilter("");
                setCompanyFilter("");
                setRoleFilter("");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
          {/* State */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {statusFilter ? `State: ${statusFilter}` : "Filter by state"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setStatusFilter("");
                  setCurrentPage(1);
                }}
              >
                All States
              </DropdownMenuItem>
              {uniqueStatuses.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setCurrentPage(1);
                  }}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Company */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                {companyFilter
                  ? `Company: ${companyFilter}`
                  : "Filter by company"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setCompanyFilter("");
                  setCurrentPage(1);
                }}
              >
                All Companies
              </DropdownMenuItem>
              {uniqueCompanies.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => {
                    setCompanyFilter(c);
                    setCurrentPage(1);
                  }}
                >
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Role */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                {roleFilter ? `Role: ${roleFilter}` : "Filter by role"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setRoleFilter("");
                  setCurrentPage(1);
                }}
              >
                All Roles
              </DropdownMenuItem>
              {uniqueRoles.map((r) => (
                <DropdownMenuItem
                  key={r}
                  onClick={() => {
                    setRoleFilter(r);
                    setCurrentPage(1);
                  }}
                >
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white">
              <TableRow>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => handleSort("name")}
                >
                  Name {sortIndicator("name")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => handleSort("email")}
                >
                  Email {sortIndicator("email")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black"
                  onClick={() => handleSort("status")}
                >
                  State {sortIndicator("status")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-black hidden md:table-cell"
                  onClick={() => handleSort("companyName")}
                >
                  Company {sortIndicator("companyName")}
                </TableHead>
                <TableHead className="p-2 text-black hidden md:table-cell">
                  Roles
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((u) => (
                  <TableRow key={u.id} className="hover:bg-gray-50">
                    <TableCell className="p-2 font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage
                            src={u.imageUrl || "/placeholder.svg"}
                            alt={u.name}
                          />
                          <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                        </Avatar>
                        {u.name}
                      </div>
                    </TableCell>
                    <TableCell className="p-2">{u.email}</TableCell>
                    <TableCell className="p-2">
                      {renderStateBadge(u.status)}
                    </TableCell>
                    <TableCell className="p-2 hidden md:table-cell">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" />
                        {u.companyName}
                      </div>
                    </TableCell>
                    <TableCell className="p-2 hidden md:table-cell">
                      {getRoleDisplay(u)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="p-8 text-center text-gray-500"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-sm text-gray-600">
              Showing {paginated.length} of {sorted.length} users
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
