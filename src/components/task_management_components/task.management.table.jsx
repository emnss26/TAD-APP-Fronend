import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { TaskManagementForm } from "../../components/task_management_components/task.management.form";
import { formatDate } from "../../lib/task.utils";

export function TaskManagementTable({
  tasks,
  users,
  onUpdateTask,
  onDeleteTask,
}) {
  const [editingTask, setEditingTask] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "No iniciada":
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
      case "En progreso":
        return "bg-yellow-200 hover:bg-yellow-300 text-yellow-800";
      case "Completada":
        return "bg-green-200 hover:bg-green-300 text-green-800";
      case "Retrasada":
        return "bg-red-200 hover:bg-red-300 text-red-800";
      default:
        return "bg-gray-200 hover:bg-gray-300 text-gray-800";
    }
  };

  // Busca por user.id o user._id
  const getUserById = (userId) => {
    return users.find((user) => user.id === userId || user._id === userId);
  };

  // Abrir diálogo de edición con la tarea completa
  const handleEditClick = (task) => {
    setEditingTask(task);
  };

  const handleUpdateSubmit = (updated) => {
    onUpdateTask(updated);
    setEditingTask(null);
  };

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100">
              <TableHead key="h-task-name" className="w-[300px]">
                Nombre de la tarea
              </TableHead>
              <TableHead key="h-assigned">Asignado a</TableHead>
              <TableHead key="h-status">Estado</TableHead>
              <TableHead key="h-start">Fecha de inicio</TableHead>
              <TableHead key="h-end">Fecha de fin</TableHead>
              <TableHead key="h-actions" className="text-right">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const rowKey = task._id || task.id;
              const user = getUserById(task.assignedTo);
              return (
                <TableRow key={rowKey}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    {user ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          {user.avatar ? (
                            <AvatarImage src={user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback>
                              {user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    ) : (
                      <span className="italic text-gray-500">Sin asignar</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.startDate)}</TableCell>
                  <TableCell>{formatDate(task.endDate)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          key="edit"
                          onClick={() => handleEditClick(task)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          key="delete"
                          onClick={() => onDeleteTask(task.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para Editar Tarea */}
      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar tarea</DialogTitle>
            <DialogDescription>
              Actualiza los campos de la tarea y guarda los cambios.
            </DialogDescription>
          </DialogHeader>
          {editingTask && (
            <TaskManagementForm
              users={users}
              initialData={editingTask}
              onAddTask={handleUpdateSubmit}
              onCancel={() => setEditingTask(null)}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}