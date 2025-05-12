import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";

import ACCPlatformprojectsHeader from "../../components/platform_page_components/acc.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";
import ACCSideBar from "../../components/platform_page_components/platform.acc.sidebar";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { TaskManagementTable } from "../../components/task_management_components/task.management.table";
import { TaskManagementGantt } from "../../components/task_management_components/task.management.gantt";
import { TaskManagementForm } from "../../components/task_management_components/task.management.form";

import { PlusCircle, LayoutGrid, BarChart2 } from "lucide-react";
import * as taskService from "../services/task.management.services";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { fechACCProjectUsers } from "../../pages/services/acc.services";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const ACCProjectTaskManagementPage = () => {
  const { projectId, accountId } = useParams();
  const [cookies] = useCookies(["access_token"]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [users, setProjectUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksArray = await taskService.getTasks(projectId, accountId);

        // 1) Llamamos al servicio que devuelve { users: […] }
        const usersData = await fechACCProjectUsers(
          projectId,
          accountId
        );
        // 2) Extraemos el array de usuarios
        const usersArray = Array.isArray(usersData.users)
          ? usersData.users
          : [];

        setTasks(tasksArray);
        setProjectUsers(usersArray);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, accountId]);

  //console.log("Users", users);
  //console.log("Tasks", tasks);

  const handleAddTask = async (newTask) => {
    try {
      const created = await taskService.createTask(
        projectId,
        accountId,
        newTask
      );
      setTasks((prev) => [...prev, created]);
      setIsFormOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskToUpdate) => {
    
    console.log("Updating task:", taskToUpdate);
    console.log("Project ID:", taskToUpdate.id);
    try{const updated = await taskService.updateTask(
      projectId,
      accountId,
      taskToUpdate.id,
      taskToUpdate
    );
    console.log("Updated task:", updated);
    
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }catch (err) {
    setError(err.message);
  };
}

const handleDeleteTask = async (taskId) => {
  
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta tarea?")) {
      return;
    }
    try {
      setError(null);
      await taskService.deleteTask(projectId, accountId, taskId);

   setTasks(tasks.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(
        err instanceof Error ? err.message : "Error al eliminar la tarea."
      );
    }
  };

  if (loading) {
    return <div className="container mx-auto py-6">Cargando tareas...</div>;
  }

  return (
    <>
      {loading && <LoadingOverlay />}
      {/*Header*/}
      <ACCPlatformprojectsHeader accountId={accountId} projectId={projectId} />

      <div className="flex min-h-screen mt-14">
        <ACCSideBar />

        <main className="flex-1 min-w-0 p-2 px-4 bg-white">
          <h1 className="text-right text-xl mt-2">
            TEAM TASK MANAGEMENT MODULE
          </h1>
          <hr className="my-4 border-t border-gray-300" />

          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={() => setIsFormOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Tarea
            </Button>
          </div>

          {error && (
            <div className="mb-4 text-red-600 bg-red-100 border border-red-400 p-3 rounded">
              {error}
            </div>
          )}

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list" className="flex items-center">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Lista de Tareas
              </TabsTrigger>
              <TabsTrigger value="gantt" className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Diagrama de Gantt
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <TaskManagementTable
                tasks={tasks}
                users={users}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
              />
            </TabsContent>
            <TabsContent value="gantt">
              <TaskManagementGantt tasks={tasks} />
            </TabsContent>
          </Tabs>

          {/* Dialogo para crear nueva tarea */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Crear Nueva Tarea</DialogTitle>
                <DialogDescription>
                  Completa los detalles de la nueva tarea.
                </DialogDescription>
              </DialogHeader>
              <TaskManagementForm
                tasks={tasks}
                users={users}
                onAddTask={handleAddTask}
                onCancel={() => setIsFormOpen(false)}
                isEditing={false}
              />
            </DialogContent>
          </Dialog>
        </main>
      </div>
      {/*Footer*/}
      <Footer />
    </>
  );
};

export default ACCProjectTaskManagementPage;
