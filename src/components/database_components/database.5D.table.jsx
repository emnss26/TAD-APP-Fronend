"use client";

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Search,
  ArrowUpDown,
  ChevronFirst,
  ChevronLast,
  Filter,
  SlidersHorizontal,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "../../hooks/use-toast"

// --------------------
// CONSTANTES ÚNICAS
// --------------------
const elementTypeColorMap = {
  Walls: "#ef4444",
  Doors: "#3b82f6",
  Windows: "#eab308",
  Floors: "#22c55e",
  "Structural Foundations": "#a855f7",
  "Structural Columns": "#f97316",
  Pipe: "#fdba74",
  Duct: "#5eead4",
};
const fallbackTypeColor = "#6b7280";

const disciplineColorMap = {
  "Preliminary Works": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Structural Foundations": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Concrete Structure": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Metallic Structure": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Masonry Works": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Walls and Ceilings": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Aluminium works windows and glazing": { bg: "bg-[#2ea3e3]", text: "text-white" },
  Blaksmithing: { bg: "bg-[#2ea3e3]", text: "text-white" },
  Finishes: { bg: "bg-[#2ea3e3]", text: "text-white" },
  Furniture: { bg: "bg-[#2ea3e3]", text: "text-white" },
  Carpentry: { bg: "bg-[#2ea3e3]", text: "text-white" },
  Mechanical: { bg: "bg-[#2ea3e3]", text: "text-white" },
  Electrical: { bg: "bg-[#2ea3e3]", text: "text-white" },
  Plumbing: { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Fire Protection": { bg: "bg-[#2ea3e3]", text: "text-white" },
  "Special Systems": { bg: "bg-[#2ea3e3]", text: "text-white" },
};

const columnGroups = {
  general: ["rowNumber", "dbId", "Code", "Discipline", "ElementType", "TypeName"],
  dimensions: [
    "rowNumber",
    "dbId",
    "ElementType",
    "TypeName",
    "Length",
    "Width",
    "Height",
    "Perimeter",
    "Area",
    "Thickness",
    "Volume",
  ],
  description: [
    "rowNumber",
    "dbId",
    "ElementType",
    "TypeName",
    "Description",
    "Level",
    "Material",
  ],
  cost: [
    "rowNumber",
    "dbId",
    "ElementType",
    "TypeName",
    "Unit",
    "Quantity",
    "UnitPrice",
    "TotalCost",
  ],
};

const numericColumns = [
  "LENGTH",
  "WIDTH",
  "HEIGHT",
  "PERIMETER",
  "AREA",
  "THICKNESS",
  "VOLUME",
  "QUANTITY",
  "UNITPRICE",
  "TOTALCOST",
];



// --------------------
// SUBCOMPONENTES
// --------------------

// TableControls
const TableControls = React.memo(function TableControls({
  activeSection,
  handleChangeSection,
  handleToggleSort,
  sortDisciplinesAsc,
  handleExpandAll,
  handleCollapseAll,
  searchDbId,
  setSearchDbId,
  handleDbIdSearch,
  filterText,
  setFilterText,
  hoverColor,
  setHoverColor,
  handleScrollUp,
  handleScrollDown,
  page,
  totalPages,
  handlePrevPage,
  handleNextPage,
  handleFirstPage,
  handleLastPage,
}) {
  return (
    <div className="space-y-2 bg-slate-50 p-4 border-b">
      <Tabs value={activeSection} onValueChange={handleChangeSection} className="w-full">
        <TabsList className="grid grid-cols-4 w-full bg-[#2ea3e3]">
          <TabsTrigger value="general" className="text-black data-[state=active]:bg-[#3D464A] data-[state=active]:text-white">
            General
          </TabsTrigger>
          <TabsTrigger value="dimensions" className="text-black data-[state=active]:bg-[#3D464A] data-[state=active]:text-white">
            Dimensions
          </TabsTrigger>
          <TabsTrigger value="description" className="text-black data-[state=active]:bg-[#3D464A] data-[state=active]:text-white">
            Description
          </TabsTrigger>
          <TabsTrigger value="cost" className="text-black data-[state=active]:bg-[#3D464A] data-[state=active]:text-white">
            Cost
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleSort} className="flex items-center gap-1">
            <ArrowUpDown className="h-4 w-4" />
            {sortDisciplinesAsc ? "Restore Order" : "Sort A→Z"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExpandAll} className="flex items-center gap-1">
            <ChevronDown className="h-4 w-4" />
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={handleCollapseAll} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4" />
            Collapse All
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Search dbId..."
              value={searchDbId}
              onChange={(e) => setSearchDbId(e.target.value)}
              className="w-28 h-8 text-xs pr-8"
              onKeyDown={(e) => { if (e.key === "Enter") handleDbIdSearch(); }}
            />
            <Button size="sm" variant="ghost" className="absolute right-0 h-8 w-8 p-0" onClick={handleDbIdSearch}>
              <Search className="h-3 w-3" />
            </Button>
          </div>
          <div className="relative flex items-center">
            <Input
              type="text"
              placeholder="Filter TypeName / Desc..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-44 h-8 text-xs pr-8"
            />
            <Filter className="h-3 w-3 absolute right-2 text-muted-foreground" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <SlidersHorizontal className="h-3 w-3 mr-1" />
                <span className="text-xs">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-2">
                <div className="text-xs font-medium mb-1">Row hover color:</div>
                <Select value={hoverColor} onValueChange={(val) => setHoverColor(val)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Hover color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bg-slate-50">Slate 50</SelectItem>
                    <SelectItem value="bg-slate-200">Slate 200</SelectItem>
                    <SelectItem value="bg-red-50">Red 50</SelectItem>
                    <SelectItem value="bg-green-50">Green 50</SelectItem>
                    <SelectItem value="bg-yellow-50">Yellow 50</SelectItem>
                    <SelectItem value="bg-blue-50">Blue 50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleScrollUp} title="Scroll up">
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleScrollDown} title="Scroll down">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleFirstPage} disabled={page <= 1}>
            <ChevronFirst className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevPage} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-xs px-2">
            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextPage} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleLastPage} disabled={page >= totalPages}>
            <ChevronLast className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
});

