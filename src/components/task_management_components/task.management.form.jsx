
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../lib/task.utils";
import { useParams } from "react-router-dom";

export function TaskManagementForm({
  tasks = [],
  users = [],
  initialData,
  onAddTask,
  onCancel,
  isEditing = false,
}) {
  const { projectId } = useParams();

  // Opciones de estado
  const statusOptions = [
    "No iniciada",
    "En progreso",
    "Completada",
    "Retrasada",
  ];

  // Estado local de la tarea (campos string para enviar)
  const [task, setTask] = useState(() => ({
    id: initialData?.id || "",
    _id: initialData?._id,
    title: initialData?.title || "",
    description: initialData?.description || "",
    assignedTo: initialData?.assignedTo || "",
    status: initialData?.status || statusOptions[0],
    startDate: initialData
      ? format(parseISO(initialData.startDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
    endDate: initialData
      ? format(parseISO(initialData.endDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd"),
  }));

  // Estados Date para el calendario
  const [startDateObj, setStartDateObj] = useState(
    initialData?.startDate ? parseISO(initialData.startDate) : new Date()
  );
  const [endDateObj, setEndDateObj] = useState(
    initialData?.endDate ? parseISO(initialData.endDate) : new Date()
  );

  // Generar nuevo ID cuando no estamos editando
  useEffect(() => {
    if (!isEditing) {
      const nums = tasks.map((t) => {
        const parts = t.id?.split("-") || [];
        const n = parseInt(parts[parts.length - 1], 10);
        return isNaN(n) ? 0 : n;
      });
      const next = (nums.length ? Math.max(...nums) : 0) + 1;
      setTask((prev) => ({ ...prev, id: `${projectId}-${next}` }));
    }
  }, [tasks, projectId, isEditing]);

  const handleChange = (field, value) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (field, date) => {
    if (!date) return;
    const str = format(date, "yyyy-MM-dd");
    // Actualizamos el string para enviar
    setTask((prev) => ({ ...prev, [field]: str }));
    // Actualizamos el objeto Date para calendario
    if (field === "startDate") {
      setStartDateObj(date);
      // Si la endDateObj es anterior, lo ajustamos
      if (endDateObj < date) {
        setEndDateObj(date);
        setTask((prev) => ({ ...prev, endDate: str }));
      }
    } else {
      setEndDateObj(date);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask(task);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="id" value={task.id} />

      <div className="grid grid-cols-1 gap-4">
        {/* Título */}
        <div className="space-y-2">
          <Label htmlFor="title">Título de la tarea</Label>
          <Input
            id="title"
            value={task.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder="Ingresa el título de la tarea"
            required
          />
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            value={task.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe la tarea"
            rows={3}
          />
        </div>

        {/* Asignar a & Estado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Asignar a */}
          <div className="space-y-2">
            <Label htmlFor="assignedTo">Asignar a</Label>
            <Select
              defaultValue={task.assignedTo}
              onValueChange={(val) => handleChange("assignedTo", val)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem
                    key={user.id || user._id}
                    value={user.id || user._id}
                  >
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            <Select
              defaultValue={task.status}
              onValueChange={(val) => handleChange("status", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((st) => (
                  <SelectItem key={st} value={st}>
                    {st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha de inicio */}
          <div className="space-y-2">
            <Label>Fecha de inicio</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDateObj, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDateObj}
                  onSelect={(date) => handleDateChange("startDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Fecha de fin */}
          <div className="space-y-2">
            <Label>Fecha de fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !endDateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(endDateObj, "PPP", { locale: es })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDateObj}
                  onSelect={(date) => handleDateChange("endDate", date)}
                  initialFocus
                  disabled={(date) => date < startDateObj}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
          {isEditing ? "Actualizar tarea" : "Crear tarea"}
        </Button>
      </div>
    </form>
  );
}