import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SketchPicker } from "react-color";
import { Button } from "@/components/ui/button";

export default function EnhancedColorPicker({
  selectedColor,
  setSelectedColor,
}) {
  const [displayPicker, setDisplayPicker] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (displayPicker && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({ top: rect.bottom + 35, left: rect.left - 60 });
    }
  }, [displayPicker]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        variant="outline"
        className="h-8 w-12 p-0 border-gray-300"
        onClick={() => setDisplayPicker(!displayPicker)}
      >
        <div
          className="h-full w-full rounded-sm overflow-hidden"
          style={{ backgroundColor: selectedColor || "#f28c28" }}
        ></div>
      </Button>
      {displayPicker &&
        createPortal(
          <div
            className="absolute z-50"
            style={{ top: position.top, left: position.left }}
          >
            <SketchPicker
              color={selectedColor || "#f28c28"}
              onChangeComplete={(color) => setSelectedColor(color.hex)}
            />
          </div>,
          document.body
        )}
    </div>
  );
}
