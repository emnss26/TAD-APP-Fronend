import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit3, Check, X } from "lucide-react";

const initialData = [
  { id: 1,  concepto: "Pipes",                  lodRequerido: 350, geometriaCompleta: { y:false,n:false,na:false }, lodCompletion: { y:false,n:false,na:false }, comentarios: "" },
  { id: 2,  concepto: "Pipe Accesory",                           lodRequerido: 350, geometriaCompleta: { y:false,n:false,na:false }, lodCompletion: { y:false,n:false,na:false }, comentarios: "" },
  { id: 3,  concepto: "Pipe Fittings",               lodRequerido: 350, geometriaCompleta: { y:false,n:false,na:false }, lodCompletion: { y:false,n:false,na:false }, comentarios: "" },
  { id: 4,  concepto: "Flex Pipes", lodRequerido: 350, geometriaCompleta: { y:false,n:false,na:false }, lodCompletion: { y:false,n:false,na:false }, comentarios: "" },
  { id: 5,  concepto: "Plumbing Equipment",                            lodRequerido: 350, geometriaCompleta: { y:false,n:false,na:false }, lodCompletion: { y:false,n:false,na:false }, comentarios: "" },
  { id: 6,  concepto: "Plumbing Fixture",                          lodRequerido: 300, geometriaCompleta: { y:false,n:false,na:false }, lodCompletion: { y:false,n:false,na:false }, comentarios: "" },
  
];

// Reusable status button with proper inactive background
function StatusButton({ isActive, onClick, children, colorClass }) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className={`w-5 h-5 p-0 rounded-full transition duration-150 text-xs ${
        isActive
          ? `${colorClass} text-white`
          : "bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-600"
      }`}
    >
      {children}
    </Button>
  );
}

