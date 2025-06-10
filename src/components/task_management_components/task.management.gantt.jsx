"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import {
  addDays,
  differenceInDays,
  format,
  parseISO,
  startOfDay,
  subDays,
  isWeekend,
} from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Calendar, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Generate a pastel color based on a seed
const generatePastelColor = (seed) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  const saturation = 45 + (Math.abs(hash) % 25)
  const lightness = 75 + (Math.abs(hash) % 15)
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Keep a consistent color per user
const userColorMap = new Map()
const getUserColor = (userId) => {
  if (!userColorMap.has(userId)) {
    userColorMap.set(userId, generatePastelColor(userId))
  }
  return userColorMap.get(userId)
}

export function TaskManagementGantt({ tasks = [] }) {
  const [windowStart, setWindowStart] = useState(() => startOfDay(new Date()))
  const [windowSize, setWindowSize] = useState(28)
  const [dayWidth, setDayWidth] = useState(40)

  const containerRef = useRef(null)

  // Calculate the bounds of all tasks
  const taskBounds = useMemo(() => {
    if (!tasks.length) return null

    let minDate = null
    let maxDate = null

    tasks.forEach((task) => {
      if (!task.startDate || !task.endDate) return

      const start = startOfDay(parseISO(task.startDate))
      const end = startOfDay(parseISO(task.endDate))

      if (!minDate || start < minDate) minDate = start
      if (!maxDate || end > maxDate) maxDate = end
    })

    return minDate && maxDate ? { minDate, maxDate } : null
  }, [tasks])

  // Fit all tasks on mount and when bounds change
  useEffect(() => {
    if (taskBounds) {
      const totalDays = differenceInDays(taskBounds.maxDate, taskBounds.minDate) + 1
      const paddedStart = subDays(taskBounds.minDate, 3)
      setWindowStart(paddedStart)
      setWindowSize(Math.max(totalDays + 6, 14))
    }
  }, [taskBounds])

  // Visible days for the current window
  const visibleDays = useMemo(() => {
    const days = []
    for (let i = 0; i < windowSize; i++) {
      days.push(addDays(windowStart, i))
    }
    return days
  }, [windowStart, windowSize])

  const getBarStyle = (task) => {
    if (!task.startDate || !task.endDate) {
      return { display: "none" }
    }

    const taskStart = startOfDay(parseISO(task.startDate))
    const taskEnd = startOfDay(parseISO(task.endDate))
    const windowEnd = addDays(windowStart, windowSize - 1)
    const visibleStart = taskStart < windowStart ? windowStart : taskStart
    const visibleEnd = taskEnd > windowEnd ? windowEnd : taskEnd

    if (visibleStart > windowEnd || visibleEnd < windowStart) {
      return { display: "none" }
    }

    const offsetDays = differenceInDays(visibleStart, windowStart)
    const spanDays = differenceInDays(visibleEnd, visibleStart) + 1

    const taskColor =
      task.color ||
      (task.userId
        ? getUserColor(task.userId)
        : task.assignedTo
        ? getUserColor(task.assignedTo)
        : getUserColor(task.id))

    return {
      left: `${(offsetDays / windowSize) * 100}%`,
      width: `${(spanDays / windowSize) * 100}%`,
      backgroundColor: taskColor,
      display: "block",
    }
  }

  const navigateWeek = (direction) => {
    const days = direction === "prev" ? -7 : 7
    setWindowStart((prev) => addDays(prev, days))
  }

  const goToToday = () => {
    setWindowStart(startOfDay(new Date()))
  }

  const fitAllTasks = () => {
    if (!taskBounds) return
    const totalDays = differenceInDays(taskBounds.maxDate, taskBounds.minDate) + 1
    const paddedStart = subDays(taskBounds.minDate, 3)
    setWindowStart(paddedStart)
    setWindowSize(Math.max(totalDays + 6, 14))
  }

  const adjustZoom = (direction) => {
    if (direction === "in") {
      setDayWidth((prev) => Math.min(prev + 10, 80))
      setWindowSize((prev) => Math.max(prev - 7, 14))
    } else {
      setDayWidth((prev) => Math.max(prev - 10, 20))
      setWindowSize((prev) => Math.min(prev + 7, 60))
    }
  }

  return (
    <div className="rounded-lg border bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b">
        <h3 className="text-lg font-semibold">Diagrama de Gantt</h3>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} disabled={!taskBounds}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={goToToday}>
              <Calendar className="h-4 w-4 mr-1" />
              Hoy
            </Button>

            <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} disabled={!taskBounds}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={fitAllTasks} disabled={!taskBounds}>
              Ver todo
            </Button>

            <Button variant="outline" size="sm" onClick={() => adjustZoom("out")}>
              <ZoomOut className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="sm" onClick={() => adjustZoom("in")}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt content */}
      <div className="overflow-auto" ref={containerRef}>
        <div className="min-w-full" style={{ minWidth: `${200 + windowSize * dayWidth}px` }}>
          {/* Dates header */}
          <div className="flex sticky top-0 z-10 bg-gray-50 border-b">
            <div className="w-[200px] p-3 border-r font-medium bg-white">Tarea</div>

            <div className="flex flex-1">
              {visibleDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "border-r text-xs text-center py-2 px-1 flex-shrink-0",
                    isWeekend(day) ? "bg-gray-100" : "bg-gray-50",
                  )}
                  style={{ width: `${dayWidth}px` }}
                >
                  <div className="font-medium">{format(day, "EEE", { locale: es })}</div>
                  <div className="text-gray-600">{format(day, "d")}</div>
                  <div className="text-gray-500 text-[10px]">{format(day, "MMM", { locale: es })}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Task rows */}
          <div className="relative">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-500">No hay tareas para mostrar</div>
            ) : (
              tasks.map((task, index) => {
                const barStyle = getBarStyle(task)

                return (
                  <div
                    key={task.id}
                    className="flex items-center border-b hover:bg-gray-50 transition-colors"
                    style={{ height: "48px" }}
                  >
                    <div className="w-[200px] p-3 border-r">
                      <div className="truncate font-medium text-sm">{task.title}</div>
                    </div>

                    <div className="flex-1 relative" style={{ height: "48px" }}>
                      <div className="absolute inset-0 flex">
                        {visibleDays.map((_, dayIndex) => (
                          <div
                            key={dayIndex}
                            className="border-r border-gray-100 flex-shrink-0"
                            style={{ width: `${dayWidth}px` }}
                          />
                        ))}
                      </div>

                      {barStyle.display === "block" && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute rounded-md cursor-pointer shadow-sm border border-white/20 flex items-center justify-center"
                                style={{
                                  ...barStyle,
                                  height: "24px",
                                  top: "12px",
                                  minWidth: "8px",
                                }}
                              >
                                {task.progress !== undefined && (
                                  <div
                                    className="absolute left-0 top-0 h-full bg-white/30 rounded-md"
                                    style={{ width: `${task.progress}%` }}
                                  />
                                )}

                                <span className="text-white text-xs font-medium px-2 truncate">{task.title}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium">{task.title}</p>
                                <p className="text-sm">{format(parseISO(task.startDate), "PPP", { locale: es })}</p>
                                <p className="text-sm">{format(parseISO(task.endDate), "PPP", { locale: es })}</p>
                                {task.progress !== undefined && (
                                  <p className="text-sm">Progreso: {task.progress}%</p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function GanttExample() {
  const sampleTasks = [
    {
      id: "1",
      title: "Diseño de interfaz",
      startDate: "2024-01-15",
      endDate: "2024-01-25",
      userId: "maria.garcia",
      progress: 75,
    },
    {
      id: "2",
      title: "Desarrollo backend",
      startDate: "2024-01-20",
      endDate: "2024-02-10",
      userId: "carlos.rodriguez",
      progress: 45,
    },
    {
      id: "3",
      title: "Testing y QA",
      startDate: "2024-02-05",
      endDate: "2024-02-15",
      userId: "ana.martinez",
      progress: 20,
    },
    {
      id: "4",
      title: "Despliegue",
      startDate: "2024-02-12",
      endDate: "2024-02-18",
      userId: "luis.fernandez",
      progress: 0,
    },
    {
      id: "5",
      title: "Documentación",
      startDate: "2024-01-25",
      endDate: "2024-02-08",
      userId: "maria.garcia",
      progress: 60,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Gantt Mejorado</h1>
        <p className="text-gray-600">Diagrama de Gantt con ventana deslizante y mejor alineación</p>
      </div>

      <TaskManagementGantt tasks={sampleTasks} />
    </div>
  )
}
