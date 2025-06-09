import { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

function TreeNode({ node, depth = 0, onSelect, selectedId }) {
  const [open, setOpen] = useState(false);
  const hasChildren = Array.isArray(node.children) && node.children.length;

  const handleClick = () => {
    if (hasChildren) {
      setOpen((o) => !o);     // abre/cierra sub-árbol
    }
    onSelect(node);           // siempre marca como seleccionado
  };

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <button
        className="flex items-center gap-1 text-left text-sm hover:bg-gray-100 w-full rounded px-1 py-0.5"
        onClick={handleClick}
      >
        {hasChildren ? (
          open ? <ChevronDown size={14}/> : <ChevronRight size={14}/>
        ) : (
          <span className="w-[14px]" />
        )}
        {node.type === "folder" ? <Folder size={14}/> : <File size={14}/>}
        <span className={node.id === selectedId ? "font-semibold text-blue-600" : undefined}>
          {node.name}
        </span>
      </button>
      {open && hasChildren && node.children.map(child => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </div>
  );
}

export default function FolderMappingModal({
  open,
  onClose,
  accountId,
  projectId,
  backendUrl,
  onFolderChosen,
}) {
  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(
      `${backendUrl}/datamanagement/folders/${accountId}/${projectId}/folder-structure`,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    )
      .then((r) => r.json())
      .then((j) => {
        setTree(j.data || null);
        setError(j.error);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, accountId, projectId, backendUrl]);

  const handleSelect = useCallback((node) => setSelected(node), []);

  const handleConfirm = () => {
    if (selected) {
        console.debug("📂 Folder seleccionado:", selected);
      onFolderChosen(selected.id, tree);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[500px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select BIM 360 folder</DialogTitle>
        </DialogHeader>

        {loading && <p className="text-center mt-4">Loading folders…</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {tree && (
          <div className="flex-1 overflow-y-auto border p-2 rounded">
            {tree.map((n) => (
              <TreeNode
                key={n.id}
                node={n}
                onSelect={handleSelect}
                selectedId={selected?.id}
              />
            ))}
          </div>
        )}

        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!selected} onClick={handleConfirm}>
            Use this folder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
