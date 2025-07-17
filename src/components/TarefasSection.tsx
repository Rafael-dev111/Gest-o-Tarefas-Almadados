
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, CheckCircle, Clock } from 'lucide-react';
import { Tarefa } from '@/types';

export function TarefasSection() {
  const { tarefas, clientes, areas, adicionarTarefa, atualizarTarefa, eliminarTarefa } = useLocalStorage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Tarefa | null>(null);
  const [formData, setFormData] = useState({
    cliente: '',
    assunto: '',
    proposta: '',
    area: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cliente.trim() || !formData.assunto.trim()) {
      toast({
        title: "Erro",
        description: "Cliente e assunto são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTarefa) {
        atualizarTarefa(editingTarefa.id, {
          cliente: formData.cliente.trim(),
          assunto: formData.assunto.trim(),
          proposta: formData.proposta.trim(),
          area: formData.area || undefined
        });
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso",
        });
      } else {
        adicionarTarefa({
          cliente: formData.cliente.trim(),
          assunto: formData.assunto.trim(),
          proposta: formData.proposta.trim(),
          area: formData.area || undefined
        });
        toast({
          title: "Tarefa criada",
          description: "A nova tarefa foi criada com sucesso",
        });
      }

      setFormData({ cliente: '', assunto: '', proposta: '', area: '' });
      setEditingTarefa(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a tarefa",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tarefa: Tarefa) => {
    setEditingTarefa(tarefa);
    setFormData({
      cliente: tarefa.cliente,
      assunto: tarefa.assunto,
      proposta: tarefa.proposta || '',
      area: tarefa.area || ''
    });
    setIsOpen(true);
  };

  const handleDelete = (tarefaId: string) => {
    try {
      eliminarTarefa(tarefaId);
      toast({
        title: "Tarefa eliminada",
        description: "A tarefa foi eliminada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao eliminar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar a tarefa",
        variant: "destructive",
      });
    }
  };

  const handleToggleComplete = (tarefaId: string, concluida: boolean) => {
    try {
      atualizarTarefa(tarefaId, { concluida });
      toast({
        title: concluida ? "Tarefa concluída" : "Tarefa reaberta",
        description: concluida ? "A tarefa foi marcada como concluída" : "A tarefa foi reaberta",
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar a tarefa",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ cliente: '', assunto: '', proposta: '', area: '' });
    setEditingTarefa(null);
  };

  const tarefasPendentes = tarefas.filter(t => !t.concluida);
  const tarefasConcluidas = tarefas.filter(t => t.concluida);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Tarefas</h2>
          <p className="text-muted-foreground">
            Gerir tarefas pendentes e concluídas
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => console.log('Nova Tarefa clicked')}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={formData.cliente}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente: e.target.value }))}
                  placeholder="Nome do cliente"
                  required
                />
              </div>
              <div>
                <Label htmlFor="assunto">Assunto</Label>
                <Textarea
                  id="assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
                  placeholder="Descrição da tarefa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="proposta">Proposta (opcional)</Label>
                <Input
                  id="proposta"
                  value={formData.proposta}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposta: e.target.value }))}
                  placeholder="Número da proposta relacionada"
                />
              </div>
              <div>
                <Label htmlFor="area">Área (opcional)</Label>
                <Select value={formData.area} onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem área</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.nome}>
                        {area.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTarefa ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tarefas Pendentes ({tarefasPendentes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tarefasPendentes.map((tarefa, index) => (
                <div key={tarefa.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-orange-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{tarefa.cliente}</h4>
                        <p className="text-sm text-gray-600">{tarefa.assunto}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(tarefa.id, true)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tarefa)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tarefa.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}</span>
                    <div className="flex items-center space-x-2">
                      {tarefa.proposta && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Proposta: {tarefa.proposta}
                        </span>
                      )}
                      {tarefa.area && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {tarefa.area}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {tarefasPendentes.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma tarefa pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Tarefas Concluídas ({tarefasConcluidas.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tarefasConcluidas.map((tarefa, index) => (
                <div key={tarefa.id} className="border rounded-lg p-4 bg-green-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{tarefa.cliente}</h4>
                        <p className="text-sm text-gray-600">{tarefa.assunto}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleComplete(tarefa.id, false)}
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(tarefa)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tarefa.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>{new Date(tarefa.criadaEm).toLocaleDateString('pt-PT')}</span>
                    <div className="flex items-center space-x-2">
                      {tarefa.proposta && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          Proposta: {tarefa.proposta}
                        </span>
                      )}
                      {tarefa.area && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {tarefa.area}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {tarefasConcluidas.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma tarefa concluída
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
