import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Tarefa } from '../types';
import { Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';

export function TarefasSection() {
  const [cliente, setCliente] = useState('');
  const [assunto, setAssunto] = useState('');
  const [proposta, setProposta] = useState('');
  const [propostaVinculada, setPropostaVinculada] = useState('');
  const [area, setArea] = useState('');
  
  // Estados para edição
  const [editandoTarefa, setEditandoTarefa] = useState<Tarefa | null>(null);
  const [editCliente, setEditCliente] = useState('');
  const [editAssunto, setEditAssunto] = useState('');
  const [editProposta, setEditProposta] = useState('');
  const [editPropostaVinculada, setEditPropostaVinculada] = useState('');
  const [editArea, setEditArea] = useState('');
  
  const { tarefas, propostas, areas, adicionarTarefa, atualizarTarefa, eliminarTarefa, buscarOuCriarCliente } = useLocalStorage();

  // Filtrar tarefas por status
  const tarefasPendentes = tarefas.filter(tarefa => !tarefa.concluida);
  const tarefasConcluidas = tarefas.filter(tarefa => tarefa.concluida);

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
      area: area || undefined,
    });

    setCliente('');
    setAssunto('');
    setProposta('');
    setPropostaVinculada('');
    setArea('');
  };

  const toggleTarefa = (id: string, concluida: boolean) => {
    atualizarTarefa(id, { concluida });
  };

  const iniciarEdicao = (tarefa: Tarefa) => {
    setEditandoTarefa(tarefa);
    setEditCliente(tarefa.cliente);
    setEditAssunto(tarefa.assunto);
    setEditProposta(tarefa.proposta || '');
    setEditPropostaVinculada('');
    setEditArea(tarefa.area || '');
  };

  const salvarEdicao = () => {
    if (!editandoTarefa || !editCliente || !editAssunto) return;

    buscarOuCriarCliente(editCliente);
    
    let propostaTexto = editProposta;
    if (editPropostaVinculada) {
      const propostaSelecionada = propostas.find(p => p.id === editPropostaVinculada);
      if (propostaSelecionada) {
        propostaTexto = `Proposta #${propostaSelecionada.numeracao} - ${propostaSelecionada.assunto}`;
      }
    }
    
    atualizarTarefa(editandoTarefa.id, {
      cliente: editCliente,
      assunto: editAssunto,
      proposta: propostaTexto || undefined,
      area: editArea || undefined,
    });

    setEditandoTarefa(null);
    setEditCliente('');
    setEditAssunto('');
    setEditProposta('');
    setEditPropostaVinculada('');
    setEditArea('');
  };

  const cancelarEdicao = () => {
    setEditandoTarefa(null);
    setEditCliente('');
    setEditAssunto('');
    setEditProposta('');
    setEditPropostaVinculada('');
    setEditArea('');
  };

  const handleEliminarTarefa = (id: string) => {
    eliminarTarefa(id);
  };

  // Filtrar propostas do cliente sendo editado
  const propostasDoClienteEdit = propostas.filter(p => 
    p.cliente.empresa.toLowerCase().includes(editCliente.toLowerCase())
  );

  const renderTarefaCard = (tarefa: Tarefa, index: number) => (
    <div
      key={tarefa.id}
      className={`p-4 border rounded-lg ${
        tarefa.concluida ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">#{index + 1}</span>
          </div>
          <Checkbox
            checked={tarefa.concluida}
            onCheckedChange={(checked) => toggleTarefa(tarefa.id, checked as boolean)}
          />
        </div>
         <div className="flex-1">
           <div className="flex justify-between items-start mb-2">
             <h3 className={`font-medium ${tarefa.concluida ? 'line-through text-gray-500' : 'text-gray-900'}`}>
               {tarefa.assunto}
             </h3>
             <div className="flex items-center space-x-2">
               <span className="text-sm text-gray-500">
                 {new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}
               </span>
               <div className="flex space-x-1">
                 <Dialog>
                   <DialogTrigger asChild>
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => iniciarEdicao(tarefa)}
                     >
                       <Edit2 size={14} />
                     </Button>
                   </DialogTrigger>
                   <DialogContent className="sm:max-w-[425px]">
                     <DialogHeader>
                       <DialogTitle>Editar Tarefa</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-4">
                       <div>
                         <Label htmlFor="edit-cliente">Cliente</Label>
                         <Input
                           id="edit-cliente"
                           value={editCliente}
                           onChange={(e) => setEditCliente(e.target.value)}
                           placeholder="Nome do cliente"
                           required
                         />
                       </div>
                       <div>
                         <Label htmlFor="edit-assunto">Assunto</Label>
                         <Input
                           id="edit-assunto"
                           value={editAssunto}
                           onChange={(e) => setEditAssunto(e.target.value)}
                           placeholder="Assunto da tarefa"
                           required
                         />
                       </div>
                       <div>
                         <Label htmlFor="edit-proposta">Proposta (opcional)</Label>
                         <Input
                           id="edit-proposta"
                           value={editProposta}
                           onChange={(e) => setEditProposta(e.target.value)}
                           placeholder="Detalhes da proposta"
                         />
                       </div>
                       
                        {editCliente && propostasDoClienteEdit.length > 0 && (
                          <div>
                            <Label htmlFor="edit-proposta-vinculada">Ou vincular a uma proposta existente</Label>
                            <Select value={editPropostaVinculada} onValueChange={setEditPropostaVinculada}>
                              <SelectTrigger id="edit-proposta-vinculada">
                                <SelectValue placeholder="Selecione uma proposta existente" />
                              </SelectTrigger>
                              <SelectContent>
                                {propostasDoClienteEdit.map((prop) => (
                                  <SelectItem key={prop.id} value={prop.id}>
                                    Proposta #{prop.numeracao} - {prop.assunto}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="edit-area">Área</Label>
                          <Select value={editArea} onValueChange={setEditArea}>
                            <SelectTrigger id="edit-area">
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
                         Tem certeza que deseja eliminar esta tarefa? Esta ação não pode ser desfeita.
                       </AlertDialogDescription>
                     </AlertDialogHeader>
                     <AlertDialogFooter>
                       <AlertDialogCancel>Cancelar</AlertDialogCancel>
                       <AlertDialogAction onClick={() => handleEliminarTarefa(tarefa.id)}>
                         Eliminar
                       </AlertDialogAction>
                     </AlertDialogFooter>
                   </AlertDialogContent>
                 </AlertDialog>
               </div>
             </div>
           </div>
           <p className="text-sm text-gray-600 mb-1">
             <strong>Cliente:</strong> {tarefa.cliente}
           </p>
            {tarefa.proposta && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Proposta:</strong> {tarefa.proposta}
              </p>
            )}
            {tarefa.area && (
              <p className="text-sm text-gray-600">
                <strong>Área:</strong> {tarefa.area}
              </p>
            )}
         </div>
      </div>
    </div>
  );

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

            <div>
              <Label htmlFor="area">Área</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger id="area">
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
              Adicionar Tarefa
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center space-x-2">
            <span>Gestão de Tarefas</span>
            <div className="flex items-center space-x-4 text-sm font-normal">
              <span className="flex items-center space-x-1 text-orange-600">
                <Clock size={16} />
                <span>{tarefasPendentes.length} pendentes</span>
              </span>
              <span className="flex items-center space-x-1 text-green-600">
                <CheckCircle size={16} />
                <span>{tarefasConcluidas.length} concluídas</span>
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pendentes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pendentes" className="flex items-center space-x-2">
                <Clock size={16} />
                <span>Pendentes ({tarefasPendentes.length})</span>
              </TabsTrigger>
              <TabsTrigger value="concluidas" className="flex items-center space-x-2">
                <CheckCircle size={16} />
                <span>Concluídas ({tarefasConcluidas.length})</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pendentes" className="mt-4">
              {tarefasPendentes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma tarefa pendente</p>
              ) : (
                <div className="space-y-4">
                  {tarefasPendentes.map((tarefa, index) => renderTarefaCard(tarefa, index))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="concluidas" className="mt-4">
              {tarefasConcluidas.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma tarefa concluída</p>
              ) : (
                <div className="space-y-4">
                  {tarefasConcluidas.map((tarefa, index) => renderTarefaCard(tarefa, index))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
