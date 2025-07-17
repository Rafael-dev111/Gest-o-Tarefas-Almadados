
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
import { Plus, Trash2, Edit, FileText, Calendar, User, Building } from 'lucide-react';
import { Proposta, Cliente, Seguimento } from '@/types';
import { SeguimentoManager } from './SeguimentoManager';

export function PropostasSection() {
  const { propostas, clientes, areas, adicionarProposta, atualizarProposta, eliminarProposta } = useLocalStorage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Proposta | null>(null);
  const [formData, setFormData] = useState({
    clienteId: '',
    assunto: '',
    situacao: 'pendente' as 'pendente' | 'sem-interesse' | 'final',
    detalhesPendente: '',
    area: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clienteId || !formData.assunto.trim()) {
      toast({
        title: "Erro",
        description: "Cliente e assunto são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const cliente = clientes.find(c => c.id === formData.clienteId);
    if (!cliente) {
      toast({
        title: "Erro",
        description: "Cliente não encontrado",
        variant: "destructive",
      });
      return;
    }

    if (editingProposta) {
      atualizarProposta(editingProposta.id, {
        cliente,
        assunto: formData.assunto.trim(),
        situacao: formData.situacao,
        detalhesPendente: formData.detalhesPendente.trim() || undefined,
        area: formData.area || undefined
      });
      toast({
        title: "Proposta atualizada",
        description: "A proposta foi atualizada com sucesso",
      });
    } else {
      adicionarProposta({
        dataCreacao: new Date().toISOString(),
        cliente,
        assunto: formData.assunto.trim(),
        seguimento: [],
        situacao: formData.situacao,
        detalhesPendente: formData.detalhesPendente.trim() || undefined,
        area: formData.area || undefined
      });
      toast({
        title: "Proposta criada",
        description: "A nova proposta foi criada com sucesso",
      });
    }

    setFormData({ clienteId: '', assunto: '', situacao: 'pendente', detalhesPendente: '', area: '' });
    setEditingProposta(null);
    setIsOpen(false);
  };

  const handleEdit = (proposta: Proposta) => {
    setEditingProposta(proposta);
    setFormData({
      clienteId: proposta.cliente.id,
      assunto: proposta.assunto,
      situacao: proposta.situacao,
      detalhesPendente: proposta.detalhesPendente || '',
      area: proposta.area || ''
    });
    setIsOpen(true);
  };

  const handleDelete = (propostaId: string) => {
    eliminarProposta(propostaId);
    toast({
      title: "Proposta eliminada",
      description: "A proposta foi eliminada com sucesso",
    });
  };

  const handleAddSeguimento = (propostaId: string, seguimento: Omit<Seguimento, 'id'>) => {
    const proposta = propostas.find(p => p.id === propostaId);
    if (proposta) {
      const novoSeguimento: Seguimento = {
        id: Date.now().toString(),
        ...seguimento
      };
      
      atualizarProposta(propostaId, {
        seguimento: [...proposta.seguimento, novoSeguimento]
      });
      
      toast({
        title: "Seguimento adicionado",
        description: "O seguimento foi adicionado à proposta",
      });
    }
  };

  const resetForm = () => {
    setFormData({ clienteId: '', assunto: '', situacao: 'pendente', detalhesPendente: '', area: '' });
    setEditingProposta(null);
  };

  const getSituacaoColor = (situacao: string) => {
    switch (situacao) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'final':
        return 'bg-green-100 text-green-800';
      case 'sem-interesse':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSituacaoLabel = (situacao: string) => {
    switch (situacao) {
      case 'pendente':
        return 'Pendente';
      case 'final':
        return 'Final';
      case 'sem-interesse':
        return 'Sem Interesse';
      default:
        return situacao;
    }
  };

  // Ordenar propostas por data de criação (mais antigas primeiro)
  const propostasOrdenadas = [...propostas].sort((a, b) => new Date(a.dataCreacao).getTime() - new Date(b.dataCreacao).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Propostas</h2>
          <p className="text-muted-foreground">
            Gerir propostas comerciais com seguimento
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Proposta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProposta ? 'Editar Proposta' : 'Nova Proposta'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select value={formData.clienteId} onValueChange={(value) => setFormData(prev => ({ ...prev, clienteId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.empresa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="situacao">Situação</Label>
                  <Select value={formData.situacao} onValueChange={(value: 'pendente' | 'sem-interesse' | 'final') => setFormData(prev => ({ ...prev, situacao: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="sem-interesse">Sem Interesse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="assunto">Assunto</Label>
                <Textarea
                  id="assunto"
                  value={formData.assunto}
                  onChange={(e) => setFormData(prev => ({ ...prev, assunto: e.target.value }))}
                  placeholder="Descrição da proposta"
                  required
                />
              </div>
              <div>
                <Label htmlFor="area">Área (opcional)</Label>
                <Select value={formData.area} onValueChange={(value) => setFormData(prev => ({ ...prev, area: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma área" />
                  </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="sem-area">Sem área</SelectItem>
                    {areas.map((area) => (
                      <SelectItem key={area.id} value={area.nome}>
                        {area.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.situacao === 'pendente' && (
                <div>
                  <Label htmlFor="detalhesPendente">Detalhes Pendente (opcional)</Label>
                  <Textarea
                    id="detalhesPendente"
                    value={formData.detalhesPendente}
                    onChange={(e) => setFormData(prev => ({ ...prev, detalhesPendente: e.target.value }))}
                    placeholder="Detalhes sobre o que está pendente"
                    rows={3}
                  />
                </div>
              )}
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProposta ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {propostasOrdenadas.map((proposta, index) => (
          <Card key={proposta.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Proposta #{proposta.numeracao}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Building className="h-4 w-4" />
                        {proposta.cliente.empresa}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(proposta.dataCreacao).toLocaleDateString('pt-PT')}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSituacaoColor(proposta.situacao)}`}>
                    {getSituacaoLabel(proposta.situacao)}
                  </span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(proposta)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(proposta.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Assunto</h4>
                  <p className="text-sm text-gray-600">{proposta.assunto}</p>
                </div>
                
                {proposta.area && (
                  <div>
                    <h4 className="font-medium mb-2">Área</h4>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {proposta.area}
                    </span>
                  </div>
                )}

                {proposta.detalhesPendente && (
                  <div>
                    <h4 className="font-medium mb-2">Detalhes Pendente</h4>
                    <p className="text-sm text-gray-600">{proposta.detalhesPendente}</p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <SeguimentoManager
                    seguimentos={proposta.seguimento}
                    onAddSeguimento={(seguimento) => handleAddSeguimento(proposta.id, seguimento)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {propostas.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Ainda não há propostas criadas. Crie a sua primeira proposta para começar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
