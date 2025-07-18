
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Printer, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
// Usar imagem da pasta public

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
              <title>Relatório Almadados</title>
              <style>
                @page {
                  margin: 1.5cm;
                  size: A4;
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0; 
                  padding: 0;
                  line-height: 1.4;
                  color: #333;
                  font-size: 12px;
                  background: #fff;
                }
                
                /* Cabeçalho */
                .header {
                  display: flex;
                  align-items: center;
                  margin-bottom: 30px;
                  gap: 15px;
                }
                .logo {
                  max-height: 50px;
                  width: auto;
                }
                .company-info h1 {
                  font-size: 16px;
                  font-weight: bold;
                  margin: 0;
                  color: #333;
                }
                .company-info p {
                  margin: 2px 0;
                  font-size: 11px;
                  color: #666;
                }
                
                /* Informações do relatório */
                .report-info {
                  margin-bottom: 25px;
                  text-align: left;
                }
                .report-info h2 {
                  font-size: 14px;
                  font-weight: bold;
                  margin: 0 0 5px 0;
                  color: #333;
                }
                .report-info p {
                  margin: 2px 0;
                  font-size: 11px;
                  color: #666;
                }
                
                /* Tabela */
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 15px 0;
                  font-size: 10px;
                }
                th { 
                  background: #f5f5f5;
                  color: #333;
                  padding: 8px 6px;
                  text-align: left;
                  font-weight: bold;
                  font-size: 10px;
                  border: 1px solid #ddd;
                }
                td { 
                  border: 1px solid #ddd; 
                  padding: 6px; 
                  vertical-align: top;
                  background: #fff;
                  font-size: 10px;
                }
                tr:nth-child(even) td {
                  background: #fafafa;
                }
                
                /* Status colors */
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
                
                /* Rodapé */
                .footer {
                  position: fixed;
                  bottom: 1cm;
                  left: 1.5cm;
                  right: 1.5cm;
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  font-size: 9px;
                  color: #666;
                }
                .footer-left {
                  text-align: left;
                  line-height: 1.3;
                }
                .footer-right {
                  text-align: right;
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
                  .report-info { break-after: avoid; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <img src="/almadados-logo.png" alt="Almadados Logo" class="logo">
                <div class="company-info">
                  <h1>Almadados Informática, Lda</h1>
                  <p>R. Ramiro Ferrão, 40 Esc. Dto</p>
                  <p>2800 - 505 Almada</p>
                  <p>Mat. Con. Reg. de nº</p>
                  <p>Contribuinte: 503708798</p>
                </div>
              </div>
              
              <div class="report-info">
                <h2>Relatório de ${filtroTipo === 'tarefas' ? 'Tarefas' : filtroTipo === 'propostas' ? 'Propostas' : 'Clientes'}</h2>
                <p>Data: ${new Date().toLocaleDateString('pt-PT')}</p>
                <p>Hora: ${new Date().toLocaleTimeString('pt-PT')}</p>
              </div>
              
              ${conteudo.innerHTML}
              
              <div class="footer">
                <div class="footer-left">
                  <div>Documento gerado automaticamente pelo Sistema de Gestão Almadados</div>
                  <div>© 2025 Almadados – Todos os direitos reservados</div>
                </div>
                <div class="footer-right">
                  Página 1 de 1
                </div>
              </div>
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
                  proposta.situacao === 'pendente' ? 'bg-yellow-100 text-yellow-800' : 
                  proposta.situacao === 'final' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {proposta.situacao === 'pendente' ? 'Pendente' : 
                   proposta.situacao === 'sem-interesse' ? 'Sem Interesse' : 'Final'}
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
          <div className="flex gap-4 mb-6">
            <Button onClick={handleImprimir} className="flex items-center gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
            <Button onClick={handleGerarPDF} variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Gerar PDF
            </Button>
          </div>

          {/* Conteúdo visível para o usuário */}
          {filtroTipo === 'tarefas' && renderTarefas()}
          {filtroTipo === 'propostas' && renderPropostas()}
          {filtroTipo === 'clientes' && renderClientes()}

          {/* Conteúdo oculto apenas para impressão/PDF */}
          <div id="conteudo-impressao" style={{ visibility: 'hidden', position: 'absolute', top: '-9999px', left: '-9999px', width: '210mm', minHeight: '297mm', backgroundColor: 'white', padding: '1.5cm', fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#333' }}>
            {/* Cabeçalho */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', gap: '15px' }}>
              <img src="/almadados-logo.png" alt="Almadados Logo" style={{ maxHeight: '50px', width: 'auto' }} />
              <div>
                <h1 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0', color: '#333' }}>Almadados Informática, Lda</h1>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>R. Ramiro Ferrão, 40 Esc. Dto</p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>2800 - 505 Almada</p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Mat. Con. Reg. de nº</p>
                <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Contribuinte: 503708798</p>
              </div>
            </div>
            
            {/* Informações do relatório */}
            <div style={{ marginBottom: '25px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 5px 0', color: '#333' }}>
                Relatório de {filtroTipo === 'tarefas' ? 'Tarefas' : filtroTipo === 'propostas' ? 'Propostas' : 'Clientes'}
              </h2>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Data: {new Date().toLocaleDateString('pt-PT')}</p>
              <p style={{ margin: '2px 0', fontSize: '11px', color: '#666' }}>Hora: {new Date().toLocaleTimeString('pt-PT')}</p>
            </div>
            {filtroTipo === 'tarefas' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Assunto</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Data</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Status</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Proposta</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((tarefa: any, index: number) => (
                    <tr key={tarefa.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{tarefa.cliente}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{tarefa.assunto}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}</td>
                      <td style={{ 
                        border: '1px solid #ddd', 
                        padding: '6px',
                        backgroundColor: tarefa.concluida ? '#d4edda' : '#fff3cd',
                        color: tarefa.concluida ? '#155724' : '#856404'
                      }}>
                        {tarefa.concluida ? 'Concluida' : 'Pendente'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{tarefa.proposta || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {filtroTipo === 'propostas' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Nº Prop.</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Assunto</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Data</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Situação</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Seguimento</th>
                  </tr>
                </thead>
                <tbody>
                  {dadosFiltrados.map((proposta: any, index: number) => (
                    <tr key={proposta.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>#{proposta.numeracao}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{proposta.cliente.empresa}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{proposta.assunto}</td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>{new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')}</td>
                      <td style={{ 
                        border: '1px solid #ddd', 
                        padding: '6px',
                        backgroundColor: proposta.situacao === 'pendente' ? '#fff3cd' : 
                          proposta.situacao === 'final' ? '#d4edda' : '#f8d7da',
                        color: proposta.situacao === 'pendente' ? '#856404' : 
                          proposta.situacao === 'final' ? '#155724' : '#721c24'
                      }}>
                        {proposta.situacao === 'pendente' ? 'Pendente' : 
                         proposta.situacao === 'sem-interesse' ? 'Sem Interesse' : 'Final'}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                        {proposta.seguimento.length > 0 ? proposta.seguimento.slice(0, 2).join('; ') + (proposta.seguimento.length > 2 ? '...' : '') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {filtroTipo === 'clientes' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5' }}>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Empresa</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Contacto</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Telemóvel</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Email</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Localidade</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px 6px', textAlign: 'left', fontWeight: 'bold' }}>Tempo Negoc.</th>
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
                      <tr key={cliente.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cliente.empresa}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cliente.contacto || '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cliente.telemovel || '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cliente.email || '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>{cliente.localidade || '-'}</td>
                        <td style={{ border: '1px solid #ddd', padding: '6px' }}>
                          {tempoNegociacao > 0 ? `${tempoNegociacao} dias` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            
            {/* Rodapé */}
            <div style={{ 
              position: 'absolute', 
              bottom: '1cm', 
              left: '0', 
              right: '0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              fontSize: '9px', 
              color: '#666' 
            }}>
              <div style={{ textAlign: 'left', lineHeight: '1.3' }}>
                <div>Documento gerado automaticamente pelo Sistema de Gestão Almadados</div>
                <div>© 2025 Almadados – Todos os direitos reservados</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                Página 1 de 1
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