export function LODTablePlumbingCompliance() {
  const [data, setData] = useState(initialData);
  const [editingConcept, setEditingConcept] = useState(null);
  const [editingLOD, setEditingLOD] = useState(null);
  const [tempConcept, setTempConcept] = useState("");
  const [tempLOD, setTempLOD] = useState("");

  const calculateCompliance = () => {
    const total = data.length;
    const done = data.filter(i => i.geometriaCompleta.y && i.lodCompletion.y).length;
    return total ? Math.round((done / total) * 100) : 0;
  };

  const calculateStats = col => {
    const valid = data.filter(i => !i[col].na);
    const yes = valid.filter(i => i[col].y).length;
    return { total: valid.length, yes, percentage: valid.length ? Math.round((yes/valid.length)*100) : 0 };
  };

  const addRow = () => {
    const nextId = Math.max(...data.map(i => i.id)) + 1;
    setData([...data, {
      id: nextId,
      concepto: "New Item",
      lodRequerido: 300,
      geometriaCompleta: { y:false,n:false,na:false },
      lodCompletion:     { y:false,n:false,na:false },
      comentarios: "",
    }]);
  };

  const toggleGeom = (id, opt) =>
    setData(data.map(i =>
      i.id === id ? { ...i, geometriaCompleta: { y:opt==="y", n:opt==="n", na:opt==="na" } } : i
    ));

  const toggleLOD = (id, opt) =>
    setData(data.map(i =>
      i.id === id ? { ...i, lodCompletion: { y:opt==="y", n:opt==="n", na:opt==="na" } } : i
    ));

  const updateComments = (id, c) =>
    setData(data.map(i => i.id === id ? { ...i, comentarios: c } : i));

  const startEditConcept = (id, val) => {
    setEditingConcept(id);
    setTempConcept(val);
  };
  const saveConcept = id => {
    setData(data.map(i => i.id===id ? { ...i, concepto: tempConcept } : i));
    setEditingConcept(null);
    setTempConcept("");
  };

  const startEditLOD = (id, val) => {
    setEditingLOD(id);
    setTempLOD(String(val));
  };
  const saveLOD = id => {
    const newVal = parseInt(tempLOD) || 300;
    setData(data.map(i => i.id===id ? { ...i, lodRequerido: newVal } : i));
    setEditingLOD(null);
    setTempLOD("");
  };

  const geomStats = calculateStats("geometriaCompleta");
  const lodStats  = calculateStats("lodCompletion");

  return (
    <div className="w-full max-w-4xl mx-auto p-2 bg-white">
      <Card className="mb-2 bg-white">
        <CardContent className="py-1 px-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-black">PLUMBING LOD CHECK</h2>
            <div className="flex items-center space-x-2 text-xs">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700">% COMPLETE</Badge>
              <span className="font-semibold">{calculateCompliance()}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow bg-white">
        <CardContent className="p-0">
          <Table className="bg-white text-xs">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-8 text-center py-0.5">#</TableHead>
                <TableHead className="w-56 py-0.5">CONCEPT</TableHead>
                <TableHead className="w-32 text-center py-0.5">REQ. LOD </TableHead>
                <TableHead className="w-24 text-center py-0.5">GEOMETRY COMPLETE</TableHead>
                <TableHead className="w-24 text-center py-0.5">LOD COMPLINCE</TableHead>
                <TableHead className="w-80 py-0.5">COMMENTS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, idx) => (
                <TableRow key={item.id} className={idx%2===0?"":"bg-gray-50"}>
                  <TableCell className="text-center py-0.5 px-1">{item.id}</TableCell>

                  <TableCell className="py-0.5 px-1">
                    {editingConcept===item.id ? (
                      <div className="flex space-x-1">
                        <Input
                          value={tempConcept}
                          onChange={e=>setTempConcept(e.target.value)}
                          onKeyDown={e=>e.key==="Enter"&&saveConcept(item.id)}
                          className="text-xs py-0"
                          autoFocus
                        />
                        <Button size="sm" className="p-0.5" onClick={()=>saveConcept(item.id)}><Check size={12}/></Button>
                        <Button size="sm" className="p-0.5" variant="outline" onClick={()=>setEditingConcept(null)}><X size={12}/></Button>
                      </div>
                    ) : (
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={()=>startEditConcept(item.id,item.concepto)}
                      >
                        <span>{item.concepto}</span>
                        <Edit3 size={12} className="opacity-0 group-hover:opacity-100"/>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center py-0.5 px-1">
                    {editingLOD===item.id ? (
                      <div className="flex space-x-1 justify-center">
                        <Input
                          value={tempLOD}
                          onChange={e=>setTempLOD(e.target.value)}
                          type="number"
                          onKeyDown={e=>e.key==="Enter"&&saveLOD(item.id)}
                          className="w-16 text-xs py-0"
                          autoFocus
                        />
                        <Button size="sm" className="p-0.5" onClick={()=>saveLOD(item.id)}><Check size={12}/></Button>
                        <Button size="sm" className="p-0.5" variant="outline" onClick={()=>setEditingLOD(null)}><X size={12}/></Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={()=>startEditLOD(item.id,item.lodRequerido)}
                      >
                        <span className="font-semibold text-blue-600">{item.lodRequerido}</span>
                        <Edit3 size={12} className="opacity-0 group-hover:opacity-100"/>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="text-center space-x-1 py-0.5 px-1">
                    <StatusButton isActive={item.geometriaCompleta.y} onClick={()=>toggleGeom(item.id,"y")} colorClass="bg-green-500 hover:bg-green-600">Y</StatusButton>
                    <StatusButton isActive={item.geometriaCompleta.n} onClick={()=>toggleGeom(item.id,"n")} colorClass="bg-red-500 hover:bg-red-600">N</StatusButton>
                    <StatusButton isActive={item.geometriaCompleta.na} onClick={()=>toggleGeom(item.id,"na")} colorClass="bg-yellow-400 hover:bg-yellow-500">NA</StatusButton>
                  </TableCell>

                  <TableCell className="text-center space-x-1 py-0.5 px-1">
                    <StatusButton isActive={item.lodCompletion.y} onClick={()=>toggleLOD(item.id,"y")} colorClass="bg-green-500 hover:bg-green-600">Y</StatusButton>
                    <StatusButton isActive={item.lodCompletion.n} onClick={()=>toggleLOD(item.id,"n")} colorClass="bg-red-500 hover:bg-red-600">N</StatusButton>
                    <StatusButton isActive={item.lodCompletion.na} onClick={()=>toggleLOD(item.id,"na")} colorClass="bg-yellow-400 hover:bg-yellow-500">NA</StatusButton>
                  </TableCell>

                  <TableCell className="py-0.5 px-1">
                    <Textarea
                      value={item.comentarios}
                      onChange={e=>updateComments(item.id,e.target.value)}
                      placeholder="Add comments..."
                      className="w-full min-h-[60px] text-xs px-1 py-0.5"
                    />
                  </TableCell>
                </TableRow>
              ))}

              <TableRow className="bg-gray-50 font-bold text-xs">
                <TableCell className="py-0.5 px-1">
                  <Button size="sm" className="p-0.5" onClick={addRow}><Plus size={12}/></Button>
                </TableCell>
                <TableCell className="py-0.5 px-1">TOTAL</TableCell>
                <TableCell className="py-0.5 px-1"></TableCell>
                <TableCell className="py-0.5 px-1">{geomStats.yes}/{geomStats.total} ({geomStats.percentage}%)</TableCell>
                <TableCell className="py-0.5 px-1">{lodStats.yes}/{lodStats.total} ({lodStats.percentage}%)</TableCell>
                <TableCell className="py-0.5 px-1"><Badge variant="secondary">Overall: {calculateCompliance()}%</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}