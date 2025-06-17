import React, { useState } from 'react';

export function LODTableEstructuraConcreto() {
  const initialData = [
    { id: 1, concepto: 'Viga principal', cumple: false },
    { id: 2, concepto: 'Columnas de concreto', cumple: false },
  ];
  const [data, setData] = useState(initialData);

  const toggleCumple = (id) => {
    setData((prev) => prev.map((item) =>
      item.id === id ? { ...item, cumple: !item.cumple } : item
    ));
  };

  return (
    <table className="min-w-full border">
      <thead>
        <tr className="bg-gray-200">
          <th className="px-4 py-2">ID</th>
          <th className="px-4 py-2">Concepto</th>
          <th className="px-4 py-2">¿Cumple?</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id} className="border-t">
            <td className="px-4 py-2">{row.id}</td>
            <td className="px-4 py-2">{row.concepto}</td>
            <td className="px-4 py-2 text-center">
              <input
                type="checkbox"
                checked={row.cumple}
                onChange={() => toggleCumple(row.id)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
