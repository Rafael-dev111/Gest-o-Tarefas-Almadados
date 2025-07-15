import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Cliente } from '../types';

export function ClientesSection() {
  const [clienteData, setClienteData] = useState({
    empresa: '',
    contacto: '',
    telemovel: '',
    email: '',
    localidade: '',
    morada: '',
  });
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  
  const { clientes, tarefas, propostas, adicionarCliente } = useLocalStorage();

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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleClienteExpansion(cliente.id)}
                          className="mt-2"
                        >
                          {expandedClient === cliente.id ? 'Ocultar' : 'Ver'} Histórico
                        </Button>
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