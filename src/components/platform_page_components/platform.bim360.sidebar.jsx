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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function BIM360Sidebar() {
  // Persist collapse state separately
  const [collapsed, setCollapsed] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bim360SidebarCollapsed");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const { accountId, projectId } = useParams();
  const location = useLocation();

   React.useEffect(() => {
      localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
    }, [collapsed]);

  // Define menu items for BIM360
  const menuItems = [
    { icon: <Home className="h-4 w-4" />, label: "Home Projects", path: "/bim360projects" },
    { icon: <LayoutGrid className="h-4 w-4" />, label: "Project Page", path: `/bim360projects/${accountId}/${projectId}` },
    { icon: <Users className="h-4 w-4" />, label: "Users Report", path: `/bim360projects/${accountId}/${projectId}/bim360users` },
    { icon: <ClipboardList className="h-4 w-4" />, label: "Issues Report", path: `/bim360projects/${accountId}/${projectId}/bim360issues` },
    { icon: <Mail className="h-4 w-4" />, label: "RFI Report", path: `/bim360projects/${accountId}/${projectId}/bim360rfis` },
    { icon: <Layers className="h-4 w-4" />, label: "ACC 4D Data", path: `/bim360projects/${accountId}/${projectId}/bim3604ddata` },
    { icon: <DollarSign className="h-4 w-4" />, label: "ACC 5D Data", path: `/bim360projects/${accountId}/${projectId}/bim3605ddata` },
    { icon: <Wrench className="h-4 w-4" />, label: "ACC 6D Data", path: `/bim360projects/${accountId}/${projectId}/bim3606ddata` },
    { icon: <FileCode className="h-4 w-4" />, label: "Plans", path: `/bim360projects/${accountId}/${projectId}/plans` },
    { icon: <ClipboardCheck className="h-4 w-4" />, label: "Team Task Manager", path: `/bim360projects/${accountId}/${projectId}/task-manager` },
    { icon: <Clock className="h-4 w-4" />, label: "Project Time & Budget Management", path: `/bim360projects/${accountId}/${projectId}/time-budget-management` },
  ];

  // Group into categories
  const menuGroups = [
    { title: "GENERAL", items: menuItems.slice(0, 2) },
    { title: "REPORTS", items: menuItems.slice(2, 5) },
    { title: "DATABASE", items: menuItems.slice(5, 8) },
    { title: "PROJECT MANAGEMENT", items: menuItems.slice(8, 11) },
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
           {collapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
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
                                    <span className={cn("text-xs truncate", isActive && "font-medium")}>
                                      {item.label}
                                    </span>
                                  )}
          
                                  {isActive && <span className="absolute left-0 w-1 h-6 bg-[#2ea3e3] rounded-r-full" />}
                                </Link>
                              </TooltipTrigger>
                              {collapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
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
                        <a href="#" className="text-[#2ea3e3] hover:underline mt-1 inline-block">
                          Help and support
                        </a>
                      </div>
                    )}
                  </div>
                </aside>
              </TooltipProvider>
            );
          }