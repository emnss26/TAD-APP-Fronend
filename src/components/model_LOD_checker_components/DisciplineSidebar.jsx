import React from "react";
import { 
  LayoutGrid, 
  Box, 
  HardDrive, 
  Layers, 
  Anchor, 
  Zap, 
  Cpu, 
  Wrench, 
  ActivitySquare, 
  PanelLeftClose, 
  PanelRightClose 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function DisciplineSidebar({ selected, onSelect }) {
  const [collapsed, setCollapsed] = React.useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  React.useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  const disciplinas = [
    { key: "Architecture",    icon: <LayoutGrid className="h-4 w-4" /> },
    { key: "Exteriors",       icon: <Box className="h-4 w-4" /> },
    { key: "Concrete Structure", icon: <HardDrive className="h-4 w-4" /> },
    { key: "Steel Structure", icon: <Layers className="h-4 w-4" /> },
    { key: "Plumbing Installation", icon: <Anchor className="h-4 w-4" /> },
    { key: "Electrical Installation", icon: <Zap className="h-4 w-4" /> },
    { key: "Special Systems", icon: <Cpu className="h-4 w-4" /> },
    { key: "Mechanical - HVAC", icon: <Wrench className="h-4 w-4" /> },
    { key: "LOD Checker",     icon: <ActivitySquare className="h-4 w-4" /> },
  ];

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "h-[650px] flex-1 bg-[#f6f6f6] p-4 flex flex-col transition-all duration-300 border-r border-gray-200",
          collapsed ? "w-16" : "w-56"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="mb-6 self-end"
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed
            ? <PanelRightClose className="h-4 w-4" />
            : <PanelLeftClose  className="h-4 w-4" />}
        </Button>

        <div className="flex-1 space-y-2 overflow-auto">
          {disciplinas.map(({ key, icon }) => {
            const isActive = selected === key;
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-3 w-full px-2 py-2 rounded-md transition-all duration-200 relative",
                      isActive
                        ? "bg-[#e6f4fa] text-[#2ea3e3] font-medium"
                        : "hover:bg-gray-200 hover:text-[#2ea3e3]"
                    )}
                    onClick={() => onSelect(key)}
                  >
                    <span className={cn(isActive && "text-[#2ea3e3]")}>
                      {icon}
                    </span>
                    {!collapsed && (
                      <span className="text-xs truncate">{key}</span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 w-1 h-6 bg-[#2ea3e3] rounded-r-full" />
                    )}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{key}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </div>

        {!collapsed && (
          <div className="mt-auto text-xs text-gray-500 px-2">
            <p>Version 1.0.0</p>
            <a href="#" className="text-[#2ea3e3] hover:underline">Help & Support</a>
          </div>
        )}
      </aside>
    </TooltipProvider>
  );
}