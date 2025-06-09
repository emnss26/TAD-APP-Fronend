import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Button } from "@/components/ui/button";

import BIM360PlatformprojectsHeader from "../../components/platform_page_components/bim360.platform.header.projects";
import { Footer } from "../../components/general_pages_components/general.pages.footer";
import BIM360SideBar from "../../components/platform_page_components/platform.bim360.sidebar";
import LoadingOverlay from "../../components/general_pages_components/general.loading.overlay";

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

import { fechBIM360ProjectUsers } from "../../pages/services/bim360.services";

const backendUrl =
  import.meta.env.VITE_API_BACKEND_BASE_URL || "http://localhost:3000";

const BIM360ProjectTaskManagementPage = () => {
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

        const usersData = await fechBIM360ProjectUsers(projectId, accountId);
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
    try {
      const updated = await taskService.updateTask(
        projectId,
        accountId,
        taskToUpdate.id,
        taskToUpdate
      );
      console.log("Updated task:", updated);

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      setError(null);
      await taskService.deleteTask(projectId, accountId, taskId);
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      setError(
        err instanceof Error ? err.message : "Error deleting the task."
      );
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        Loading tasks...
      </div>
    );
  }

  return (
    <>
      {loading && <LoadingOverlay />}
      {/* Header */}
      <BIM360PlatformprojectsHeader
        accountId={accountId}
        projectId={projectId}
      />

      <div className="flex min-h-screen mt-14">
        <BIM360SideBar />

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
              New Task
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
                Task List
              </TabsTrigger>
              <TabsTrigger value="gantt" className="flex items-center">
                <BarChart2 className="mr-2 h-4 w-4" />
                Gantt Chart
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

          {/* Dialog for creating new task */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen} modal={false}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new task.
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
      {/* Footer */}
      <Footer />
    </>
  );
};

export default BIM360ProjectTaskManagementPage;
