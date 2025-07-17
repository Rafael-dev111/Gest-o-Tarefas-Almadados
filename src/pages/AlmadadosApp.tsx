import { useState } from 'react';
import { NavigationTabs } from '../components/NavigationTabs';
import { TarefasSection } from '../components/TarefasSection';
import { PropostasSection } from '../components/PropostasSection';
import { ClientesSection } from '../components/ClientesSection';
import { AreasSection } from '../components/AreasSection';
import { ListagensSection } from '../components/ListagensSection';
import { ConfiguracoesSection } from '../components/ConfiguracoesSection';

export default function AlmadadosApp() {
  const [activeTab, setActiveTab] = useState('tarefas');

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'tarefas':
        return <TarefasSection />;
      case 'propostas':
        return <PropostasSection />;
      case 'clientes':
        return <ClientesSection />;
      case 'areas':
        return <AreasSection />;
      case 'listagens':
        return <ListagensSection />;
      case 'configuracoes':
        return <ConfiguracoesSection />;
      default:
        return <TarefasSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-primary">Gestão de Tarefas</h1>
              <p className="text-gray-600">Almadados</p>
            </div>
            <div className="text-sm text-gray-500">
              Sistema de gestão offline com armazenamento local
            </div>
          </div>
        </div>
      </div>
      
      <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActiveSection()}
      </div>
    </div>
  );
}