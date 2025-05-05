import React, { useEffect, useState, useRef } from "react";
import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  startOfDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../lib/task.utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function TaskManagementGantt({ tasks = [] }) {
  const [minStart, setMinStart] = useState(new Date());
  const [maxEnd, setMaxEnd]     = useState(new Date());
  const [visibleDays, setVisibleDays] = useState([]);
  const containerRef = useRef(null);

  // 1) calcular minStart y maxEnd
  useEffect(() => {
    if (!tasks.length) return;
    let minD = null, maxD = null;
    tasks.forEach((t) => {
      if (!t.startDate || !t.endDate) return;
      const s = parseISO(t.startDate);
      const e = parseISO(t.endDate);
      minD = !minD || s < minD ? s : minD;
      maxD = !maxD || e > maxD ? e : maxD;
    });
    if (minD && maxD) {
      setMinStart(startOfDay(minD));
      setMaxEnd(startOfDay(maxD));
    }
  }, [tasks]);

  // 2) generar lista de días
  useEffect(() => {
    const days = [];
    const total = differenceInDays(maxEnd, minStart) + 1;
    for (let i = 0; i < total; i++) {
      days.push(addDays(minStart, i));
    }
    setVisibleDays(days);
  }, [minStart, maxEnd]);

  const totalDays = visibleDays.length;

  const getBarStyle = (t) => {
    if (!t.startDate || !t.endDate) return { display: "none" };
    const s = parseISO(t.startDate);
    const e = parseISO(t.endDate);
    const offset = differenceInDays(s, minStart);
    const span   = differenceInDays(e, s) + 1;
    return {
      left:  `${(offset  / totalDays) * 100}%`,
      width: `${(span    / totalDays) * 100}%`,
      display: span > 0 ? "block" : "none",
    };
  };

  return (
    <div className="rounded-md border bg-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Diagrama de Gantt</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setMinStart(addDays(minStart, -7))}>
            <ChevronLeft className="h-4 w-4 mr-1"/> Semana atrás
          </Button>
          <Button variant="outline" size="sm" onClick={() => { /* opcional: volver a range completo */ }}>
            Todo
          </Button>
          <Button variant="outline" size="sm" onClick={() => setMinStart(addDays(minStart, 7))}>
            Semana adelante <ChevronRight className="h-4 w-4 ml-1"/>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto" ref={containerRef}>
        <div style={{ minWidth: `${totalDays * 40}px` }}>
          {/* Header de días */}
          <div className="flex border-b bg-gray-50 sticky top-0 z-10">
            <div className="w-[200px] p-2 border-r font-medium">Tarea</div>
            {visibleDays.map((day, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 p-1 text-xs text-center border-r",
                  format(day, "EEEE", { locale: es }).startsWith("sábado") ||
                  format(day, "EEEE", { locale: es }).startsWith("domingo")
                    ? "bg-gray-100"
                    : ""
                )}
              >
                <div>{format(day, "E", { locale: es })}</div>
                <div>{format(day, "d")}</div>
              </div>
            ))}
          </div>

          {/* Filas + barras */}
          <div className="relative">
            {tasks.map((t, idx) => {
              const style = getBarStyle(t);
              return (
                <div key={t.id} className="flex items-center h-10 border-b">
                  <div className="w-[200px] p-2 truncate">{t.title}</div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute h-6 bg-purple-500 rounded cursor-pointer"
                          style={{
                            ...style,
                            top: idx * 40 + 2, // separa las filas
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p><strong>{t.title}</strong></p>
                        <p>
                          {format(parseISO(t.startDate), "P", { locale: es })} –{" "}
                          {format(parseISO(t.endDate),   "P", { locale: es })}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}