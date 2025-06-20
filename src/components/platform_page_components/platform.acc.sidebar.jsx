import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  Home,
  LayoutGrid,
  Users,
  ClipboardList,
  Mail,
  FileText,
  Layers,
  DollarSign,
  Wrench,
  FileCode,
  ClipboardCheck,
  Clock,
  PanelLeftClose,
  PanelRightClose,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function ACCSidebar() {
  // Persist collapse state
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved ? JSON.parse(saved) : true;
    }
    return false;
  });

  const { accountId, projectId } = useParams();
  const location = useLocation();

  React.useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  // Define all menu items
  const menuItems = [
    {
      icon: <Home className="h-4 w-4" />,
      label: "Home Projects",
      path: "/accprojects",
    },
    {
      icon: <LayoutGrid className="h-4 w-4" />,
      label: "Project Page",
      path: `/accprojects/${accountId}/${projectId}`,
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Users Report",
      path: `/accprojects/${accountId}/${projectId}/accusers`,
    },
    {
      icon: <ClipboardList className="h-4 w-4" />,
      label: "Issues Report",
      path: `/accprojects/${accountId}/${projectId}/accissues`,
    },
    {
      icon: <Mail className="h-4 w-4" />,
      label: "RFI Report",
      path: `/accprojects/${accountId}/${projectId}/accrfis`,
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: "Submittals Report",
      path: `/accprojects/${accountId}/${projectId}/accsubmittals`,
    },
    {
      icon: <Layers className="h-4 w-4" />,
      label: "ACC 4D Data",
      path: `/accprojects/${accountId}/${projectId}/acc4ddata`,
    },
    {
      icon: <DollarSign className="h-4 w-4" />,
      label: "ACC 5D Data",
      path: `/accprojects/${accountId}/${projectId}/acc5ddata`,
    },
    {
      icon: <Wrench className="h-4 w-4" />,
      label: "ACC 6D Data",
      path: `/accprojects/${accountId}/${projectId}/acc6ddata`,
    },
    {
      icon: <FileCode className="h-4 w-4" />,
      label: "Plans",
      path: `/accprojects/${accountId}/${projectId}/plans`,
    },
    {
      icon: <ClipboardCheck className="h-4 w-4" />,
      label: "Team Task Manager",
      path: `/accprojects/${accountId}/${projectId}/task-manager`,
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Project Time & Budget Management",
      path: `/accprojects/${accountId}/${projectId}/time-budget-management`,
    },
    {
      icon: <HardDrive className="h-4 w-4" />,
      label: "LOD Checker",
      path: `/accprojects/${accountId}/${projectId}/lod-checker`,
    },
  ];

  // Group items
  const menuGroups = [
    { title: "GENERAL", items: menuItems.slice(0, 2) },
    { title: "REPORTS", items: menuItems.slice(2, 6) },
    { title: "DATABASE", items: menuItems.slice(6, 9) },
    { title: "PROJECT MANAGEMENT", items: menuItems.slice(9, 12) },
    { title: "BIM MANAGEMENT", items: menuItems.slice(12, 13) },
  ];

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "min-h-screen flex-shrink-0 bg-[#f6f6f6] text-[#6b7474] p-4 flex flex-col relative transition-all duration-300 ease-in-out border-r border-gray-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 self-end text-[#6b7474] hover:bg-gray-200 hover:text-[#6b7474]"
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>

        <div className="space-y-6">
          {menuGroups.map((group, gi) => (
            <div key={gi} className="space-y-2">
              {!collapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                  {group.title}
                </h3>
              )}

              {group.items.map((item, i) => {
                const isActive = location.pathname === item.path;

                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-2 py-2 rounded-md transition-all duration-200 relative",
                          isActive
                            ? "bg-[#e6f4fa] text-[#2ea3e3] font-medium"
                            : "text-[#6b7474] hover:bg-gray-200 hover:text-[#2ea3e3]"
                        )}
                      >
                        <span
                          className={cn(
                            "flex-shrink-0 transition-transform duration-200",
                            isActive && "text-[#2ea3e3]",
                            !isActive && "group-hover:scale-110"
                          )}
                        >
                          {item.icon}
                        </span>

                        {!collapsed && (
                          <span
                            className={cn(
                              "text-xs truncate",
                              isActive && "font-medium"
                            )}
                          >
                            {item.label}
                          </span>
                        )}

                        {isActive && (
                          <span className="absolute left-0 w-1 h-6 bg-[#2ea3e3] rounded-r-full" />
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6">
          {!collapsed && (
            <div className="text-xs text-gray-500 px-2">
              <p>Version 1.0.0</p>
              <a
                href="#"
                className="text-[#2ea3e3] hover:underline mt-1 inline-block"
              >
                Help and support
              </a>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
