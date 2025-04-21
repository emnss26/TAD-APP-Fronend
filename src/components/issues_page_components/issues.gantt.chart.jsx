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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"
import { Input } from "../ui/input"
import { Search, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

// Acrónimos de meses en inglés
const MONTH_ACRONYMS = {
  "01": "JAN", "02": "FEB", "03": "MAR", "04": "APR",
  "05": "MAY", "06": "JUN", "07": "JUL", "08": "AUG",
  "09": "SEP", "10": "OCT", "11": "NOV", "12": "DEC"
}

export function IssuesGanttChart({ issues }) {
  const [today] = useState(new Date())
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [totalDays, setTotalDays] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredIssues, setFilteredIssues] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const timelineRef = useRef(null)
  const namesColumnRef = useRef(null)

  // Manejo de scroll sincronizado
  const handleNamesScroll = (e) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }
  const handleTimelineScroll = (e) => {
    if (namesColumnRef.current) {
      namesColumnRef.current.scrollTop = e.currentTarget.scrollTop
    }
  }

  // Filtrado de issues: sólo abiertos + búsqueda + filtro de estado (si se usa)
  useEffect(() => {
    let result = issues.filter(i => i.status === "open")

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        i =>
          i.title.toLowerCase().includes(term) ||
          i.assignedTo.toLowerCase().includes(term)
      )
    }
    if (statusFilter !== "all") {
      result = result.filter(i => i.status === statusFilter)
    }
    setFilteredIssues(result)
  }, [issues, searchTerm, statusFilter])

  // Agrupar por usuario
  const issuesByUser = useMemo(() => {
    const grp = {}
    filteredIssues.forEach(i => {
      if (!grp[i.assignedTo]) grp[i.assignedTo] = []
      grp[i.assignedTo].push(i)
    })
    return grp
  }, [filteredIssues])

  // Calcular rango fechas
  useEffect(() => {
    if (!filteredIssues.length) return
    let minDate = null, maxDate = null

    filteredIssues.forEach(i => {
      const created = parseISO(i.createdAt)
      const due = i.dueDate ? parseISO(i.dueDate) : null
      if (!minDate || created < minDate) minDate = created
      if (due) {
        if (!maxDate || due > maxDate) maxDate = due
        if (i.status === "open" && isAfter(today, due) && today > maxDate) {
          maxDate = today
        }
      }
    })

    if (minDate && maxDate) {
      const start = startOfMonth(minDate); start.setDate(start.getDate() - 2)
      const end = endOfMonth(maxDate); end.setDate(end.getDate() + 2)
      setStartDate(start)
      setEndDate(end)
      setTotalDays(differenceInDays(end, start) + 1)
    }
  }, [filteredIssues, today])

  // Años para encabezado
  const years = useMemo(() => {
    if (!startDate || !endDate) return []
    const setYears = new Set(), cursor = new Date(startDate)
    while (cursor <= endDate) {
      setYears.add(format(cursor, "yyyy"))
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return Array.from(setYears).map(year => {
      const y = +year
      const yearStart = new Date(y, 0, 1) < startDate ? startDate : new Date(y, 0, 1)
      const yearEnd = new Date(y, 11, 31) > endDate ? endDate : new Date(y, 11, 31)
      return {
        year,
        startDay: differenceInDays(yearStart, startDate),
        width: differenceInDays(yearEnd, yearStart) + 1
      }
    })
  }, [startDate, endDate])

  // Meses para encabezado
  const monthMarkers = useMemo(() => {
    if (!startDate || !endDate) return []
    return eachMonthOfInterval({ start: startDate, end: endDate }).map(date => ({
      month: MONTH_ACRONYMS[format(date, "MM")],
      date
    }))
  }, [startDate, endDate])

  // Estado legible y color de badge
  const getIssueStatus = st => ({
    closed: "Closed",
    in_review: "In review",
    in_progress: "In progress",
    pending: "Pending"
  }[st] || "Open")
  const getStatusColor = st => ({
    closed: "bg-green-500",
    in_review: "bg-purple-500",
    in_progress: "bg-blue-500",
    pending: "bg-yellow-500"
  }[st] || "bg-gray-500")

  // Posición y ancho de barra
  const calculateBarPosition = issue => {
    if (!startDate) return { left: 0, width: 0, overdue: 0 }
    const created = parseISO(issue.createdAt)
    const due = issue.dueDate ? parseISO(issue.dueDate) : today
    const overdueDays = issue.status === "open" && issue.dueDate && isAfter(today, due)
      ? differenceInDays(today, due)
      : 0
    const startOffset = Math.max(0, differenceInDays(created, startDate))
    const duration = differenceInDays(due, created)
    return {
      left: (startOffset / totalDays) * 100,
      width: (duration / totalDays) * 100,
      overdue: (overdueDays / totalDays) * 100
    }
  }

  if (!startDate) {
    return (
      <div className="flex justify-center items-center h-64">
        Cargando diagrama...
      </div>
    )
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
              placeholder="Buscar issues..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="open">Abierto</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="in_review">En revisión</SelectItem>
              <SelectItem value="pending">Pendiente</SelectItem>
              <SelectItem value="closed">Cerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Encabezado años y meses */}
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
                  width: `${(y.width / totalDays) * 100}%`
                }}
              >
                {y.year}
              </div>
            ))}
          </div>
          <div className="h-8 flex">
            {monthMarkers.map((m, i) => (
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

      <div className="flex">
        {/* Columna de nombres */}
        <div
          ref={namesColumnRef}
          onScroll={handleNamesScroll}
          className="w-1/4 min-w-[250px] max-h-[600px] overflow-y-auto pr-2 border-r border-gray-200 bg-white z-10"
          style={{ position: "sticky", left: 0 }}
        >
          <div className="space-y-6">
            {Object.entries(issuesByUser).map(([user, items]) => (
              <div key={user} className="mb-4">
                <div className="font-bold text-lg mb-2 text-gray-800">
                  {user}
                </div>
                <div className="space-y-4">
                  {items.map(issue => (
                    <div key={issue.id} className="h-12 flex items-center">
                      <div className="flex-1">
                        <div className="text-xs font-medium text-gray-800">
                          {issue.title}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <Badge
                            className={cn(
                              "text-[10px] px-1.5 py-0.5",
                              getStatusColor(issue.status)
                            )}
                          >
                            {getIssueStatus(issue.status)}
                          </Badge>
                          {issue.customAttributes?.map(attr => (
                            <Badge
                              key={attr.attributeDefinitionId}
                              variant="outline"
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              {attr.readableValue}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No issues encontrados.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Línea de tiempo */}
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
                  height: `${
                    Object.entries(issuesByUser).reduce(
                      (sum, [, arr]) => sum + arr.length * 36 + 40,
                      0
                    )
                  }px`
                }}
              >
                <div className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-md shadow-sm">
                  TODAY
                </div>
              </div>
            </div>

            {/* Barras del diagrama */}
            <div className="space-y-6">
              {Object.entries(issuesByUser).map(([user, items]) => (
                <div key={user} className="mb-4">
                  <div className="h-8 mb-2" />
                  <div className="space-y-4">
                    {items.map(issue => {
                      const { left, width, overdue } = calculateBarPosition(issue)
                      const created = parseISO(issue.createdAt)
                      const due = issue.dueDate ? parseISO(issue.dueDate) : null
                      return (
                        <div key={issue.id} className="h-12 relative">
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
                                    width: `${width + overdue}%`
                                  }}
                                >
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
                                  <p><strong>Issue:</strong> {issue.title}</p>
                                  <p><strong>Creado:</strong> {format(created, "dd/MM/yyyy")}</p>
                                  {due && (
                                    <p><strong>Fecha límite:</strong> {format(due, "dd/MM/yyyy")}</p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          {due && (
                            <div
                              className="absolute text-xs text-gray-500"
                              style={{
                                top: "24px",
                                left: `${left + width}%`
                              }}
                            >
                              {format(due, "d MMM", { locale: es })}
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
