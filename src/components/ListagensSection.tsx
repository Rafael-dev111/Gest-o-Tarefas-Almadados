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
          propostasFiltradas = propostas.filter(p => p.situacao === 'ativa');
        } else if (filtroStatus === 'finalizadas') {
          propostasFiltradas = propostas.filter(p => p.situacao === 'concluida-sucesso' || p.situacao === 'concluida-sem-sucesso');
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
                @page {
                  margin: 1.5cm;
                  size: A4;
                  @bottom-left { content: "Gestão Almadados© 2025 Almadados - Todos os direitos reservados"; }
                  @bottom-right { content: "página " counter(page) " de " counter(pages); }
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0;
                  line-height: 1.4;
                  color: #333;
                  font-size: 11px;
                  background: #fff;
                }
                .header {
                  margin-bottom: 25px;
                  display: flex;
                  align-items: center;
                  justify-content: flex-start;
                  gap: 15px;
                }
                .logo {
                  max-height: 60px;
                  width: auto;
                }
                .company-info {
                  text-align: left;
                  font-size: 11px;
                  color: #333;
                  line-height: 1.1;
                }
                .company-info div {
                  margin: 0;
                  padding: 0;
                  line-height: 1.1;
                }
                .company-name {
                  font-size: 14px;
                  font-weight: bold;
                  color: #333;
                  margin-bottom: 2px;
                }
                .report-info {
                  margin-top: 15px;
                  text-align: left;
                  font-size: 11px;
                }
                .report-title {
                  font-size: 14px;
                  font-weight: bold;
                  color: #333;
                  margin-bottom: 5px;
                }
                h1 { 
                  color: #333; 
                  font-size: 16px;
                  margin: 0;
                  font-weight: bold;
                }
                h3 {
                  color: #333;
                  font-size: 14px;
                  margin: 20px 0 15px 0;
                  font-weight: bold;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 15px 0;
                  font-size: 10px;
                }
                th { 
                  background: #f0f0f0;
                  color: #333;
                  padding: 8px 6px;
                  text-align: left;
                  font-weight: bold;
                  font-size: 10px;
                  border: 1px solid #ccc;
                }
                td { 
                  border: 1px solid #ccc; 
                  padding: 6px; 
                  vertical-align: top;
                  background: #fff;
                  font-size: 10px;
                }
                tr:nth-child(even) td {
                  background: #f9f9f9;
                }
                .status-pendente { 
                  background-color: #fff3cd !important; 
                  color: #856404;
                }
                .status-final { 
                  background-color: #d4edda !important; 
                  color: #155724;
                }
                .status-sem-interesse { 
                  background-color: #f8d7da !important; 
                  color: #721c24;
                }
                .bg-green-100 {
                  background-color: #d4edda !important;
                  color: #155724;
                }
                .bg-yellow-100 {
                  background-color: #fff3cd !important;
                  color: #856404;
                }
                .bg-red-100 {
                  background-color: #f8d7da !important;
                  color: #721c24;
                }
                .footer {
                  position: fixed;
                  bottom: 20px;
                  left: 0;
                  right: 0;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 9px;
                  color: #666;
                  padding: 0 20px;
                }
                .footer-left {
                  text-align: left;
                }
                .footer-center {
                  text-align: center;
                  flex: 1;
                  margin: 0 20px;
                }
                @media print { 
                  body { 
                    margin: 0; 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .header { break-inside: avoid; }
                  table { break-inside: avoid; }
                  tr { break-inside: avoid; }
                  h3 { break-after: avoid; }
                  .total-registos { break-inside: avoid; }
                }
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
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `almadados_${filtroTipo}_${new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { 
          unit: 'in', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
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
            <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <th className="border border-gray-300 p-3 text-left w-1/4">Cliente</th>
              <th className="border border-gray-300 p-3 text-left w-2/5">Assunto</th>
              <th className="border border-gray-300 p-3 text-left w-20">Data</th>
              <th className="border border-gray-300 p-3 text-left w-20">Status</th>
              <th className="border border-gray-300 p-3 text-left w-20">Proposta</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((tarefa: any, index: number) => (
              <tr key={tarefa.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">{tarefa.cliente}</td>
                <td className="border border-gray-300 p-3">{tarefa.assunto}</td>
                <td className="border border-gray-300 p-3 text-center font-medium">
                  {new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}
                </td>
                <td className={`border border-gray-300 p-3 text-center ${tarefa.concluida ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {tarefa.concluida ? 'Concluida' : 'Pendente'}
                </td>
                <td className="border border-gray-300 p-3 text-center font-medium">{tarefa.proposta || '-'}</td>
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
            <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <th className="border border-gray-300 p-3 text-left w-20">Nº Prop.</th>
              <th className="border border-gray-300 p-3 text-left w-1/5">Cliente</th>
              <th className="border border-gray-300 p-3 text-left w-1/3">Assunto</th>
              <th className="border border-gray-300 p-3 text-left w-20">Data</th>
              <th className="border border-gray-300 p-3 text-left w-24">Situação</th>
              <th className="border border-gray-300 p-3 text-left">Seguimento</th>
            </tr>
          </thead>
          <tbody>
            {dadosFiltrados.map((proposta: any, index: number) => (
              <tr key={proposta.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3 font-mono text-center">#{proposta.numeracao}</td>
                <td className="border border-gray-300 p-3 font-medium">{proposta.cliente.empresa}</td>
                <td className="border border-gray-300 p-3">{proposta.assunto}</td>
                <td className="border border-gray-300 p-3 text-center">
                  {new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')}
                </td>
                <td className={`border border-gray-300 p-3 text-center font-medium ${
                  proposta.situacao === 'ativa' ? 'bg-blue-100 text-blue-800' : 
                  proposta.situacao === 'concluida-sucesso' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {proposta.situacao === 'ativa' ? 'Ativa' : 
                   proposta.situacao === 'concluida-sucesso' ? 'Concluída com Sucesso' : 'Concluída sem Sucesso'}
                </td>
                <td className="border border-gray-300 p-3 text-sm">
                  {proposta.seguimento.length > 0 ? proposta.seguimento.slice(0, 2).join('; ') + (proposta.seguimento.length > 2 ? '...' : '') : '-'}
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
            <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <th className="border border-gray-300 p-3 text-left w-1/4">Empresa</th>
              <th className="border border-gray-300 p-3 text-left w-1/6">Contacto</th>
              <th className="border border-gray-300 p-3 text-left w-24">Telemóvel</th>
              <th className="border border-gray-300 p-3 text-left w-1/5">Email</th>
              <th className="border border-gray-300 p-3 text-left w-24">Localidade</th>
              <th className="border border-gray-300 p-3 text-left w-28">Tempo Negoc.</th>
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
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 p-3 font-medium">{cliente.empresa}</td>
                  <td className="border border-gray-300 p-3">{cliente.contacto || '-'}</td>
                  <td className="border border-gray-300 p-3 text-center">{cliente.telemovel || '-'}</td>
                  <td className="border border-gray-300 p-3 text-sm">{cliente.email || '-'}</td>
                  <td className="border border-gray-300 p-3 text-center">{cliente.localidade || '-'}</td>
                  <td className="border border-gray-300 p-3 text-center font-medium">
                    {tempoNegociacao > 0 ? (
                      <span className={`px-2 py-1 rounded text-xs ${
                        tempoNegociacao > 90 ? 'bg-red-100 text-red-800' :
                        tempoNegociacao > 30 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {tempoNegociacao} dias
                      </span>
                    ) : '-'}
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
            <div className="header mb-6">
              <div className="flex items-start space-x-4">
                <img src="/Almadados.jpg" alt="Almadados Logo" className="logo h-16 w-auto" />
                <div className="company-info">
                  <div className="company-name font-bold">Almadados Informática, Lda</div>
                  <div>R. Ramiro Ferrão, 40 Esc. Dto</div>
                  <div>2800 - 505 Almada</div>
                  <div>Mat. Con. Reg. de n°</div>
                  <div>Contribuinte : 503708798</div>
                  
                  <div className="report-info mt-4">
                    <div className="report-title font-bold">
                      Relatório de {filtroTipo === 'tarefas' ? 'Tarefas' : filtroTipo === 'propostas' ? 'Propostas' : 'Clientes'} | Data: {new Date().toLocaleDateString('pt-PT')} | Hora: {new Date().toLocaleTimeString('pt-PT')}
                    </div>
                  </div>
                </div>
              </div>
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
            
            <div className="footer mt-8" style={{display: 'none'}}>
              <div className="footer-left">Gestão Almadados© 2025 Almadados - Todos os direitos reservados</div>
              <div className="footer-center">página 1 de 1</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}