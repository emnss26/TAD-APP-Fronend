import { useState, useEffect, useMemo, useRef } from "react";
import {
  format,
  parseISO,
  differenceInDays,
  isAfter,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Search, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// Meses abreviados
const MONTH_ACRONYMS = {
  "01": "JAN",
  "02": "FEB",
  "03": "MAR",
  "04": "APR",
  "05": "MAY",
  "06": "JUN",
  "07": "JUL",
  "08": "AUG",
  "09": "SEP",
  10: "OCT",
  11: "NOV",
  12: "DEC",
};

export function SubmittalsGanttChart({ submittals }) {
  const [today] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalDays, setTotalDays] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [filteredSubmittals, setFilteredSubmittals] = useState([]);
  const timelineRef = useRef(null);
  const namesColumnRef = useRef(null);

  // Scroll sincronizado
  const handleNamesScroll = (e) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };
  const handleTimelineScroll = (e) => {
    if (namesColumnRef.current) {
      namesColumnRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Filtrado: búsqueda + estado
  useEffect(() => {
    let list = [...submittals];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.specDetails?.title.toLowerCase().includes(q) ||
          s.stateId.toLowerCase().includes(q) ||
          s.assignedTo?.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter(
        (s) => s.stateId.toLowerCase() === statusFilter
      );
    }

    setFilteredSubmittals(list);
  }, [submittals, searchTerm, statusFilter]);

  // Agrupar por assignedTo
  const subsByUser = useMemo(() => {
    const grp = {};
    filteredSubmittals.forEach((s) => {
      const user = s.assignedTo || "Sin asignar";
      if (!grp[user]) grp[user] = [];
      grp[user].push(s);
    });
    return grp;
  }, [filteredSubmittals]);

  // Calcular rango de fechas
  useEffect(() => {
    if (!filteredSubmittals.length) return;
    let minD = null,
      maxD = null;

    filteredSubmittals.forEach((s) => {
      const created = parseISO(s.createdAt);
      const published = s.publishedAt ? parseISO(s.publishedAt) : null;
      const end = published || today;

      if (!minD || created < minD) minD = created;
      if (!maxD || end > maxD) maxD = end;

      // Si aún no publicado y se pasó de hoy
      if (!published && isAfter(today, end)) {
        maxD = today;
      }
    });

    if (minD && maxD) {
      const s = startOfMonth(minD);
      s.setDate(s.getDate() - 2);
      const e = endOfMonth(maxD);
      e.setDate(e.getDate() + 2);
      setStartDate(s);
      setEndDate(e);
      setTotalDays(differenceInDays(e, s) + 1);
    }
  }, [filteredSubmittals, today]);

  // Años en encabezado
  const years = useMemo(() => {
    if (!startDate || !endDate) return [];
    const setY = new Set(), cursor = new Date(startDate);
    while (cursor <= endDate) {
      setY.add(format(cursor, "yyyy"));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return Array.from(setY).map((y) => {
      const num = +y;
      const ys = new Date(num, 0, 1) < startDate ? startDate : new Date(num, 0, 1);
      const ye = new Date(num, 11, 31) > endDate ? endDate : new Date(num, 11, 31);
      return {
        year: y,
        startDay: differenceInDays(ys, startDate),
        width: differenceInDays(ye, ys) + 1,
      };
    });
  }, [startDate, endDate]);

  // Meses en encabezado
  const monthMarkers = useMemo(() => {
    if (!startDate || !endDate) return [];
    return eachMonthOfInterval({ start: startDate, end: endDate }).map((d) => ({
      month: MONTH_ACRONYMS[format(d, "MM")],
      date: d,
    }));
  }, [startDate, endDate]);

  // Posición y ancho de barra
  const calculateBar = (s) => {
    if (!startDate) return { left: 0, width: 0, overdue: 0 };
    const created = parseISO(s.createdAt);
    const published = s.publishedAt ? parseISO(s.publishedAt) : null;
    const end = published || today;
    const overdueDays = !published && isAfter(today, end) ? differenceInDays(today, end) : 0;
    const offset = Math.max(0, differenceInDays(created, startDate));
    const duration = differenceInDays(end, created);
    return {
      left: (offset / totalDays) * 100,
      width: (duration / totalDays) * 100,
      overdue: (overdueDays / totalDays) * 100,
    };
  };

  if (!startDate) {
    return (
      <div className="flex justify-center items-center h-64">
        Cargando Gantt de Submittals...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controles */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-gradient-to-r from-[#2ea3e3] to-[#1a7bb9] text-white px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
          <Calendar className="h-4 w-4" />
          <span>{format(today, "d MMM yyyy", { locale: es })}</span>
        </div>
        <div className="flex items-center space-x-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar Submittals..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="waiting for submission">Waiting</SelectItem>
              <SelectItem value="in review">In Review</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Años / Meses */}
      <div className="flex">
        <div className="w-1/4 min-w-[250px]" />
        <div className="flex-1 min-w-[750px]">
          <div className="h-8 relative">
            {years.map((y, i) => (
              <div
                key={i}
                className="absolute h-full flex items-center justify-center text-sm font-bold text-gray-700 border-l border-gray-200 first:border-l-0 bg-gray-50"
                style={{
                  left: `${(y.startDay / totalDays) * 100}%`,
                  width: `${(y.width / totalDays) * 100}%`,
                }}
              >{y.year}</div>
            ))}
          </div>
          <div className="h-8 flex">
            {monthMarkers.map((m, i) => (
              <div
                key={i}
                className="h-full flex-1 flex items-center justify-center text-sm font-medium text-gray-600 border-l border-gray-200 first:border-l-0"
              >{m.month}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt */}
      <div className="flex">
        {/* Nombres */}
        <div
          ref={namesColumnRef}
          onScroll={handleNamesScroll}
          className="w-1/4 min-w-[250px] max-h-[600px] overflow-y-auto pr-2 border-r border-gray-200 bg-white z-10"
          style={{ position: "sticky", left: 0 }}
        >
          <div className="space-y-6">
            {Object.entries(subsByUser).map(([user, list]) => (
              <div key={user} className="mb-4">
                <div className="font-bold text-lg text-gray-800 mb-2">{user}</div>
                <div className="space-y-4">
                  {list.map((s) => (
                    <div key={s.id} className="h-12 flex items-center">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-800">
                          {s.title}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge className={cn("text-[10px] px-1.5 py-0.5", {
                            "bg-yellow-500": s.stateId === "Waiting for submission",
                            "bg-blue-500": s.stateId === "In review",
                            "bg-green-500": s.stateId === "Submitted",
                            "bg-purple-500": s.stateId === "Reviewed",
                            "bg-gray-500": s.stateId === "Closed",
                          })}>
                            {s.stateId}
                          </Badge>
                          {s.specDetails?.title && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                              {s.specDetails.title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cronograma */}
        <div
          ref={timelineRef}
          onScroll={handleTimelineScroll}
          className="flex-1 overflow-x-auto overflow-y-auto max-h-[600px]"
        >
          <div className="min-w-[750px]">
            {/* Línea TODAY */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 border-l-2 border-rose-500 z-10"
                style={{
                  left: `${(differenceInDays(today, startDate) / totalDays) * 100}%`,
                  height: `${Object.values(subsByUser).reduce(
                    (sum, arr) => sum + arr.length * 36 + 40,
                    0
                  )}px`,
                }}
              >
                <div className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm">
                  TODAY
                </div>
              </div>
            </div>

            {/* Barras */}
            <div className="space-y-6">
              {Object.entries(subsByUser).map(([user, list]) => (
                <div key={user} className="mb-4">
                  <div className="h-8 mb-2" />
                  <div className="space-y-4">
                    {list.map((s) => {
                      const { left, width, overdue } = calculateBar(s);
                      const created = parseISO(s.createdAt);
                      const published = s.publishedAt ? parseISO(s.publishedAt) : null;

                      return (
                        <div key={s.id} className="h-12 relative">
                          <div
                            className="absolute bottom-full mb-1 text-xs text-gray-500"
                            style={{ left: `${left}%` }}
                          >
                            {format(created, "d MMM", { locale: es })}
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute flex z-10"
                                  style={{
                                    top: "6px",
                                    left: `${left}%`,
                                    width: `${width + overdue}%`,
                                  }}
                                >
                                  <div
                                    className="bg-gradient-to-r from-[#2ea3e3] to-[#1a7bb9] rounded-l-full shadow-sm"
                                    style={{
                                      width: overdue > 0
                                        ? `${(width / (width + overdue)) * 100}%`
                                        : "100%",
                                      height: "8px",
                                    }}
                                  />
                                  {overdue > 0 && (
                                    <div
                                      className="bg-gradient-to-r from-[#a90b83] to-black rounded-r-full shadow-sm"
                                      style={{
                                        width: `${(overdue / (width + overdue)) * 100}%`,
                                        height: "8px",
                                      }}
                                    />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p><strong>Submittal:</strong> {s.title}</p>
                                  <p><strong>Creado:</strong> {format(created, "dd/MM/yyyy")}</p>
                                  {published && (
                                    <p><strong>Publicado:</strong> {format(published, "dd/MM/yyyy")}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {published && (
                            <div
                              className="absolute text-xs text-gray-500"
                              style={{ top: "24px", left: `${left + width}%` }}
                            >
                              {format(published, "d MMM", { locale: es })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}