import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Tarefa } from '../types';

export function TarefasSection() {
  const [cliente, setCliente] = useState('');
  const [assunto, setAssunto] = useState('');
  const [proposta, setProposta] = useState('');
  const [propostaVinculada, setPropostaVinculada] = useState('');
  
  const { tarefas, propostas, adicionarTarefa, atualizarTarefa, buscarOuCriarCliente } = useLocalStorage();

  // Filtrar propostas do cliente selecionado
  const propostasDoCliente = propostas.filter(p => 
    p.cliente.empresa.toLowerCase().includes(cliente.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente || !assunto) return;

    buscarOuCriarCliente(cliente);
    
    let propostaTexto = proposta;
    if (propostaVinculada) {
      const propostaSelecionada = propostas.find(p => p.id === propostaVinculada);
      if (propostaSelecionada) {
        propostaTexto = `Proposta #${propostaSelecionada.numeracao} - ${propostaSelecionada.assunto}`;
      }
    }
    
    adicionarTarefa({
      cliente,
      assunto,
      proposta: propostaTexto || undefined,
    });

    setCliente('');
    setAssunto('');
    setProposta('');
    setPropostaVinculada('');
  };

  const toggleTarefa = (id: string, concluida: boolean) => {
    atualizarTarefa(id, { concluida });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Adicionar Nova Tarefa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="tarefa-cliente">Cliente</Label>
              <Input
                id="tarefa-cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente"
                required
              />
            </div>
            <div>
              <Label htmlFor="tarefa-assunto">Assunto</Label>
              <Input
                id="tarefa-assunto"
                value={assunto}
                onChange={(e) => setAssunto(e.target.value)}
                placeholder="Assunto da tarefa"
                required
              />
            </div>
            <div>
              <Label htmlFor="tarefa-proposta">Proposta (opcional)</Label>
              <Input
                id="tarefa-proposta"
                value={proposta}
                onChange={(e) => setProposta(e.target.value)}
                placeholder="Detalhes da proposta"
              />
            </div>
            
            {cliente && propostasDoCliente.length > 0 && (
              <div>
                <Label htmlFor="proposta-vinculada">Ou vincular a uma proposta existente</Label>
                <Select value={propostaVinculada} onValueChange={setPropostaVinculada}>
                  <SelectTrigger id="proposta-vinculada">
                    <SelectValue placeholder="Selecione uma proposta existente" />
                  </SelectTrigger>
                  <SelectContent>
                    {propostasDoCliente.map((prop) => (
                      <SelectItem key={prop.id} value={prop.id}>
                        Proposta #{prop.numeracao} - {prop.assunto}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <Button type="submit" className="w-full">
              Adicionar Tarefa
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary">Lista de Tarefas</CardTitle>
        </CardHeader>
        <CardContent>
          {tarefas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada</p>
          ) : (
            <div className="space-y-4">
              {tarefas.map((tarefa) => (
                <div
                  key={tarefa.id}
                  className={`p-4 border rounded-lg ${
                    tarefa.concluida ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={tarefa.concluida}
                      onCheckedChange={(checked) => toggleTarefa(tarefa.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-medium ${tarefa.concluida ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {tarefa.assunto}
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Cliente:</strong> {tarefa.cliente}
                      </p>
                      {tarefa.proposta && (
                        <p className="text-sm text-gray-600">
                          <strong>Proposta:</strong> {tarefa.proposta}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}