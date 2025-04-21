"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  format,
  parseISO,
  differenceInDays,
  isAfter,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval
} from "date-fns"
import { es } from "date-fns/locale"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "../ui/tooltip"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"

// Acrónimos de meses en inglés
const MONTH_ACRONYMS = {
  "01": "JAN", "02": "FEB", "03": "MAR", "04": "APR",
  "05": "MAY", "06": "JUN", "07": "JUL", "08": "AUG",
  "09": "SEP", "10": "OCT", "11": "NOV", "12": "DEC"
}

export function RFIsGanttChart({ rfis }) {
  const [today] = useState(new Date())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [totalDays, setTotalDays] = useState(0)
  const timelineRef = useRef(null)
  const namesColumnRef = useRef(null)

  // Sólo RFIs abiertas
  const filteredRFIs = useMemo(
    () => rfis.filter(r => r.status === "open"),
    [rfis]
  )

  // Scroll sincronizado
  const handleNamesScroll = e => {
    if (timelineRef.current) timelineRef.current.scrollTop = e.currentTarget.scrollTop
  }
  const handleTimelineScroll = e => {
    if (namesColumnRef.current) namesColumnRef.current.scrollTop = e.currentTarget.scrollTop
  }

  // Agrupar por assignedTo
  const rfisByUser = useMemo(() => {
    const grp = {}
    filteredRFIs.forEach(r => {
      const key = r.assignedTo || "Sin asignar"
      ;(grp[key] = grp[key] || []).push(r)
    })
    return grp
  }, [filteredRFIs])

  // Calcular rango fechas sobre filteredRFIs
  useEffect(() => {
    if (!filteredRFIs.length) return
    let minD = null, maxD = null

    filteredRFIs.forEach(r => {
      const c = parseISO(r.createdAt)
      const d = r.dueDate ? parseISO(r.dueDate) : today
      if (!minD || c < minD) minD = c
      if (!maxD || d > maxD) maxD = d
      // si está vencida
      if (isAfter(today, d)) maxD = today
    })

    if (minD && maxD) {
      const s = startOfMonth(minD); s.setDate(s.getDate() - 2)
      const e = endOfMonth(maxD);   e.setDate(e.getDate() + 2)
      setStartDate(s)
      setEndDate(e)
      setTotalDays(differenceInDays(e, s) + 1)
    }
  }, [filteredRFIs, today])

  // Años para encabezado
  const years = useMemo(() => {
    if (!startDate || !endDate) return []
    const seen = new Set(), cursor = new Date(startDate)
    while (cursor <= endDate) {
      seen.add(format(cursor, "yyyy"))
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return Array.from(seen).map(y => {
      const yNum = +y
      const ys = new Date(yNum, 0, 1) < startDate ? startDate : new Date(yNum, 0, 1)
      const ye = new Date(yNum, 11, 31) > endDate   ? endDate   : new Date(yNum, 11, 31)
      return {
        year: y,
        startDay: differenceInDays(ys, startDate),
        width:    differenceInDays(ye, ys) + 1
      }
    })
  }, [startDate, endDate])

  // Meses para encabezado
  const monthMarkers = useMemo(() => {
    if (!startDate || !endDate) return []
    return eachMonthOfInterval({ start: startDate, end: endDate }).map(d => ({
      month: MONTH_ACRONYMS[format(d, "MM")],
      date: d
    }))
  }, [startDate, endDate])

  // Calcula left, width y overdue en días
  const calculateBar = r => {
    if (!startDate) return { left: 0, width: 0, overdue: 0 }
    const c = parseISO(r.createdAt)
    const d = r.dueDate ? parseISO(r.dueDate) : today
    const overdueDays = isAfter(today, d) ? differenceInDays(today, d) : 0
    const startOffset = Math.max(0, differenceInDays(c, startDate))
    const duration    = differenceInDays(d, c)
    return {
      left:    (startOffset / totalDays) * 100,
      width:   (duration    / totalDays) * 100,
      overdue: (overdueDays / totalDays) * 100
    }
  }

  if (!startDate) {
    return (
      <div className="flex justify-center items-center h-64">
        Cargando Gantt de RFIs...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Años/Meses */}
      <div className="flex">
        <div className="w-1/4 min-w-[200px]" />
        <div className="flex-1 min-w-[700px]">
          <div className="h-8 relative">
            {years.map((y,i) => (
              <div
                key={i}
                className="absolute h-full flex items-center justify-center text-sm font-bold text-gray-700 border-l border-gray-200 first:border-l-0 bg-gray-50"
                style={{
                  left:  `${(y.startDay / totalDays) * 100}%`,
                  width: `${(y.width    / totalDays) * 100}%`
                }}
              >
                {y.year}
              </div>
            ))}
          </div>
          <div className="h-8 flex">
            {monthMarkers.map((m,i) => (
              <div
                key={i}
                className="h-full flex-1 flex items-center justify-center text-sm font-medium text-gray-600 border-l border-gray-200 first:border-l-0"
              >
                {m.month}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll sincronizado */}
      <div className="flex">
        <div
          ref={namesColumnRef}
          onScroll={handleNamesScroll}
          className="w-1/4 min-w-[200px] max-h-[600px] overflow-y-auto pr-2 border-r border-gray-200 bg-white z-10"
          style={{ position: "sticky", left: 0 }}
        >
          {Object.entries(rfisByUser).map(([user,list]) => (
            <div key={user} className="mb-6">
              <div className="font-bold text-lg text-gray-800 mb-2">{user}</div>
              <div className="space-y-4">
                {list.map(r => (
                  <div key={r.id} className="h-12 flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-800">{r.title}</div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge
                          className={cn("text-[10px] px-1.5 py-0.5", {
                            "bg-yellow-500": r.status === "open"
                          })}
                        >
                          {r.status}
                        </Badge>
                        {r.discipline && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                            {r.discipline}
                          </Badge>
                        )}
                        {r.priority && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                            {r.priority}
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

        <div
          ref={timelineRef}
          onScroll={handleTimelineScroll}
          className="flex-1 overflow-x-auto overflow-y-auto max-h-[600px]"
        >
          <div className="min-w-[700px]">
            {/* TODAY */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 border-l-2 border-red-500 z-10"
                style={{
                  left: `${(differenceInDays(today, startDate) / totalDays) * 100}%`,
                  height: `${
                    Object.values(rfisByUser).reduce((s,a) => s + a.length*36 + 8, 0)
                  }px`
                }}
              >
                <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded shadow-sm">
                  TODAY
                </div>
              </div>
            </div>

            {/* Barras */}
            <div className="space-y-6">
              {Object.entries(rfisByUser).map(([user,list]) => (
                <div key={user} className="mb-6">
                  <div className="h-8" />
                  <div className="space-y-4">
                    {list.map(r => {
                      const { left, width, overdue } = calculateBar(r)
                      const c = parseISO(r.createdAt)
                      const d = r.dueDate ? parseISO(r.dueDate) : null

                      return (
                        <div key={r.id} className="h-12 relative">
                          {/* fecha inicio */}
                          <div
                            className="absolute bottom-full mb-1 text-xs text-gray-500"
                            style={{ left: `${left}%` }}
                          >
                            {format(c, "d MMM", { locale: es })}
                          </div>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="absolute flex z-10"
                                  style={{
                                    top: "6px",
                                    left: `${left}%`,
                                    width: `${width + overdue}%`
                                  }}
                                >
                                  {/* tramo normal */}
                                  <div
                                    className="bg-gradient-to-r from-[#2ea3e3] to-[#1a7bb9] rounded-l-full shadow-sm"
                                    style={{
                                      width:
                                        overdue > 0
                                          ? `${(width / (width + overdue)) * 100}%`
                                          : "100%",
                                      height: "8px"
                                    }}
                                  />
                                  {/* tramo vencido */}
                                  {overdue > 0 && (
                                    <div
                                      className="bg-gradient-to-r from-[#a90b83] to-black rounded-r-full shadow-sm"
                                      style={{
                                        width: `${(overdue / (width + overdue)) * 100}%`,
                                        height: "8px"
                                      }}
                                    />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-sm">
                                  <p><strong>RFI:</strong> {r.title}</p>
                                  <p><strong>Creado:</strong> {format(c, "dd/MM/yyyy")}</p>
                                  {d && <p><strong>Vence:</strong> {format(d, "dd/MM/yyyy")}</p>}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {/* fecha fin */}
                          {d && (
                            <div
                              className="absolute text-xs text-gray-500"
                              style={{
                                top: "24px",
                                left: `${left + width}%`
                              }}
                            >
                              {format(d, "d MMM", { locale: es })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
