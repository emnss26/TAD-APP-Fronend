import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SketchPicker } from "react-color";
import { Button } from "@/components/ui/button";

const DEFAULT_COLOR = "#f28c28"; 

export default function EnhancedColorPicker({
  selectedColor,
  setSelectedColor,
  isPickerOpen,
  setIsPickerOpen,
  pickerRef,
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  
  const open = typeof isPickerOpen === "boolean" ? isPickerOpen : internalOpen;
  const setOpen =
    typeof setIsPickerOpen === "function" ? setIsPickerOpen : setInternalOpen;
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const internalRef = useRef(null);
  const containerRef = pickerRef || internalRef;

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();

      setPosition({ top: rect.bottom + 35, left: rect.left - 60 });
    }
  }, [open, containerRef]);

  const handleColorChangeComplete = (color) => {
    setSelectedColor(color.hex);
  };

  const togglePicker = () => {
    setOpen(!open);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button
        variant="outline"
        className="h-8 w-12 p-0 border-gray-300" 
        onClick={togglePicker}
        aria-label="Open color picker" 
      >
        <div
          className="h-full w-full rounded-sm overflow-hidden"
          style={{ backgroundColor: selectedColor || DEFAULT_COLOR }}
          aria-hidden="true" 
        />
      </Button>
      {open &&
        createPortal(
          <div
            className="absolute z-50" 
            style={{ top: position.top, left: position.left }}
          >
            <SketchPicker
              color={selectedColor || DEFAULT_COLOR}
              onChangeComplete={handleColorChangeComplete}
            />
          </div>,
          document.body 
        )}
    </div>
  );
}