
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Printer, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export function ListagensSection() {
  const [filtroTipo, setFiltroTipo] = useState<'tarefas' | 'propostas' | 'clientes'>('tarefas');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'pendentes' | 'finalizadas'>('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const { tarefas, propostas, clientes } = useLocalStorage();

  const filtrarDados = () => {
    switch (filtroTipo) {
      case 'tarefas':
        let tarefasFiltradas = tarefas;
        if (filtroStatus === 'pendentes') {
          tarefasFiltradas = tarefas.filter(t => !t.concluida);
        } else if (filtroStatus === 'finalizadas') {
          tarefasFiltradas = tarefas.filter(t => t.concluida);
        }
        return tarefasFiltradas;
      
      case 'propostas':
        let propostasFiltradas = propostas;
        if (filtroStatus === 'pendentes') {
          propostasFiltradas = propostas.filter(p => p.situacao === 'pendente');
        } else if (filtroStatus === 'finalizadas') {
          propostasFiltradas = propostas.filter(p => p.situacao === 'final');
        }
        
        // Filtrar por data se especificado
        if (dataInicio && dataFim) {
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          propostasFiltradas = propostasFiltradas.filter(p => {
            const dataCreacao = new Date(p.dataCreacao);
            return dataCreacao >= inicio && dataCreacao <= fim;
          });
        }
        return propostasFiltradas;
      
      case 'clientes':
        if (dataInicio && dataFim) {
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          return clientes.filter(c => {
            const clientePropostas = propostas.filter(p => p.cliente.empresa === c.empresa);
            return clientePropostas.some(p => {
              const dataCreacao = new Date(p.dataCreacao);
              return dataCreacao >= inicio && dataCreacao <= fim;
            });
          });
        }
        return clientes;
      
      default:
        return [];
    }
  };

  const dadosFiltrados = filtrarDados();

  const handleImprimir = () => {
    const conteudo = document.getElementById('conteudo-impressao');
    if (conteudo) {
      const janelaImpressao = window.open('', '_blank');
      if (janelaImpressao) {
        janelaImpressao.document.write(`
          <html>
            <head>
              <title>Listagem Almadados</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                h1 { color: #FF6600; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status-pendente { background-color: #fff3cd; }
                .status-final { background-color: #d4edda; }
                .status-sem-interesse { background-color: #f8d7da; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${conteudo.innerHTML}
            </body>
          </html>
        `);
        janelaImpressao.document.close();
        janelaImpressao.print();
        janelaImpressao.close();
      }
    }
  };

  const handleGerarPDF = () => {
    const conteudo = document.getElementById('conteudo-impressao');
    if (conteudo) {
      const opt = {
        margin: 1,
        filename: `almadados_${filtroTipo}_${new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      
      html2pdf().from(conteudo).set(opt).save();
    }
  };

  const renderTarefas = () => (
    <div>
      <h3 className="text-lg font-medium mb-4">
        Tarefas {filtroStatus === 'pendentes' ? 'Pendentes' : filtroStatus === 'finalizadas' ? 'Finalizadas' : ''}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">#</th>
              <th className="border border-gray-300 p-2 text-left">Cliente</th>
              <th className="border border-gray-300 p-2 text-left">Assunto</th>
              <th className="border border-gray-300 p-2 text-left">Data</th>
              <th className="border border-gray-300 p-2 text-left">Status</th>
              <th className="border border-gray-300 p-2 text-left">Proposta</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((tarefa: any, index: number) => (
              <tr key={tarefa.id}>
                <td className="border border-gray-300 p-2 font-medium">#{index + 1}</td>
                <td className="border border-gray-300 p-2">{tarefa.cliente}</td>
                <td className="border border-gray-300 p-2">{tarefa.assunto}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}
                </td>
                <td className={`border border-gray-300 p-2 ${tarefa.concluida ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {tarefa.concluida ? 'Concluída' : 'Pendente'}
                </td>
                <td className="border border-gray-300 p-2">{tarefa.proposta || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPropostas = () => (
    <div>
      <h3 className="text-lg font-medium mb-4">
        Propostas {filtroStatus === 'pendentes' ? 'Pendentes' : filtroStatus === 'finalizadas' ? 'Finalizadas' : ''}
        {dataInicio && dataFim && ` (${new Date(dataInicio).toLocaleDateString('pt-PT')} - ${new Date(dataFim).toLocaleDateString('pt-PT')})`}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">#</th>
              <th className="border border-gray-300 p-2 text-left">Proposta</th>
              <th className="border border-gray-300 p-2 text-left">Cliente</th>
              <th className="border border-gray-300 p-2 text-left">Assunto</th>
              <th className="border border-gray-300 p-2 text-left">Data</th>
              <th className="border border-gray-300 p-2 text-left">Situação</th>
              <th className="border border-gray-300 p-2 text-left">Seguimento</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((proposta: any, index: number) => (
              <tr key={proposta.id}>
                <td className="border border-gray-300 p-2 font-medium">#{index + 1}</td>
                <td className="border border-gray-300 p-2">#{proposta.numeracao}</td>
                <td className="border border-gray-300 p-2">{proposta.cliente.empresa}</td>
                <td className="border border-gray-300 p-2">{proposta.assunto}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')}
                </td>
                <td className={`border border-gray-300 p-2 ${
                  proposta.situacao === 'pendente' ? 'bg-yellow-100' : 
                  proposta.situacao === 'final' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {proposta.situacao === 'pendente' ? 'Pendente' : 
                   proposta.situacao === 'sem-interesse' ? 'Sem Interesse' : 'Final'}
                </td>
                <td className="border border-gray-300 p-2">
                  {proposta.seguimento.length > 0 ? proposta.seguimento.join('; ') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClientes = () => (
    <div>
      <h3 className="text-lg font-medium mb-4">
        Clientes {dataInicio && dataFim && `com Propostas (${new Date(dataInicio).toLocaleDateString('pt-PT')} - ${new Date(dataFim).toLocaleDateString('pt-PT')})`}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-300 p-2 text-left">#</th>
              <th className="border border-gray-300 p-2 text-left">Empresa</th>
              <th className="border border-gray-300 p-2 text-left">Contacto</th>
              <th className="border border-gray-300 p-2 text-left">Telemóvel</th>
              <th className="border border-gray-300 p-2 text-left">Email</th>
              <th className="border border-gray-300 p-2 text-left">Localidade</th>
              <th className="border border-gray-300 p-2 text-left">Tempo de Negociação</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((cliente: any, index: number) => {
              const clientePropostas = propostas.filter(p => p.cliente.empresa === cliente.empresa);
              const primeiraPropostaData = clientePropostas.length > 0 ? 
                new Date(Math.min(...clientePropostas.map(p => new Date(p.dataCreacao).getTime()))) : null;
              const tempoNegociacao = primeiraPropostaData ? 
                Math.floor((Date.now() - primeiraPropostaData.getTime()) / (1000 * 60 * 60 * 24)) : 0;
              
              return (
                <tr key={cliente.id}>
                  <td className="border border-gray-300 p-2 font-medium">#{index + 1}</td>
                  <td className="border border-gray-300 p-2">{cliente.empresa}</td>
                  <td className="border border-gray-300 p-2">{cliente.contacto || '-'}</td>
                  <td className="border border-gray-300 p-2">{cliente.telemovel || '-'}</td>
                  <td className="border border-gray-300 p-2">{cliente.email || '-'}</td>
                  <td className="border border-gray-300 p-2">{cliente.localidade || '-'}</td>
                  <td className="border border-gray-300 p-2">
                    {tempoNegociacao > 0 ? `${tempoNegociacao} dias` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Filtros de Listagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tipo-filtro">Tipo de Listagem</Label>
              <Select value={filtroTipo} onValueChange={(value: any) => setFiltroTipo(value)}>
                <SelectTrigger id="tipo-filtro">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarefas">Tarefas</SelectItem>
                  <SelectItem value="propostas">Propostas</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status-filtro">Status</Label>
              <Select value={filtroStatus} onValueChange={(value: any) => setFiltroStatus(value)}>
                <SelectTrigger id="status-filtro">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendentes">Pendentes</SelectItem>
                  <SelectItem value="finalizadas">Finalizadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Total de registos: {dadosFiltrados.length}
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleImprimir} className="flex items-center space-x-2">
                <Printer size={16} />
                <span>Imprimir</span>
              </Button>
              <Button onClick={handleGerarPDF} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700">
                <FileText size={16} />
                <span>Gerar PDF</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Resultados da Listagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="conteudo-impressao">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-primary mb-2">Gestão de Tarefas - Almadados</h1>
              <p className="text-gray-600">
                Listagem gerada em {new Date().toLocaleDateString('pt-PT')} às {new Date().toLocaleTimeString('pt-PT')}
              </p>
            </div>
            
            {dadosFiltrados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum registo encontrado com os filtros aplicados</p>
            ) : (
              <>
                {filtroTipo === 'tarefas' && renderTarefas()}
                {filtroTipo === 'propostas' && renderPropostas()}
                {filtroTipo === 'clientes' && renderClientes()}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
