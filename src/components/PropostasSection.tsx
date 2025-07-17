import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Cliente, Proposta } from '../types';
import { SeguimentoManager } from './SeguimentoManager';
import { Edit2, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

export function PropostasSection() {
  const [dataCreacao, setDataCreacao] = useState(new Date().toISOString().split('T')[0]);
  const [clienteData, setClienteData] = useState({
    empresa: '',
    contacto: '',
    telemovel: '',
    email: '',
    localidade: '',
    morada: '',
  });
  const [assunto, setAssunto] = useState('');
  const [seguimentoInicial, setSeguimentoInicial] = useState('');
  const [area, setArea] = useState('');
  const [editingProposta, setEditingProposta] = useState<string | null>(null);
  const [editingSituacao, setEditingSituacao] = useState<'pendente' | 'sem-interesse' | 'final'>('pendente');
  const [editingDetalhes, setEditingDetalhes] = useState('');
  const [editingArea, setEditingArea] = useState('');
  
  const { propostas, areas, adicionarProposta, adicionarSeguimentoProposta, atualizarProposta, eliminarProposta, buscarOuCriarCliente } = useLocalStorage();

  // Filtrar propostas por situação
  const propostasPendentes = propostas.filter(proposta => proposta.situacao === 'pendente');
  const propostasFinalizadas = propostas.filter(proposta => proposta.situacao === 'final');
  const propostasSemInteresse = propostas.filter(proposta => proposta.situacao === 'sem-interesse');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteData.empresa || !assunto) return;

    const cliente = buscarOuCriarCliente(clienteData.empresa, clienteData.contacto);
    
    // Criar seguimento inicial se fornecido
    const seguimentosIniciais = seguimentoInicial ? [{
      id: Date.now().toString(),
      data: dataCreacao,
      detalhes: seguimentoInicial,
      tipo: 'proposta' as const,
    }] : [];
    
    adicionarProposta({
      dataCreacao,
      cliente: {
        ...cliente,
        ...clienteData,
      },
      assunto,
      seguimento: seguimentosIniciais,
      situacao: 'pendente',
      area: area || undefined,
    });

    // Reset form
    setClienteData({
      empresa: '',
      contacto: '',
      telemovel: '',
      email: '',
      localidade: '',
      morada: '',
    });
    setAssunto('');
    setSeguimentoInicial('');
    setArea('');
    setDataCreacao(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = (proposta: Proposta) => {
    setEditingProposta(proposta.id);
    setEditingSituacao(proposta.situacao);
    setEditingDetalhes(proposta.detalhesPendente || '');
    setEditingArea(proposta.area || '');
  };

  const handleSaveEdit = (id: string) => {
    atualizarProposta(id, {
      situacao: editingSituacao,
      detalhesPendente: editingDetalhes || undefined,
      area: editingArea || undefined,
    });
    setEditingProposta(null);
    setEditingDetalhes('');
    setEditingArea('');
  };

  const handleEliminarProposta = (id: string) => {
    eliminarProposta(id);
  };

  const handleAddSeguimento = (propostaId: string, seguimento: any) => {
    adicionarSeguimentoProposta(propostaId, seguimento);
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sem-interesse':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'final':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderProposta = (proposta: Proposta) => (
    <div key={proposta.id} className="p-4 border rounded-lg bg-white border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-1">
            Proposta #{proposta.numeracao} - {proposta.assunto}
          </h3>
          <p className="text-sm text-gray-600">
            <strong>Cliente:</strong> {proposta.cliente.empresa} ({proposta.cliente.contacto})
          </p>
          <p className="text-sm text-gray-600">
            <strong>Data:</strong> {new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')}
          </p>
          {proposta.area && (
            <p className="text-sm text-gray-600">
              <strong>Área:</strong> {proposta.area}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSituacaoColor(proposta.situacao)}`}>
            {proposta.situacao === 'pendente' ? 'Pendente' : 
             proposta.situacao === 'sem-interesse' ? 'Sem Interesse' : 'Final'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(proposta)}
          >
            <Edit2 size={14} />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Eliminação</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja eliminar esta proposta? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleEliminarProposta(proposta.id)}>
                  Eliminar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {editingProposta === proposta.id ? (
        <div className="space-y-4 border-t pt-4">
          <div>
            <Label>Situação</Label>
            <Select value={editingSituacao} onValueChange={(value: any) => setEditingSituacao(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="sem-interesse">Sem Interesse</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {editingSituacao === 'pendente' && (
            <div>
              <Label>Detalhes do Porquê Está Pendente</Label>
              <Textarea
                value={editingDetalhes}
                onChange={(e) => setEditingDetalhes(e.target.value)}
                rows={2}
                placeholder="Motivo pelo qual está pendente"
              />
            </div>
          )}
          <div>
            <Label>Área</Label>
            <Select value={editingArea} onValueChange={setEditingArea}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.nome}>
                    {area.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => handleSaveEdit(proposta.id)}>
              Salvar
            </Button>
            <Button variant="outline" onClick={() => setEditingProposta(null)}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <SeguimentoManager
            seguimentos={proposta.seguimento}
            onAddSeguimento={(seguimento) => handleAddSeguimento(proposta.id, seguimento)}
          />
          {proposta.situacao === 'pendente' && proposta.detalhesPendente && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-4">
              <p className="text-sm text-yellow-800">
                <strong>Pendente:</strong> {proposta.detalhesPendente}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Adicionar Nova Proposta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="prop-data">Data de Criação</Label>
              <Input
                id="prop-data"
                type="date"
                value={dataCreacao}
                onChange={(e) => setDataCreacao(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prop-empresa">Nome da Empresa</Label>
                <Input
                  id="prop-empresa"
                  value={clienteData.empresa}
                  onChange={(e) => setClienteData({...clienteData, empresa: e.target.value})}
                  placeholder="Nome da empresa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prop-contacto">Nome do Contacto</Label>
                <Input
                  id="prop-contacto"
                  value={clienteData.contacto}
                  onChange={(e) => setClienteData({...clienteData, contacto: e.target.value})}
                  placeholder="Nome do contacto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prop-telemovel">Telemóvel</Label>
                <Input
                  id="prop-telemovel"
                  value={clienteData.telemovel}
                  onChange={(e) => setClienteData({...clienteData, telemovel: e.target.value})}
                  placeholder="Telemóvel"
                />
              </div>
              <div>
                <Label htmlFor="prop-email">Email</Label>
                <Input
                  id="prop-email"
                  type="email"
                  value={clienteData.email}
                  onChange={(e) => setClienteData({...clienteData, email: e.target.value})}
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prop-localidade">Localidade</Label>
                <Input
                  id="prop-localidade"
                  value={clienteData.localidade}
                  onChange={(e) => setClienteData({...clienteData, localidade: e.target.value})}
                  placeholder="Localidade"
                />
              </div>
              <div>
                <Label htmlFor="prop-morada">Morada</Label>
                <Input
                  id="prop-morada"
                  value={clienteData.morada}
                  onChange={(e) => setClienteData({...clienteData, morada: e.target.value})}
                  placeholder="Morada"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="prop-assunto">Assunto</Label>
              <Input
                id="prop-assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Assunto da proposta"
                required
              />
            </div>

            <div>
              <Label htmlFor="prop-seguimento">Seguimento Inicial (opcional)</Label>
              <Textarea
                id="prop-seguimento"
                value={seguimentoInicial}
                onChange={(e) => setSeguimentoInicial(e.target.value)}
                placeholder="Detalhes do seguimento inicial"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="prop-area">Área</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger id="prop-area">
                  <SelectValue placeholder="Selecione uma área" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.nome}>
                      {area.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Adicionar Proposta
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center space-x-2">
            <span>Gestão de Propostas</span>
            <div className="flex items-center space-x-4 text-sm font-normal">
              <span className="flex items-center space-x-1 text-yellow-600">
                <Clock size={16} />
                <span>{propostasPendentes.length} pendentes</span>
              </span>
              <span className="flex items-center space-x-1 text-green-600">
                <CheckCircle size={16} />
                <span>{propostasFinalizadas.length} finalizadas</span>
              </span>
              <span className="flex items-center space-x-1 text-red-600">
                <XCircle size={16} />
                <span>{propostasSemInteresse.length} sem interesse</span>
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pendentes" className="flex items-center space-x-2">
                <Clock size={16} />
                <span>Pendentes ({propostasPendentes.length})</span>
              </TabsTrigger>
              <TabsTrigger value="finalizadas" className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Finalizadas ({propostasFinalizadas.length})</span>
              </TabsTrigger>
              <TabsTrigger value="sem-interesse" className="flex items-center space-x-2">
                <XCircle size={16} />
                <span>Sem Interesse ({propostasSemInteresse.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pendentes" className="mt-4">
              {propostasPendentes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma proposta pendente</p>
              ) : (
                <div className="space-y-4">
                  {propostasPendentes.map(renderProposta)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="finalizadas" className="mt-4">
              {propostasFinalizadas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma proposta finalizada</p>
              ) : (
                <div className="space-y-4">
                  {propostasFinalizadas.map(renderProposta)}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="sem-interesse" className="mt-4">
              {propostasSemInteresse.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma proposta sem interesse</p>
              ) : (
                <div className="space-y-4">
                  {propostasSemInteresse.map(renderProposta)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
