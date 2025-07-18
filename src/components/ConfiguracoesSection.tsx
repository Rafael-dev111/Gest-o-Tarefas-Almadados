import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Download, Upload, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function ConfiguracoesSection() {
  const [dadosImportacao, setDadosImportacao] = useState('');
  const { clientes, tarefas, propostas, exportarDados, importarDados } = useLocalStorage();
  const { toast } = useToast();

  const handleExportar = () => {
    const dados = exportarDados();
    const blob = new Blob([dados], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `almadados-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup exportado com sucesso",
      description: "Os dados foram exportados para um arquivo JSON.",
    });
  };

  const handleImportar = () => {
    if (!dadosImportacao) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados JSON para importar.",
        variant: "destructive",
      });
      return;
    }

    const sucesso = importarDados(dadosImportacao);
    if (sucesso) {
      toast({
        title: "Dados importados com sucesso",
        description: "Os dados foram restaurados com sucesso.",
      });
      setDadosImportacao('');
    } else {
      toast({
        title: "Erro na importação",
        description: "Erro ao importar os dados. Verifique o formato JSON.",
        variant: "destructive",
      });
    }
  };

  const handleLimparDados = () => {
    const senha = prompt('Digite a senha para confirmar a limpeza dos dados:');
    if (senha === '503708798') {
      if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.removeItem('almadados-clientes');
        localStorage.removeItem('almadados-tarefas');
        localStorage.removeItem('almadados-propostas');
        window.location.reload();
      }
    } else if (senha !== null) {
      toast({
        title: "Senha incorreta",
        description: "A senha digitada está incorreta.",
        variant: "destructive",
      });
    }
  };

  const estatisticas = {
    totalClientes: clientes.length,
    totalTarefas: tarefas.length,
    tarefasConcluidas: tarefas.filter(t => t.concluida).length,
    totalPropostas: propostas.length,
    propostasFinalizadas: propostas.filter(p => p.situacao === 'concluida-sucesso' || p.situacao === 'concluida-sem-sucesso').length,
    propostasPendentes: propostas.filter(p => p.situacao === 'ativa').length,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Estatísticas do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-primary-light p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.totalClientes}</div>
              <div className="text-sm text-gray-600">Clientes</div>
            </div>
            <div className="bg-primary-light p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.totalTarefas}</div>
              <div className="text-sm text-gray-600">Tarefas</div>
              <div className="text-xs text-gray-500">
                {estatisticas.tarefasConcluidas} concluídas
              </div>
            </div>
            <div className="bg-primary-light p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">{estatisticas.totalPropostas}</div>
              <div className="text-sm text-gray-600">Propostas</div>
              <div className="text-xs text-gray-500">
                {estatisticas.propostasFinalizadas} finalizadas
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Backup e Restauração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Exportar Dados</h3>
            <p className="text-sm text-gray-600 mb-4">
              Faça o backup de todos os seus dados para um arquivo JSON que pode ser importado posteriormente.
            </p>
            <Button onClick={handleExportar} className="flex items-center space-x-2">
              <Download size={16} />
              <span>Exportar Backup</span>
            </Button>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Importar Dados</h3>
            <p className="text-sm text-gray-600 mb-4">
              Restaure seus dados a partir de um arquivo de backup JSON.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dados-importacao">Cole os dados JSON aqui:</Label>
                <Textarea
                  id="dados-importacao"
                  value={dadosImportacao}
                  onChange={(e) => setDadosImportacao(e.target.value)}
                  placeholder="Cole o conteúdo do arquivo JSON aqui..."
                  rows={10}
                />
              </div>
              <Button onClick={handleImportar} className="flex items-center space-x-2">
                <Upload size={16} />
                <span>Importar Dados</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="font-medium mb-2">Limpar Todos os Dados</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta ação irá remover permanentemente todos os dados do sistema. Use com cuidado!
            </p>
            <Button 
              onClick={handleLimparDados} 
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 size={16} />
              <span>Limpar Todos os Dados</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Sobre o Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>Sistema:</strong> Gestão de Tarefas - Almadados</p>
            <p><strong>Versão:</strong> 1.0.0</p>
            <p><strong>Armazenamento:</strong> LocalStorage (funciona offline)</p>
            <p><strong>Funcionalidades:</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Gestão de Tarefas</li>
              <li>Gestão de Propostas com seguimento</li>
              <li>Gestão de Clientes</li>
              <li>Listagens e relatórios</li>
              <li>Backup e restauração de dados</li>
              <li>Impressão de relatórios</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}