// --------------------
// SUBCOMPONENTES PARA FILAS
// --------------------

// Encabezado de disciplina
const DisciplineHeaderRow = React.memo(function DisciplineHeaderRow({
  discipline,
  rowsCount,
  isDiscCollapsed,
  onToggle,
  visibleColsCount,
  isolateDiscipline,
  hideDiscipline,
}) {
  // Handler function that handles collapsing both discipline and its child codes
  const handleToggleCollapse = () => {
    onToggle(discipline);
  };

  return (
    <TableRow className="uppercase bg-slate-50 text-black transition-colors hover:bg-[#2ea3e3] hover:text-white">
      <TableCell colSpan={visibleColsCount}>
        <div className="flex items-center">
          <button
            onClick={handleToggleCollapse}
            className="mr-2 text-black hover:bg-[#2ea3e3] p-1 rounded transition-colors"
            aria-label={isDiscCollapsed ? "Expand discipline" : "Collapse discipline"}
          >
            {isDiscCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
          </button>
          <span>{discipline}</span>
          <Badge variant="outline" className="ml-2 text-xs">
            {rowsCount}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={isolateDiscipline}
                  className="bg-slate-50 text-black"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Isolate this discipline in viewer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={hideDiscipline}
                  className="bg-slate-50 text-black"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <EyeOff className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hide this discipline in viewer</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
});

// Fila de elemento
const ElementRow = React.memo(function ElementRow({
  row,
  visibleColumns,
  isSelected,
  onRowClick,
  handleInputChange,
  handleDisciplineChange,
  handleElementTypeChange,
  disciplineOptions,
  elementtype,
  isolateRow,
  index,
  isDimensionsView,
  hoverColor,
}) {
  const getElementTypeColor = (type) =>
    elementTypeColorMap[type] || fallbackTypeColor;
  const displayedRowNumber =
    row.rowNumber !== undefined ? row.rowNumber : index + 1;
  const rowClass = isSelected
    ? "bg-blue-100 hover:bg-blue-100"
    : `hover:${hoverColor}`;
  return (
    <TableRow
      className={`border-l-4 cursor-pointer ${rowClass} transition-colors`}
      style={{ borderLeftColor: getElementTypeColor(row.ElementType) }}
      onClick={onRowClick}
    >
      {visibleColumns.map((col) => {
        if (col === "rowNumber") {
          return (
            <TableCell key={col} className="font-medium text-center">
              {displayedRowNumber}
            </TableCell>
          );
        }
        if (col === "dbId") {
          return (
            <TableCell key={col} className="text-center">
              {row.dbId}
            </TableCell>
          );
        }
        if (
          [
            "PlanedConstructionStartDate",
            "PlanedConstructionEndDate",
            "RealConstructionStartDate",
            "RealConstructionEndDate",
          ].includes(col)
        ) {
          return (
            <TableCell key={col}>
              <Input
                type="date"
                name={col}
                value={row[col] || ""}
                onChange={(e) => handleInputChange(row, e)}
                className="h-8 text-sm"
              />
            </TableCell>
          );
        }
        if (col === "Discipline") {
          return (
            <TableCell key={col}>
              <Select
                value={row[col] || ""}
                onValueChange={(val) => handleDisciplineChange(row, val)}
              >
                <SelectTrigger className="h-8 text-sm bg-white text-black" onMouseDown={(e) => e.stopPropagation()}>
                  <SelectValue placeholder="Discipline" />
                </SelectTrigger>
                <SelectContent>
                  {disciplineOptions.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          );
        }
        if (col === "ElementType") {
          return (
            <TableCell key={col}>
              <Select
                value={row[col] || ""}
                onValueChange={(val) => handleElementTypeChange(row, val)}
              >
                <SelectTrigger className="h-8 text-sm" onMouseDown={(e) => e.stopPropagation()}>
                  <SelectValue placeholder="Element Type">
                    {row[col] && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getElementTypeColor(row[col]) }} />
                        <span>{row[col]}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {elementtype.map((type) => {
                    const c = elementTypeColorMap[type] || fallbackTypeColor;
                    return (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                          <span>{type}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </TableCell>
          );
        }
        if (numericColumns.includes(col.toUpperCase())) {
          let val = row[col] || "";
          if (isDimensionsView && val !== "") {
            const floatVal = parseFloat(val);
            if (!isNaN(floatVal)) {
              val = floatVal.toFixed(2);
            }
          }
          return (
            <TableCell key={col}>
              <Input
                type="text"
                name={col}
                value={parseFloat(row[col]) ? parseFloat(row[col]).toFixed(2) : row[col]}
                onChange={(e) => handleInputChange(row, e)}
                className="h-8 text-sm"
              />
            </TableCell>
          );
        }
        return (
          <TableCell key={col}>
            <Input
              type="text"
              name={col}
              value={row[col] || ""}
              onChange={(e) => handleInputChange(row, e)}
              className="h-8 text-sm"
            />
          </TableCell>
        );
      })}
      <TableCell className="text-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  isolateRow(row.dbId);
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Isolate this element in viewer</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
});

// Encabezado de grupo por código
const CodeHeaderRow = React.memo(function CodeHeaderRow({
  discipline,
  code,
  rows,
  toggleCodes,
  collapsed,
  isolateCode,
  hideCode,
  visibleColumns,
}) {
  return (
    <TableRow className="uppercase bg-slate-50 text-black transition-colors hover:bg-[#2ea3e3] hover:text-white">
      <TableCell colSpan={visibleColumns.length} className="px-4 py-2 font-bold">
        <button onClick={() => toggleCodes(discipline, code)} className="mr-2 text-blue-600 underline">
          {collapsed ? "[ + ]" : "[ - ]"}
        </button>
        {code}
      </TableCell>
      <TableCell className="px-4 py-2 text-right">
        <div className="flex justify-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); isolateCode(); }}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Show code elements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); hideCode(); }}>
                  <EyeOff className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Hide code elements</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  );
});

// Footer para cada grupo de código
const CodeFooterRow = React.memo(function CodeFooterRow({
  discipline,
  code,
  visibleColumns,
  groupExtraData,
  handleGroupExtraDataChange,
  calculateGroupTotal,
}) {
  return (
    <TableRow className="bg-gray-100 text-xs font-bold">
      {visibleColumns.map((col, idx) => {
        if (idx === 0) {
          return (
            <TableCell key={col} className="px-4 py-2 text-right">
              Totals {code}:
            </TableCell>
          );
        } else if (["Description", "Unit", "Quantity", "UnitPrice", "TotalCost"].includes(col)) {
          if (col === "Unit") {
            return (
              <TableCell key={col} className="px-4 py-2">
                <select
                  value={(groupExtraData[`${discipline}||${code}`]?.[col]) || ""}
                  onChange={(e) => handleGroupExtraDataChange(`${discipline}||${code}`, col, e.target.value)}
                  className="bg-transparent w-full border rounded text-xs"
                >
                  <option value="">Select Unit</option>
                  <option value="m">m</option>
                  <option value="m2">m²</option>
                  <option value="m3">m³</option>
                  <option value="kg/m">kg/m</option>
                </select>
              </TableCell>
            );
          } else {
            return (
              <TableCell key={col} className="px-4 py-2">
                <input
                  type={["Quantity", "UnitPrice"].includes(col) ? "number" : "text"}
                  placeholder={col}
                  value={(groupExtraData[`${discipline}||${code}`]?.[col]) || ""}
                  onChange={(e) => handleGroupExtraDataChange(`${discipline}||${code}`, col, e.target.value)}
                  className="bg-transparent w-full text-xs"
                />
              </TableCell>
            );
          }
        } else {
          return <TableCell key={col} className="px-4 py-2"></TableCell>;
        }
      })}
      <TableCell className="px-4 py-2 text-right">
        {calculateGroupTotal(`${discipline}||${code}`)}
      </TableCell>
    </TableRow>
  );
});

// --- NUEVO ---
// Componente PartialTotalsRow: se muestra cuando no hay agrupación por código y sirve como totales parciales
const PartialTotalsRow = React.memo(function PartialTotalsRow({
  discipline,
  visibleColumns,
  totalsByDiscipline,
}) {
  const formatTotal = useCallback((col, val) => {
    if (!numericColumns.includes(col.toUpperCase())) return "";
    if (val == null || val === "") return "";
    const num = parseFloat(val).toFixed(2);
    switch (col.toUpperCase()) {
      case "LENGTH":
      case "WIDTH":
      case "HEIGHT":
      case "PERIMETER":
      case "THICKNESS":
        return `${num} m`;
      case "AREA":
        return `${num} m²`;
      case "VOLUME":
        return `${num} m³`;
      default:
        return num;
    }
  }, []);

  return (
    <TableRow className="bg-gray-100 text-xs font-bold">
      <TableCell className="px-4 py-2 text-right">
        Partial Totals:
      </TableCell>
      {visibleColumns.slice(1).map((col) => (
        <TableCell key={col} className="px-4 py-2 text-right">
          {formatTotal(col, totalsByDiscipline?.[discipline]?.[col] ?? 0)}
        </TableCell>
      ))}
      {/* Add empty cell for the actions column */}
      <TableCell></TableCell>
    </TableRow>
  );
});

// Footer de disciplina para totales parciales
const DisciplineFooterRow = React.memo(function DisciplineFooterRow({
  disc,
  visibleColumns,
  totalsByDiscipline,
}) {
  const formatTotal = useCallback((col, val) => {
    if (!numericColumns.includes(col.toUpperCase())) return "";
    if (val == null || val === "") return "";
    const num = parseFloat(val).toFixed(2);
    switch (col.toUpperCase()) {
      case "LENGTH":
      case "WIDTH":
      case "HEIGHT":
      case "PERIMETER":
      case "THICKNESS":
        return `${num} m`;
      case "AREA":
        return `${num} m²`;
      case "VOLUME":
        return `${num} m³`;
      default:
        return num;
    }
  }, []);
  return (
    <TableRow className="bg-gray-100 text-xs font-bold">
      <TableCell className="px-4 py-2 text-right" colSpan={visibleColumns.length}>
        Discipline Totals:
      </TableCell>
      {visibleColumns.slice(1).map((col) => (
        <TableCell key={col} className="px-4 py-2 text-right">
          {formatTotal(col, totalsByDiscipline?.[disc]?.[col] ?? 0)}
        </TableCell>
      ))}
    </TableRow>
  );
});

// Footer global (Grand Totals)
const GrandTotalsRow = React.memo(function GrandTotalsRow({
  visibleColumns,
  grandTotalsValue,
  grandTotalsObj,
}) {
  const formatTotal = useCallback((col, val) => {
    if (!numericColumns.includes(col.toUpperCase())) return "";
    if (val == null || val === "") return "";
    const num = parseFloat(val).toFixed(2);
    switch (col.toUpperCase()) {
      case "LENGTH":
      case "WIDTH":
      case "HEIGHT":
      case "PERIMETER":
      case "THICKNESS":
        return `${num} m`;
      case "AREA":
        return `${num} m²`;
      case "VOLUME":
        return `${num} m³`;
      default:
        return num;
    }
  }, []);
  return (
    <tfoot>
      <TableRow className="bg-slate-200 font-bold">
        {visibleColumns.map((col, idx) => {
          if (idx === 0)
            return <TableCell key="grand-label">Grand Totals</TableCell>;
          const val =
            col.toLowerCase() === "totalcost"
              ? grandTotalsValue
              : grandTotalsObj?.[col] ?? 0;
          return <TableCell key={col}>{formatTotal(col, val)}</TableCell>;
        })}
        <TableCell />
      </TableRow>
    </tfoot>
  );
});

// --------------------
// COMPONENTE PRINCIPAL: Database5DTable
// --------------------
const Database5DTable = ({
  data,
  totalsByDiscipline,
  grandTotals,
  handleInputChange,
  handleDisciplineChange,
  handleElementTypeChange,
  disciplineOptions,
  elementtype,
  isolateObjectsInViewer,
  hideObjectsInViewer,
  collapsedDisciplines,
  setCollapsedDisciplines,
  selectedRows,
  setSelectedRows,
  lastClickedRowNumber,
  setLastClickedRowNumber,
  groupExtraData,
  handleGroupExtraDataChange,
  calculateGroupTotal,
}) => {
  // Estados para colapso por disciplina y código
  const [collapsedDisciplinesState, setCollapsedDisciplinesState] = useState(collapsedDisciplines);
  const [collapsedCodes, setCollapsedCodes] = useState({});

  const toggleCodes = useCallback((discipline, code) => {
    const key = `${discipline}||${code}`;
    setCollapsedCodes((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toast = useToast();

  // Sección activa para columnas según el tab
  const [activeSection, setActiveSection] = useState("general");
  const visibleColumns = columnGroups[activeSection] || [];

  // Filtro
  const [filterText, setFilterText] = useState("");
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (!filterText.trim()) return data;
    const lowerFilter = filterText.toLowerCase();
    return data.filter((row) => {
      const typeName = row.TypeName?.toLowerCase() || "";
      const desc = row.Description?.toLowerCase() || "";
      return typeName.includes(lowerFilter) || desc.includes(lowerFilter);
    });
  }, [data, filterText]);

  // Agrupación por código
  const hasCodeGrouping = useMemo(
    () => data.some((row) => row.Code && row.Code.trim() !== ""),
    [data]
  );

  // Construcción de las filas a mostrar según agrupación
  const displayRows = useMemo(() => {
    const rows = [];
    if (hasCodeGrouping) {
      const nestedData = data.reduce((acc, row) => {
        const disc = row.Discipline || "No Discipline";
        const code = row.Code || "No Code";
        if (!acc[disc]) acc[disc] = {};
        if (!acc[disc][code]) acc[disc][code] = [];
        acc[disc][code].push(row);
        return acc;
      }, {});
      
      Object.entries(nestedData).forEach(([disc, codes]) => {
        const totalRowsInDisc = Object.values(codes).reduce((sum, arr) => sum + arr.length, 0);
        rows.push({ type: "disciplineHeader", discipline: disc, count: totalRowsInDisc });
        
        // Only process codes if discipline isn't collapsed
        if (!collapsedDisciplinesState[disc]) {
          Object.entries(codes).forEach(([code, rowsArr]) => {
            rows.push({ type: "codeHeader", discipline: disc, code, rows: rowsArr });
            const collapseKey = `${disc}||${code}`;
            if (!collapsedCodes[collapseKey]) {
              rowsArr.forEach((row, index) =>
                rows.push({ type: "element", row, index, discipline: disc, code })
              );
            }
            // Always add the code footer if the discipline isn't collapsed
            rows.push({ type: "codeFooter", discipline: disc, code });
          });
        }
        
        
      });
    } else {
      const grouped = data.reduce((acc, row) => {
        const disc = row.Discipline || "No Discipline";
        if (!acc[disc]) acc[disc] = [];
        acc[disc].push(row);
        return acc;
      }, {});
      
      Object.entries(grouped).forEach(([disc, rowsArr]) => {
        rows.push({ type: "header", disc, count: rowsArr.length });
        if (!collapsedDisciplinesState[disc]) {
          rowsArr.forEach((row, idx) => rows.push({ type: "element", row, idx, disc }));
          rows.push({ type: "partialTotals", disc });
        }
      });
    }
    
    return rows;
  }, [data, collapsedDisciplinesState, collapsedCodes, hasCodeGrouping]);

  // Paginación
  const perPage = 250;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(displayRows.length / perPage)), [displayRows, perPage]);
  const [page, setPage] = useState(1);
  const paginatedRows = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return displayRows.slice(startIndex, startIndex + perPage);
  }, [displayRows, page, perPage]);

  // Otros controles (lastClickedRowNumber se recibe por props)
  const [hoverColor, setHoverColor] = useState("bg-slate-100");
  const [sortDisciplinesAsc, setSortDisciplinesAsc] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchDbId, setSearchDbId] = useState("");

  const simulateLoading = useCallback((callback) => {
    setLoading(true);
    setTimeout(() => {
      if (typeof callback === "function") callback();
      setLoading(false);
    }, 300);
  }, []);

  const handleExpandAll = useCallback(() => {
    const newState = {};
    Object.keys(collapsedDisciplinesState).forEach((d) => (newState[d] = false));
    const allDisciplines = [...new Set(data.map((r) => r.Discipline || "No Discipline"))];
    allDisciplines.forEach((d) => (newState[d] = false));
    setCollapsedDisciplinesState(newState);
  }, [collapsedDisciplinesState, data]);

  const handleCollapseAll = useCallback(() => {
    const newState = {};
    const allDisciplines = [...new Set(data.map((r) => r.Discipline || "No Discipline"))];
    allDisciplines.forEach((d) => (newState[d] = true));
    setCollapsedDisciplinesState(newState);
  }, [data]);

  const handleToggleSort = useCallback(() => {
    setSortDisciplinesAsc((prev) => !prev);
  }, []);

  const handleChangeSection = useCallback(
    (section) => {
      simulateLoading(() => {
        setActiveSection(section);
        setPage(1);
      });
    },
    [simulateLoading]
  );

  const handleNextPage = useCallback(() => {
    if (page >= totalPages) return;
    simulateLoading(() => setPage((p) => p + 1));
  }, [page, totalPages, simulateLoading]);

  const handlePrevPage = useCallback(() => {
    if (page <= 1) return;
    simulateLoading(() => setPage((p) => p - 1));
  }, [page, simulateLoading]);

  const handleFirstPage = useCallback(() => {
    if (page <= 1) return;
    simulateLoading(() => setPage(1));
  }, [page, simulateLoading]);

  const handleLastPage = useCallback(() => {
    if (page >= totalPages) return;
    simulateLoading(() => setPage(totalPages));
  }, [page, totalPages, simulateLoading]);

  const handleDbIdSearch = useCallback(() => {
    const numericSearch = Number.parseInt(searchDbId, 10);
    if (isNaN(numericSearch)) return;
    const found = data.find((r) => parseInt(r.dbId, 10) === numericSearch);
    if (found) {
      setSelectedRows([found.dbId]);
      toast.toast({
        title: "Element found",
        description: `DbId ${searchDbId} has been highlighted`,
        variant: "success",
      });
    } else {
      setSelectedRows([]);
      toast.toast({
        title: "Element not found",
        description: `DbId ${searchDbId} not found in data`,
        variant: "destructive",
      });
    }
  }, [searchDbId, data, setSelectedRows, toast]);

  const isRowSelected = useCallback(
    (dbId) => selectedRows.includes(dbId),
    [selectedRows]
  );

  const handleRowClick = useCallback(
    (row, e) => {
      if (e.shiftKey && lastClickedRowNumber !== null) {
        const minRow = Math.min(lastClickedRowNumber, row.rowNumber);
        const maxRow = Math.max(lastClickedRowNumber, row.rowNumber);
        const newSelected = data
          .filter((item) => item.rowNumber >= minRow && item.rowNumber <= maxRow)
          .map((item) => item.dbId);
        setSelectedRows(newSelected);
      } else {
        setSelectedRows([row.dbId]);
        setLastClickedRowNumber(row.rowNumber);
      }
    },
    [data, lastClickedRowNumber, setSelectedRows, setLastClickedRowNumber]
  );

  const isolateDiscipline = useCallback(
    (rows) => {
      isolateObjectsInViewer(window.data5Dviewer, rows.map((r) => r.dbId));
    },
    [isolateObjectsInViewer]
  );

  const hideDisciplineAction = useCallback(
      (rows) => {
        hideObjectsInViewer(window.data5Dviewer, rows.map((r) => r.dbId));
      },
      [hideObjectsInViewer]
    );

  const isolateRow = useCallback(
    (dbId) => {
      isolateObjectsInViewer(window.data5Dviewer, [dbId]);
    },
    [isolateObjectsInViewer]
  );

  const tableContainerRef = useRef(null);
  const handleScrollUp = useCallback(() => {
    if (tableContainerRef.current) tableContainerRef.current.scrollTop -= 100;
  }, []);
  const handleScrollDown = useCallback(() => {
    if (tableContainerRef.current) tableContainerRef.current.scrollTop += 100;
  }, []);

  const nestedGroupData = useMemo(() => {
    return data.reduce((acc, row) => {
      const discipline = row.Discipline || "No Discipline";
      const code = row.Code || "No Code";
      if (!acc[discipline]) acc[discipline] = {};
      if (!acc[discipline][code]) acc[discipline][code] = [];
      acc[discipline][code].push(row);
      return acc;
    }, {});
  }, [data]);

  const getGrandTotalCost = useMemo(() => {
    let sum = 0;
    Object.keys(nestedGroupData).forEach((discipline) => {
      Object.keys(nestedGroupData[discipline]).forEach((code) => {
        const groupKey = `${discipline}||${code}`;
        sum += parseFloat(calculateGroupTotal(groupKey)) || 0;
      });
    });
    return sum.toFixed(2);
  }, [nestedGroupData, calculateGroupTotal]);

  return (
    <Card className="w-full shadow-lg border-0 h-full flex flex-col">
      <CardHeader className="bg-slate-50 py-3 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-bold">5D Model Data Table</CardTitle>
        <div className="text-sm text-muted-foreground">
          {filteredData.length} elements •{" "}
          {hasCodeGrouping
            ? "Grouped by Code"
            : `${Object.keys(
                data.reduce((acc, row) => {
                  const disc = row.Discipline || "No Discipline";
                  acc[disc] = true;
                  return acc;
                }, {})
              ).length} disciplines`}
        </div>
      </CardHeader>

      <TableControls
        activeSection={activeSection}
        handleChangeSection={handleChangeSection}
        handleToggleSort={handleToggleSort}
        sortDisciplinesAsc={sortDisciplinesAsc}
        handleExpandAll={handleExpandAll}
        handleCollapseAll={handleCollapseAll}
        searchDbId={searchDbId}
        setSearchDbId={setSearchDbId}
        handleDbIdSearch={handleDbIdSearch}
        filterText={filterText}
        setFilterText={setFilterText}
        hoverColor={hoverColor}
        setHoverColor={setHoverColor}
        handleScrollUp={handleScrollUp}
        handleScrollDown={handleScrollDown}
        page={page}
        totalPages={totalPages}
        handlePrevPage={handlePrevPage}
        handleNextPage={handleNextPage}
        handleFirstPage={handleFirstPage}
        handleLastPage={handleLastPage}
      />

      <CardContent className="p-0 flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Loading data...</span>
            </div>
          </div>
        ) : (
          <div ref={tableContainerRef} className="h-full w-full overflow-y-auto" style={{ maxHeight: "100%" }}>
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow className="min-h-[48px]">
                  {visibleColumns.map((col) => (
                    <TableHead key={col} className="whitespace-normal font-bold">
                      {col === "rowNumber"
                        ? "ROW #"
                        : col.replace(/([A-Z])/g, " $1").trim().toUpperCase()}
                    </TableHead>
                  ))}
                  <TableHead className="text-right font-bold">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <p>No results found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((item, idx) => {
                    switch (item.type) {
                      case "disciplineHeader":
                        return (
                          <DisciplineHeaderRow
                            key={`hdr-${item.discipline}`}
                            discipline={item.discipline}
                            rowsCount={item.count}
                            isDiscCollapsed={collapsedDisciplinesState[item.discipline] || false}
                            visibleColsCount={visibleColumns.length}
                            onToggle={() =>
                              setCollapsedDisciplinesState((prev) => ({
                                ...prev,
                                [item.discipline]: !prev[item.discipline],
                              }))
                            }
                            isolateDiscipline={() => {
                              const dbIds = data
                                .filter((row) => (row.Discipline || "No Discipline") === item.discipline)
                                .map((row) => row.dbId);
                              isolateObjectsInViewer(window.data5Dviewer, dbIds);
                            }}
                            hideDiscipline={() => {
                              const dbIds = data
                                .filter((row) => (row.Discipline || "No Discipline") === item.discipline)
                                .map((row) => row.dbId);
                              hideObjectsInViewer(window.data5Dviewer, dbIds);
                            }}
                          />
                        );
                      case "codeHeader":
                        return (
                          <CodeHeaderRow
                            key={`code-${item.discipline}-${item.code}`}
                            discipline={item.discipline}
                            code={item.code}
                            rows={item.rows}
                            toggleCodes={toggleCodes}
                            collapsed={collapsedCodes[`${item.discipline}||${item.code}`] || false}
                            isolateCode={() => {
                              const dbIds = item.rows.map((row) => row.dbId);
                              isolateObjectsInViewer(window.data5Dviewer, dbIds);
                            }}
                            hideCode={() => {
                              const dbIds = item.rows.map((row) => row.dbId);
                              hideObjectsInViewer(window.data5Dviewer, dbIds);
                            }}
                            visibleColumns={visibleColumns}
                          />
                        );
                      case "element":
                        return (
                          <ElementRow
                            key={`elm-${item.row.dbId || idx}`}
                            row={item.row}
                            index={item.index}
                            isSelected={isRowSelected(item.row.dbId)}
                            visibleColumns={visibleColumns}
                            handleInputChange={handleInputChange}
                            handleDisciplineChange={handleDisciplineChange}
                            handleElementTypeChange={handleElementTypeChange}
                            disciplineOptions={disciplineOptions}
                            elementtype={elementtype}
                            isolateRow={isolateRow}
                            onRowClick={(e) => handleRowClick(item.row, e)}
                            isDimensionsView={activeSection === "dimensions"}
                            hoverColor={hoverColor}
                          />
                        );
                      case "codeFooter":
                        return (
                          <CodeFooterRow
                            key={`codefooter-${item.discipline}-${item.code}`}
                            discipline={item.discipline}
                            code={item.code}
                            visibleColumns={visibleColumns}
                            groupExtraData={groupExtraData}
                            handleGroupExtraDataChange={handleGroupExtraDataChange}
                            calculateGroupTotal={calculateGroupTotal}
                          />
                        );
                      case "disciplineFooter":
                        return (
                          <DisciplineFooterRow
                            key={`discFooter-${item.disc}`}
                            disc={item.disc}
                            visibleColumns={visibleColumns}
                            totalsByDiscipline={totalsByDiscipline}
                          />
                        );
                      case "header":
                        return (
                          <DisciplineHeaderRow
                            key={`hdr-${item.disc}`}
                            discipline={item.disc}
                            rowsCount={item.count}
                            isDiscCollapsed={collapsedDisciplines[item.disc] || false}
                            visibleColsCount={visibleColumns.length}
                            onToggle={() =>
                              setCollapsedDisciplines((prev) => ({
                                ...prev,
                                [item.disc]: !prev[item.disc],
                              }))
                            }
                            isolateDiscipline={() => {
                              const dbIds = data
                                .filter((row) => (row.Discipline || "No Discipline") === item.disc)
                                .map((row) => row.dbId);
                              isolateDiscipline(window.data5Dviewer, dbIds);
                            }}
                            hideDiscipline={() => {
                              const dbIds = data
                                .filter((row) => (row.Discipline || "No Discipline") === item.disc)
                                .map((row) => row.dbId);
                              hideObjectsInViewer(window.data5Dviewer, dbIds);
                            }}
                          />
                        );
                      case "partialTotals":
                        return (
                          <PartialTotalsRow
                            key={`partial-${item.disc}`}
                            discipline={item.disc}
                            visibleColumns={visibleColumns}
                            totalsByDiscipline={totalsByDiscipline}
                          />
                        );
                      default:
                        return null;
                    }
                  })
                )}
              </TableBody>

              <GrandTotalsRow
                visibleColumns={visibleColumns}
                grandTotals={grandTotals}
                grandTotalsValue={getGrandTotalCost}
                grandTotalsObj={{}}
              />
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default React.memo(Database5DTable);
