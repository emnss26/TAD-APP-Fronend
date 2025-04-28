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
import { ChevronDown, ChevronUp, Search, Filter } from "lucide-react"; // Cambiado SlidersHorizontal a Filter

// Nota: Se eliminaron las funciones de helper y Badge que no se usan en PlansTable

export default function PlansTable({ plans = [] }) { // Props renombradas
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("SheetNumber"); // Default sort field para Plans
  const [sortDirection, setSortDirection] = useState("asc");
  const [disciplineFilter, setDisciplineFilter] = useState(""); // Estado para filtro de disciplina
  const itemsPerPage = 10;

  /* ---------- 1. Filtered Data ---------- */
  const filtered = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return plans.filter((plan) => {
      // Lógica de búsqueda adaptada a los campos de 'plans'
      const matchesSearch =
        !lowerCaseSearchTerm ||
        (plan.SheetName?.toLowerCase() || "").includes(lowerCaseSearchTerm) ||
        (plan.SheetNumber?.toLowerCase() || "").includes(lowerCaseSearchTerm) ||
        (plan.Discipline?.toLowerCase() || "").includes(lowerCaseSearchTerm) ||
        (plan.Revision?.toString().toLowerCase() || "").includes(lowerCaseSearchTerm) ||
        (plan.RevisionDate?.toString().toLowerCase() || "").includes(lowerCaseSearchTerm);

      // Lógica de filtro por disciplina
      const matchesDiscipline = !disciplineFilter || (plan.Discipline || "Unassigned") === disciplineFilter;

      return matchesSearch && matchesDiscipline;
    });
  }, [plans, searchTerm, disciplineFilter]); // Dependencias actualizadas

  /* ---------- 2. Sorted Data ---------- */
  const sorted = useMemo(() => {
    let res = [...filtered];
    if (sortField) {
      res.sort((a, b) => {
        let aVal = a[sortField] ?? "";
        let bVal = b[sortField] ?? "";

        // Ordenamiento numérico especial para Revision
        if (sortField === "Revision") {
          const numA = parseInt(aVal, 10) || 0;
          const numB = parseInt(bVal, 10) || 0;
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }

        // Ordenamiento de cadena por defecto
        return sortDirection === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }
    return res;
  }, [filtered, sortField, sortDirection]);

  /* ---------- 3. Paginated Data ---------- */
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sorted.slice(start, start + itemsPerPage);
  }, [sorted, currentPage, itemsPerPage]);

  /* ---------- 4. Padded Rows (con Placeholders) ---------- */
  const paddedRows = useMemo(() => {
    const rows = [...paginated];
    const emptyRowCount = itemsPerPage - rows.length;
    if (emptyRowCount > 0 && currentPage === 1 && searchTerm === "" && disciplineFilter === "") {
      // Solo añadir placeholders en la primera página sin filtros activos
      // O ajusta esta condición si siempre quieres rellenar
      for (let i = 0; i < emptyRowCount; i++) {
        rows.push({ id: `empty-${currentPage}-${i}`, isPlaceholder: true });
      }
    } else if (emptyRowCount > 0) {
        // Si quieres rellenar *siempre* hasta 10 filas por página, incluso después de filtrar:
        for (let i = 0; i < emptyRowCount; i++) {
            rows.push({ id: `empty-${currentPage}-${i}`, isPlaceholder: true });
        }
    }
    return rows;
  }, [paginated, itemsPerPage, currentPage, searchTerm, disciplineFilter]);


  /* ---------- Helpers y Datos Derivados ---------- */
  const totalPages = Math.ceil(sorted.length / itemsPerPage);

  // Función para indicador de ordenación
  const sortIndicator = (f) =>
    sortField === f ? (
      sortDirection === "asc" ? (
        <ChevronUp className="inline h-4 w-4 ml-1" />
      ) : (
        <ChevronDown className="inline h-4 w-4 ml-1" />
      )
    ) : null;

  // Obtener disciplinas únicas para el dropdown
  const uniqueDisciplines = useMemo(() => {
    const disciplines = plans.map((p) => p.Discipline || "Unassigned").filter(Boolean);
    return Array.from(new Set(disciplines));
  }, [plans]);

  // Manejador de ordenación
   const handleSort = (field) => {
     const newDirection = (field === sortField && sortDirection === "asc") ? "desc" : "asc";
     setSortField(field);
     setSortDirection(newDirection);
     setCurrentPage(1);
   };

   // Manejador de reset
   const handleReset = () => {
      setSearchTerm("");
      setDisciplineFilter("");
      setSortField("SheetNumber"); // Volver al sort por defecto
      setSortDirection("asc");
      setCurrentPage(1);
    };


  return (
    <Card className="w-full bg-white h-full flex flex-col"> {/* Añadido h-full y flex */}
      {/* Header */}
      <CardHeader className="bg-slate-50 pb-2 pt-4 px-4 border-b"> {/* Ajustado padding */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4"> {/* Añadido items-center */}
          <CardTitle className="text-lg font-semibold">Plans List</CardTitle> {/* Ajustado tamaño */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto"> {/* items-center y flex-wrap */}
            {/* Search Input */}
            <div className="relative flex-grow md:flex-grow-0 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search plans…"
                className="pl-8 w-full" // Clases adaptadas
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

             {/* Discipline Filter Dropdown */}
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex-shrink-0 w-full sm:w-auto"> {/* Adaptado de IssuesTable */}
                  <Filter className="mr-2 h-4 w-4" /> {/* Icono Filter */}
                  {disciplineFilter
                    ? `Discipline: ${disciplineFilter}`
                    : "Filter by discipline"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => { setDisciplineFilter(""); setCurrentPage(1); }}>
                  All Disciplines
                </DropdownMenuItem>
                {uniqueDisciplines.map((d) => (
                  <DropdownMenuItem
                    key={d}
                    onSelect={() => { setDisciplineFilter(d); setCurrentPage(1); }}
                  >
                    {d}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Reset Button */}
            <Button
              variant="ghost" // Más sutil
              onClick={handleReset}
              className="flex-shrink-0 w-full sm:w-auto" // Adaptado de IssuesTable
            >
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Table Content */}
      {/* flex-1 para que ocupe espacio, overflow-y-auto para scroll vertical si excede */}
      <CardContent className="p-0 flex-1 overflow-y-auto">
        {/* overflow-x-auto para scroll horizontal de la tabla si es necesario */}
        <div className="overflow-x-auto">
          {/* Aplicar table-layout: fixed y w-full a la tabla */}
          <Table className="w-full" style={{ tableLayout: "fixed" }}>
            <TableHeader className="bg-gray-100 sticky top-0 z-10"> {/* Header pegajoso */}
              <TableRow>
                 {/* Cabeceras adaptadas para Plans */}
                 {/* Añadir whitespace-nowrap y anchos específicos */}
                <TableHead
                  className="p-2 cursor-pointer whitespace-nowrap w-[15%]"
                  onClick={() => handleSort("Discipline")}
                >
                  Discipline {sortIndicator("Discipline")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer whitespace-nowrap w-[30%]"
                  onClick={() => handleSort("SheetName")}
                >
                  Sheet Name {sortIndicator("SheetName")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer whitespace-nowrap w-[20%]"
                  onClick={() => handleSort("SheetNumber")}
                >
                  Sheet Number {sortIndicator("SheetNumber")}
                </TableHead>
                <TableHead
                  className="p-2 cursor-pointer text-right whitespace-nowrap w-[15%]"
                  onClick={() => handleSort("Revision")}
                >
                  Revision {sortIndicator("Revision")}
                </TableHead>
                <TableHead
                  className="p-2 text-right cursor-pointer whitespace-nowrap w-[20%]"
                onClick={() => handleSort("RevisionDate")}
                >
                  Rev. Date {sortIndicator("RevisionDate")}
                </TableHead>
                {/* Eliminada la columna Actions */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Mensaje si no hay datos *después* de filtrar */}
               {sorted.length === 0 && (searchTerm || disciplineFilter) ? (
                 <TableRow>
                   <TableCell colSpan={5} className="p-8 text-center text-gray-500">
                     No plans found matching your criteria.
                   </TableCell>
                 </TableRow>
               ) : (
                // Renderizar las filas (datos o placeholders)
                 paddedRows.map((plan) => {
                    if (plan.isPlaceholder) {
                       // Fila placeholder
                      return (
                         <TableRow key={plan.id} className="h-10 border-b hover:bg-gray-50"> {/* Altura y estilo consistentes */}
                           <TableCell className="p-2" colSpan={5}> </TableCell>
                         </TableRow>
                      );
                     }
                     // Fila de datos reales
                     return (
                       <TableRow key={plan.id || plan.rowNumber || plan.Id} className="h-10 border-b hover:bg-gray-50"> {/* Key robusta, altura y estilo consistentes */}
                         {/* Celdas con datos y manejo de texto largo */}
                         <TableCell className="p-2 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {plan.Discipline}
                          </TableCell>
                         <TableCell className="p-2 whitespace-nowrap overflow-hidden text-ellipsis">
                            {plan.SheetName}
                          </TableCell>
                         <TableCell className="p-2 whitespace-nowrap overflow-hidden text-ellipsis">
                            {plan.SheetNumber}
                          </TableCell>
                         <TableCell className="p-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">
                            {plan.Revision}
                          </TableCell>
                         <TableCell className="p-2 text-right whitespace-nowrap overflow-hidden text-ellipsis">
                           {plan.RevisionDate}
                         </TableCell>
                          {/* Sin celda de acciones */}
                       </TableRow>
                     );
                  })
                )}
               {/* Fin de la lógica de renderizado de filas */}
             </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Pagination Footer */}
       {/* Asegurarse que la paginación solo aparezca si hay más de una página y que esté fuera del scroll principal */}
       {totalPages > 1 && (
         <div className="flex justify-between items-center p-3 border-t bg-white flex-shrink-0"> {/* Estilo consistente */}
           <span className="text-sm text-gray-600">
              Showing {paginated.length} of {sorted.length} plans {/* Texto adaptado */}
           </span>
           <Pagination>
             <PaginationContent>
               <PaginationItem>
                 <PaginationPrevious
                   href="#" // Usar href si no hay routing específico
                    onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.max(1, p - 1)); }}
                    aria-disabled={currentPage === 1}
                    className={ currentPage === 1 ? "pointer-events-none opacity-50" : undefined }
                  />
                </PaginationItem>
                {/* Lógica de números de página (simplificada o compleja según necesites) */}
                {/* Ejemplo simple de IssuesTable: */}
                 {Array.from({ length: totalPages }, (_, i) => Math.max(0, currentPage - 2) + i) // Calcular números alrededor del actual
                   .filter(pageNumber => pageNumber >= 1 && pageNumber <= totalPages) // Filtrar válidos
                   .slice(0, 5) // Limitar a 5 números visibles
                   .map(pageNum => (
                   <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                       onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                       isActive={currentPage === pageNum}
                       aria-current={currentPage === pageNum ? "page" : undefined}
                      >
                        {pageNum}
                      </PaginationLink>
                   </PaginationItem>
                 ))}
                {/* Podrías añadir lógica de '...' aquí si es necesario */}
               <PaginationItem>
                  <PaginationNext
                    href="#"
                   onClick={(e) => { e.preventDefault(); setCurrentPage((p) => Math.min(totalPages, p + 1)); }}
                   aria-disabled={currentPage === totalPages}
                   className={ currentPage === totalPages ? "pointer-events-none opacity-50" : undefined }
                 />
               </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
       )}
     </Card>
  );
}