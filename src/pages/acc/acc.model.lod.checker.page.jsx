import React, { useState } from 'react';
import ACCPlatformLayout from '../../components/platform_page_components/acc.platform.layout';
import { LODTableArquitectura } from '../../components/model_LOD_checker_components/LODTableArquitectura';
import { LODTableEstructuraConcreto } from '../../components/model_LOD_checker_components/LODTableEstructuraConcreto';
import { LODTableEstructuraAcero } from '../../components/model_LOD_checker_components/LODTableEstructuraAcero';
import { LODTableInstalacionHidrosanitaria } from '../../components/model_LOD_checker_components/LODTableInstalacionHidrosanitaria';
import { LODTableInstalacionElectrica } from '../../components/model_LOD_checker_components/LODTableInstalacionElectrica';
import { LODTableSistemasEspeciales } from '../../components/model_LOD_checker_components/LODTableSistemasEspeciales';
import { LODTableHVAC } from '../../components/model_LOD_checker_components/LODTableHVAC';

export default function ACCModelLODCheckerPage() {
  const disciplinas = [
    'Arquitectura',
    'Estructura de Concreto',
    'Estructura de Acero',
    'Instalación Hidrosanitaria',
    'Instalación Eléctrica',
    'Sistemas Especiales',
    'HVAC'
  ];

  const [disciplina, setDisciplina] = useState(disciplinas[0]);

  const renderTabla = () => {
    switch (disciplina) {
      case 'Arquitectura':
        return <LODTableArquitectura />;
      case 'Estructura de Concreto':
        return <LODTableEstructuraConcreto />;
      case 'Estructura de Acero':
        return <LODTableEstructuraAcero />;
      case 'Instalación Hidrosanitaria':
        return <LODTableInstalacionHidrosanitaria />;
      case 'Instalación Eléctrica':
        return <LODTableInstalacionElectrica />;
      case 'Sistemas Especiales':
        return <LODTableSistemasEspeciales />;
      case 'HVAC':
        return <LODTableHVAC />;
      default:
        return null;
    }
  };

  return (
    <ACCPlatformLayout>
      <div className="flex">
        <aside className="w-1/4 bg-gray-100 p-4">
          <h2 className="text-lg font-semibold mb-4">Disciplinas</h2>
          <ul>
            {disciplinas.map((disc) => (
              <li key={disc}>
                <button
                  className={`block w-full text-left p-2 my-1 rounded ${
                    disciplina === disc ? 'bg-blue-500 text-white' : 'hover:bg-blue-100'
                  }`}
                  onClick={() => setDisciplina(disc)}
                >
                  {disc}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="flex-1 p-4">
          <h1 className="text-2xl font-bold mb-4">Verificador LOD - {disciplina}</h1>
          {renderTabla()}
        </div>
      </div>
    </ACCPlatformLayout>
  );
}
