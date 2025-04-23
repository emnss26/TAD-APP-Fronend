export const mapCategoryToElementType = (category) => {
  if (!category) return null;
  const cleanCategory = category.replace("Revit ", "");
  //console.log("cleanCategory:", cleanCategory);

  const categoryMap = {
    "Structural Framing": "Structural Framings",
    Walls: "Walls",
    Doors: "Doors",
    Windows: "Windows",
    Roof: "Roofs",
    Floors: "Floors",
    Ceiling: "Ceilings",
    "Curtain Panels": "Curtain Walls",
    Stair: "Stairs",
    Railing: "Railings",
    Furniture: "Furniture",
    Casework: "Casework",
    "Curtain Wall": "Curtain Walls",
    "Plumbing Fixtures": "Plumbing Fixtures",
    "Generic Models": "Generic Models",
    Topography: "Topography",
    "Structural Column": "Structural Columns",
    "Structural Columns": "Structural Columns",
    "Structural Connection": "Structural Connections",
    "Structural Wall": "Structural Walls",
    "Structural Foundations": "Structural Foundations",
    "Structural Foundation": "Structural Foundations",
    "Structural Truss": "Structural Trusses",
    "Structural Brace": "Structural Braces",
    "Structural Rebar": "Structural Rebar",
    Duct: "Ducts",
    "Duct Fitting": "Duct Fittings",
    "Duct Insulation": "Duct Insulations",
    "Mechanical Equipment": "Mechanical Equipment",
    "Air Terminal": "Air Terminals",
    "Flex Duct": "Flex Ducts",
    Pipes: "Pipes",
    "Pipe Fittings": "Pipe Fittings",
    "Pipe Insulation": "Pipe Insulations",
    "Flex Pipe": "Flex Pipes",
    "Pipe Accessory": "Pipe Accessories",
    Conduit: "Conduit",
    "Conduit Fitting": "Conduit Fittings",
    "Cable Tray": "Cable Trays",
    "Cable Tray Fitting": "Cable Tray Fittings",
    "Light Fixture": "Light Fixtures",
    "Lighting Device": "Lighting Devices",
    "Fire Alarm Device": "Fire Alarm Devices",
    "Electrical Device": "Electrical Devices",
    "Electrical Panel": "Electrical Panels",
    "Electrical Equipment": "Electrical Equipment",
    "Electrical Fixture": "Electrical Fixtures",
    "Audio Visual Device": "Audio Visual Devices",
    "Communication Device": "Communication Devices",
    "Data Device": "Data Devices",
    Ramp: "Ramps",
    "Specialty Equipment": "Specialty Equipment",
    Sprinkler: "Sprinklers",
  };

  return categoryMap[cleanCategory] || null;
};

export const scrollUp = (ref) => {
  if (ref.current) {
    ref.current.scrollBy({ top: -100, behavior: "smooth" });
  }
};

export const scrollDown = (ref) => {
  if (ref.current) {
    ref.current.scrollBy({ top: 100, behavior: "smooth" });
  }
};

export const reorderRowsByDiscipline = (rows) => {
  const grouped = rows.reduce((acc, row) => {
    const discipline = row.Discipline || "No Discipline";
    if (!acc[discipline]) acc[discipline] = [];
    acc[discipline].push(row);
    return acc;
  }, {});

  const disciplineOrder = Object.keys(grouped).sort();
  let finalArray = [];
  let globalCounter = 1;

  for (let disc of disciplineOrder) {
    for (let row of grouped[disc]) {
      row.rowNumber = globalCounter;
      globalCounter++;
      finalArray.push(row);
    }
  }
  return finalArray;
};

export const reorderRowsByDisciplineAndGroup = (rows) => {
  const grouped = rows.reduce((acc, row) => {
    const disciplineKey = row.Discipline || "Sin Disciplina";
    const codeKey = row.Code || "Sin Código";
    if (!acc[disciplineKey]) acc[disciplineKey] = {};
    if (!acc[disciplineKey][codeKey]) acc[disciplineKey][codeKey] = [];
    acc[disciplineKey][codeKey].push(row);
    return acc;
  }, {});

  const finalArray = [];
  let globalCounter = 1;

  const sortedDisciplines = Object.keys(grouped).sort();
  sortedDisciplines.forEach((discipline) => {
    const sortedCodes = Object.keys(grouped[discipline]).sort();
    sortedCodes.forEach((code) => {
      grouped[discipline][code].forEach((row) => {
        row.rowNumber = globalCounter++;
        finalArray.push(row);
      });
    });
  });

  return finalArray;
};

export const formatTotal = (key, value) => {
  if (!value && value !== 0) return "";
  const number = parseFloat(value).toFixed(2);
  switch (key) {
    case "Length":
    case "Width":
    case "Height":
    case "Perimeter":
    case "Thickness":
      return `${number} m`;
    case "Area":
      return `${number} m²`;
    case "Volume":
      return `${number} m³`;
    default:
      return number;
  }
};
