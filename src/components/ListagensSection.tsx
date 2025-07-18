import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Printer, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';

type TipoListagem = 'tarefas' | 'propostas' | 'clientes' | 'areas';
type FiltroTarefas = 'todas' | 'pendentes' | 'concluidas';
type FiltroPropostas = 'todas' | 'ativas' | 'concluidas-sucesso' | 'concluidas-sem-sucesso';
type FiltroClientes = 'todos' | 'por-area';

export function ListagensSection() {
  const [tipoListagem, setTipoListagem] = useState<TipoListagem>('tarefas');
  const [filtroTarefas, setFiltroTarefas] = useState<FiltroTarefas>('todas');
  const [filtroPropostas, setFiltroPropostas] = useState<FiltroPropostas>('todas');
  const [filtroClientes, setFiltroClientes] = useState<FiltroClientes>('todos');
  const [areaEscolhida, setAreaEscolhida] = useState<string>('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  
  const { tarefas, propostas, clientes, areas } = useLocalStorage();

  const aplicarFiltroData = (data: any[], propriedadeData: string) => {
    if (!dataInicio || !dataFim) return data;
    
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    return data.filter(item => {
      const dataItem = new Date(item[propriedadeData]);
      return dataItem >= inicio && dataItem <= fim;
    });
  };

  const obterDadosFiltrados = () => {
    switch (tipoListagem) {
      case 'tarefas':
        let tarefasFiltradas = tarefas;
        
        if (filtroTarefas === 'pendentes') {
          tarefasFiltradas = tarefas.filter(t => !t.concluida);
        } else if (filtroTarefas === 'concluidas') {
          tarefasFiltradas = tarefas.filter(t => t.concluida);
        }
        
        tarefasFiltradas = aplicarFiltroData(tarefasFiltradas, 'criadaEm');
        return tarefasFiltradas.sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());

      case 'propostas':
        let propostasFiltradas = propostas;
        
        if (filtroPropostas === 'ativas') {
          propostasFiltradas = propostas.filter(p => p.situacao === 'ativa');
        } else if (filtroPropostas === 'concluidas-sucesso') {
          propostasFiltradas = propostas.filter(p => p.situacao === 'concluida-sucesso');
        } else if (filtroPropostas === 'concluidas-sem-sucesso') {
          propostasFiltradas = propostas.filter(p => p.situacao === 'concluida-sem-sucesso');
        }
        
        propostasFiltradas = aplicarFiltroData(propostasFiltradas, 'dataCreacao');
        return propostasFiltradas.sort((a, b) => new Date(b.dataCreacao).getTime() - new Date(a.dataCreacao).getTime());

      case 'clientes':
        let clientesFiltrados = clientes;
        
        if (filtroClientes === 'por-area' && areaEscolhida) {
          clientesFiltrados = clientes.filter(c => c.area === areaEscolhida);
        }
        
        clientesFiltrados = aplicarFiltroData(clientesFiltrados, 'criadoEm');
        return clientesFiltrados.sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());

      case 'areas':
        return areas.sort((a, b) => new Date(b.criadaEm).getTime() - new Date(a.criadaEm).getTime());

      default:
        return [];
    }
  };

  const dadosFiltrados = obterDadosFiltrados();

  const obterTituloRelatorio = () => {
    const dataAtual = new Date();
    const dataFormatada = dataAtual.toLocaleDateString('pt-PT');
    const horaFormatada = dataAtual.toLocaleTimeString('pt-PT');
    
    let tipo = '';
    switch (tipoListagem) {
      case 'tarefas':
        tipo = 'Tarefas';
        break;
      case 'propostas':
        tipo = 'Propostas';
        break;
      case 'clientes':
        tipo = 'Clientes';
        break;
      case 'areas':
        tipo = 'Áreas';
        break;
    }
    
    return `Relatório de ${tipo} | Data: ${dataFormatada} | Hora: ${horaFormatada}`;
  };

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
                  margin: 1cm;
                  size: A4 landscape;
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
                .header {
                  display: flex;
                  align-items: flex-start;
                  gap: 15px;
                  margin-bottom: 20px;
                }
                .logo {
                  max-height: 60px;
                  width: auto;
                }
                .company-info {
                  font-size: 11px;
                  line-height: 1.2;
                }
                .company-name {
                  font-size: 14px;
                  font-weight: bold;
                  margin-bottom: 2px;
                }
                .report-title {
                  font-size: 16px;
                  font-weight: bold;
                  text-align: center;
                  margin: 20px 0;
                  color: #333;
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
                  border: 1px solid #ccc;
                  font-size: 10px;
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
                .status-concluida { 
                  background-color: #d4edda !important; 
                  color: #155724;
                }
                .status-ativa { 
                  background-color: #cce7ff !important; 
                  color: #004085;
                }
                .status-sucesso { 
                  background-color: #d4edda !important; 
                  color: #155724;
                }
                .status-sem-sucesso { 
                  background-color: #f8d7da !important; 
                  color: #721c24;
                }
                .footer {
                  position: fixed;
                  bottom: 20px;
                  left: 0;
                  right: 0;
                  text-align: center;
                  font-size: 10px;
                  color: #666;
                  border-top: 1px solid #ccc;
                  padding-top: 10px;
                }
                .page-number {
                  position: fixed;
                  bottom: 20px;
                  right: 20px;
                  font-size: 10px;
                  color: #666;
                }
                @media print { 
                  body { 
                    margin: 0; 
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  .header { break-inside: avoid; }
                  .report-title { break-after: avoid; }
                  table { break-inside: avoid; }
                  tr { break-inside: avoid; }
                }
              </style>
            </head>
            <body>
              ${conteudo.innerHTML}
              <div class="footer">
                Gestão Almadados© 2025 Almadados - Todos os direitos reservados
              </div>
              <div class="page-number">
                Página 1 de 1
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
        margin: [0.4, 0.4, 0.4, 0.4],
        filename: `almadados_${tipoListagem}_${new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}.pdf`,
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
          orientation: 'landscape',
          compress: true
        }
      };
      
      html2pdf().from(conteudo).set(opt).save();
    }
  };

  const renderTarefas = () => (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <th className="border border-gray-300 p-3 text-left">Cliente</th>
          <th className="border border-gray-300 p-3 text-left">Assunto</th>
          <th className="border border-gray-300 p-3 text-left">Data Criação</th>
          <th className="border border-gray-300 p-3 text-left">Status</th>
          <th className="border border-gray-300 p-3 text-left">Proposta</th>
        </tr>
      </thead>
      <tbody>
        {dadosFiltrados.map((tarefa: any, index: number) => (
          <tr key={tarefa.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-3">{tarefa.cliente}</td>
            <td className="border border-gray-300 p-3">{tarefa.assunto}</td>
            <td className="border border-gray-300 p-3 text-center">
              {new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}
            </td>
            <td className={`border border-gray-300 p-3 text-center ${tarefa.concluida ? 'status-concluida' : 'status-pendente'}`}>
              {tarefa.concluida ? 'Concluída' : 'Pendente'}
            </td>
            <td className="border border-gray-300 p-3 text-center">{tarefa.proposta || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderPropostas = () => (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <th className="border border-gray-300 p-3 text-left">Nº Prop.</th>
          <th className="border border-gray-300 p-3 text-left">Cliente</th>
          <th className="border border-gray-300 p-3 text-left">Assunto</th>
          <th className="border border-gray-300 p-3 text-left">Área</th>
          <th className="border border-gray-300 p-3 text-left">Data Criação</th>
          <th className="border border-gray-300 p-3 text-left">Situação</th>
          <th className="border border-gray-300 p-3 text-left">Último Seguimento</th>
        </tr>
      </thead>
      <tbody>
        {dadosFiltrados.map((proposta: any, index: number) => (
          <tr key={proposta.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-3 text-center font-mono">#{proposta.numeracao}</td>
            <td className="border border-gray-300 p-3">{proposta.cliente.empresa}</td>
            <td className="border border-gray-300 p-3">{proposta.assunto}</td>
            <td className="border border-gray-300 p-3">{proposta.area}</td>
            <td className="border border-gray-300 p-3 text-center">
              {new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')}
            </td>
            <td className={`border border-gray-300 p-3 text-center ${
              proposta.situacao === 'ativa' ? 'status-ativa' : 
              proposta.situacao === 'concluida-sucesso' ? 'status-sucesso' : 'status-sem-sucesso'
            }`}>
              {proposta.situacao === 'ativa' ? 'Ativa' : 
               proposta.situacao === 'concluida-sucesso' ? 'Concluída com Sucesso' : 'Concluída sem Sucesso'}
            </td>
            <td className="border border-gray-300 p-3 text-sm">
              {proposta.seguimento.length > 0 ? 
                proposta.seguimento[proposta.seguimento.length - 1].detalhes.substring(0, 50) + '...' : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderClientes = () => (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <th className="border border-gray-300 p-3 text-left">Empresa</th>
          <th className="border border-gray-300 p-3 text-left">Contacto</th>
          <th className="border border-gray-300 p-3 text-left">Telemóvel</th>
          <th className="border border-gray-300 p-3 text-left">Email</th>
          <th className="border border-gray-300 p-3 text-left">Localidade</th>
          <th className="border border-gray-300 p-3 text-left">Área</th>
          <th className="border border-gray-300 p-3 text-left">Data Criação</th>
        </tr>
      </thead>
      <tbody>
        {dadosFiltrados.map((cliente: any, index: number) => (
          <tr key={cliente.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-3">{cliente.empresa}</td>
            <td className="border border-gray-300 p-3">{cliente.contacto || '-'}</td>
            <td className="border border-gray-300 p-3 text-center">{cliente.telemovel || '-'}</td>
            <td className="border border-gray-300 p-3">{cliente.email || '-'}</td>
            <td className="border border-gray-300 p-3">{cliente.localidade || '-'}</td>
            <td className="border border-gray-300 p-3">{cliente.area || '-'}</td>
            <td className="border border-gray-300 p-3 text-center">
              {new Date(cliente.criadoEm).toLocaleDateString('pt-PT')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderAreas = () => (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <th className="border border-gray-300 p-3 text-left">Nome da Área</th>
          <th className="border border-gray-300 p-3 text-left">Descrição</th>
          <th className="border border-gray-300 p-3 text-left">Data Criação</th>
          <th className="border border-gray-300 p-3 text-left">Nº Propostas</th>
        </tr>
      </thead>
      <tbody>
        {dadosFiltrados.map((area: any, index: number) => {
          const numeroPropostas = propostas.filter(p => p.area === area.nome).length;
          return (
            <tr key={area.id} className="hover:bg-gray-50">
              <td className="border border-gray-300 p-3 font-medium">{area.nome}</td>
              <td className="border border-gray-300 p-3">{area.descricao || '-'}</td>
              <td className="border border-gray-300 p-3 text-center">
                {new Date(area.criadaEm).toLocaleDateString('pt-PT')}
              </td>
              <td className="border border-gray-300 p-3 text-center font-medium">{numeroPropostas}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  const renderFiltroEspecifico = () => {
    switch (tipoListagem) {
      case 'tarefas':
        return (
          <div>
            <Label htmlFor="filtro-tarefas">Filtro Tarefas</Label>
            <Select value={filtroTarefas} onValueChange={(value: FiltroTarefas) => setFiltroTarefas(value)}>
              <SelectTrigger id="filtro-tarefas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="pendentes">Pendentes</SelectItem>
                <SelectItem value="concluidas">Concluídas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'propostas':
        return (
          <div>
            <Label htmlFor="filtro-propostas">Filtro Propostas</Label>
            <Select value={filtroPropostas} onValueChange={(value: FiltroPropostas) => setFiltroPropostas(value)}>
              <SelectTrigger id="filtro-propostas">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="ativas">Ativas</SelectItem>
                <SelectItem value="concluidas-sucesso">Concluídas com Sucesso</SelectItem>
                <SelectItem value="concluidas-sem-sucesso">Concluídas sem Sucesso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 'clientes':
        return (
          <>
            <div>
              <Label htmlFor="filtro-clientes">Filtro Clientes</Label>
              <Select value={filtroClientes} onValueChange={(value: FiltroClientes) => setFiltroClientes(value)}>
                <SelectTrigger id="filtro-clientes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="por-area">Por Área</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {filtroClientes === 'por-area' && (
              <div>
                <Label htmlFor="area-escolhida">Área</Label>
                <Select value={areaEscolhida} onValueChange={setAreaEscolhida}>
                  <SelectTrigger id="area-escolhida">
                    <SelectValue placeholder="Escolha uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.map(area => (
                      <SelectItem key={area.id} value={area.nome}>{area.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Filtros de Listagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="tipo-listagem">Tipo de Listagem</Label>
              <Select value={tipoListagem} onValueChange={(value: TipoListagem) => setTipoListagem(value)}>
                <SelectTrigger id="tipo-listagem">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarefas">Tarefas</SelectItem>
                  <SelectItem value="propostas">Propostas</SelectItem>
                  <SelectItem value="clientes">Clientes</SelectItem>
                  <SelectItem value="areas">Áreas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {renderFiltroEspecifico()}
            
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
                </div>
              </div>
            </div>
            
            <div className="report-title text-center font-bold text-lg mb-6">
              {obterTituloRelatorio()}
            </div>
            
            {dadosFiltrados.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum registo encontrado com os filtros aplicados</p>
            ) : (
              <div className="overflow-x-auto">
                {tipoListagem === 'tarefas' && renderTarefas()}
                {tipoListagem === 'propostas' && renderPropostas()}
                {tipoListagem === 'clientes' && renderClientes()}
                {tipoListagem === 'areas' && renderAreas()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}