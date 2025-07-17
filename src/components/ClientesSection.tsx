import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Cliente } from '../types';
import { Edit2, Trash2 } from 'lucide-react';

export function ClientesSection() {
  const [clienteData, setClienteData] = useState({
    empresa: '',
    contacto: '',
    telemovel: '',
    email: '',
    localidade: '',
    morada: '',
    area: '',
  });
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  
  // Estados para edição
  const [editandoCliente, setEditandoCliente] = useState<Cliente | null>(null);
  const [editClienteData, setEditClienteData] = useState({
    empresa: '',
    contacto: '',
    telemovel: '',
    email: '',
    localidade: '',
    morada: '',
    area: '',
  });
  
  const { clientes, tarefas, propostas, areas, adicionarCliente, atualizarCliente, eliminarCliente } = useLocalStorage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteData.empresa) return;

    adicionarCliente(clienteData);
    
    // Reset form
    setClienteData({
      empresa: '',
      contacto: '',
      telemovel: '',
      email: '',
      localidade: '',
      morada: '',
      area: '',
    });
  };

  const getClienteHistorico = (cliente: Cliente) => {
    const tarefasCliente = tarefas.filter(t => t.cliente === cliente.empresa);
    const propostasCliente = propostas.filter(p => p.cliente.empresa === cliente.empresa);
    
    return {
      tarefas: tarefasCliente,
      propostas: propostasCliente,
      totalTarefas: tarefasCliente.length,
      tarefasPendentes: tarefasCliente.filter(t => !t.concluida).length,
      totalPropostas: propostasCliente.length,
      propostasFinalizadas: propostasCliente.filter(p => p.situacao === 'final').length,
      propostasPendentes: propostasCliente.filter(p => p.situacao === 'pendente').length,
    };
  };

  const toggleClienteExpansion = (clienteId: string) => {
    setExpandedClient(expandedClient === clienteId ? null : clienteId);
  };

  const iniciarEdicao = (cliente: Cliente) => {
    setEditandoCliente(cliente);
    setEditClienteData({
      empresa: cliente.empresa,
      contacto: cliente.contacto,
      telemovel: cliente.telemovel,
      email: cliente.email,
      localidade: cliente.localidade,
      morada: cliente.morada,
      area: cliente.area || '',
    });
  };

  const salvarEdicao = () => {
    if (!editandoCliente || !editClienteData.empresa) return;

    atualizarCliente(editandoCliente.id, editClienteData);

    setEditandoCliente(null);
    setEditClienteData({
      empresa: '',
      contacto: '',
      telemovel: '',
      email: '',
      localidade: '',
      morada: '',
      area: '',
    });
  };

  const cancelarEdicao = () => {
    setEditandoCliente(null);
    setEditClienteData({
      empresa: '',
      contacto: '',
      telemovel: '',
      email: '',
      localidade: '',
      morada: '',
      area: '',
    });
  };

  const handleEliminarCliente = (id: string) => {
    eliminarCliente(id);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Adicionar Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cli-empresa">Nome da Empresa</Label>
                <Input
                  id="cli-empresa"
                  value={clienteData.empresa}
                  onChange={(e) => setClienteData({...clienteData, empresa: e.target.value})}
                  placeholder="Nome da empresa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cli-contacto">Nome do Contacto</Label>
                <Input
                  id="cli-contacto"
                  value={clienteData.contacto}
                  onChange={(e) => setClienteData({...clienteData, contacto: e.target.value})}
                  placeholder="Nome do contacto"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cli-telemovel">Telemóvel</Label>
                <Input
                  id="cli-telemovel"
                  value={clienteData.telemovel}
                  onChange={(e) => setClienteData({...clienteData, telemovel: e.target.value})}
                  placeholder="Telemóvel"
                />
              </div>
              <div>
                <Label htmlFor="cli-email">Email</Label>
                <Input
                  id="cli-email"
                  type="email"
                  value={clienteData.email}
                  onChange={(e) => setClienteData({...clienteData, email: e.target.value})}
                  placeholder="Email"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cli-localidade">Localidade</Label>
                <Input
                  id="cli-localidade"
                  value={clienteData.localidade}
                  onChange={(e) => setClienteData({...clienteData, localidade: e.target.value})}
                  placeholder="Localidade"
                />
              </div>
              <div>
                <Label htmlFor="cli-morada">Morada</Label>
                <Input
                  id="cli-morada"
                  value={clienteData.morada}
                  onChange={(e) => setClienteData({...clienteData, morada: e.target.value})}
                  placeholder="Morada"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="cli-area">Área</Label>
              <Select value={clienteData.area} onValueChange={(value) => setClienteData({...clienteData, area: value})}>
                <SelectTrigger id="cli-area">
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
              Adicionar Cliente
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {clientes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum cliente encontrado</p>
          ) : (
            <div className="space-y-4">
              {clientes.map((cliente) => {
                const historico = getClienteHistorico(cliente);
                return (
                  <div key={cliente.id} className="p-4 border rounded-lg bg-white border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {cliente.empresa}
                        </h3>
                        <p className="text-sm text-gray-600">
                          <strong>Contacto:</strong> {cliente.contacto || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Telemóvel:</strong> {cliente.telemovel || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Email:</strong> {cliente.email || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Localidade:</strong> {cliente.localidade || 'Não informado'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Morada:</strong> {cliente.morada || 'Não informado'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{historico.totalTarefas}</div>
                            <div className="text-gray-600">Tarefas</div>
                            <div className="text-xs text-gray-500">
                              {historico.tarefasPendentes} pendentes
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-primary">{historico.totalPropostas}</div>
                            <div className="text-gray-600">Propostas</div>
                            <div className="text-xs text-gray-500">
                              {historico.propostasPendentes} pendentes
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleClienteExpansion(cliente.id)}
                          >
                            {expandedClient === cliente.id ? 'Ocultar' : 'Ver'} Histórico
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => iniciarEdicao(cliente)}
                              >
                                <Edit2 size={14} />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Editar Cliente</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-empresa">Nome da Empresa</Label>
                                    <Input
                                      id="edit-empresa"
                                      value={editClienteData.empresa}
                                      onChange={(e) => setEditClienteData({...editClienteData, empresa: e.target.value})}
                                      placeholder="Nome da empresa"
                                      required
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-contacto">Nome do Contacto</Label>
                                    <Input
                                      id="edit-contacto"
                                      value={editClienteData.contacto}
                                      onChange={(e) => setEditClienteData({...editClienteData, contacto: e.target.value})}
                                      placeholder="Nome do contacto"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-telemovel">Telemóvel</Label>
                                    <Input
                                      id="edit-telemovel"
                                      value={editClienteData.telemovel}
                                      onChange={(e) => setEditClienteData({...editClienteData, telemovel: e.target.value})}
                                      placeholder="Telemóvel"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                      id="edit-email"
                                      type="email"
                                      value={editClienteData.email}
                                      onChange={(e) => setEditClienteData({...editClienteData, email: e.target.value})}
                                      placeholder="Email"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label htmlFor="edit-localidade">Localidade</Label>
                                    <Input
                                      id="edit-localidade"
                                      value={editClienteData.localidade}
                                      onChange={(e) => setEditClienteData({...editClienteData, localidade: e.target.value})}
                                      placeholder="Localidade"
                                    />
                                  </div>
                                  <div>
                                    <Label htmlFor="edit-morada">Morada</Label>
                                    <Input
                                      id="edit-morada"
                                      value={editClienteData.morada}
                                      onChange={(e) => setEditClienteData({...editClienteData, morada: e.target.value})}
                                      placeholder="Morada"
                                    />
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Button onClick={salvarEdicao} className="flex-1">
                                    Salvar
                                  </Button>
                                  <Button onClick={cancelarEdicao} variant="outline" className="flex-1">
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
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
                                  Tem certeza que deseja eliminar este cliente? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleEliminarCliente(cliente.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>

                    {expandedClient === cliente.id && (
                      <div className="border-t pt-4">
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Tarefas</h4>
                            {historico.tarefas.length === 0 ? (
                              <p className="text-sm text-gray-500">Nenhuma tarefa encontrada</p>
                            ) : (
                              <div className="space-y-2">
                                {historico.tarefas.map((tarefa) => (
                                  <div key={tarefa.id} className="text-sm">
                                    <div className={`${tarefa.concluida ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                      {tarefa.assunto}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')} • 
                                      {tarefa.concluida ? ' Concluída' : ' Pendente'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Propostas</h4>
                            {historico.propostas.length === 0 ? (
                              <p className="text-sm text-gray-500">Nenhuma proposta encontrada</p>
                            ) : (
                              <div className="space-y-2">
                                {historico.propostas.map((proposta) => (
                                  <div key={proposta.id} className="text-sm">
                                    <div className="text-gray-900">
                                      Proposta #{proposta.numeracao} - {proposta.assunto}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')} • 
                                      {proposta.situacao === 'pendente' ? ' Pendente' : 
                                       proposta.situacao === 'sem-interesse' ? ' Sem Interesse' : ' Final'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}