
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Area } from '@/types';

export function AreasSection() {
  const { areas, adicionarArea, atualizarArea, eliminarArea } = useLocalStorage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast({
        title: "Erro",
        description: "O nome da área é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (editingArea) {
      atualizarArea(editingArea.id, {
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim()
      });
      toast({
        title: "Área atualizada",
        description: "A área foi atualizada com sucesso",
      });
    } else {
      adicionarArea({
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim()
      });
      toast({
        title: "Área criada",
        description: "A nova área foi criada com sucesso",
      });
    }

    setFormData({ nome: '', descricao: '' });
    setEditingArea(null);
    setIsOpen(false);
  };

  const handleEdit = (area: Area) => {
    setEditingArea(area);
    setFormData({
      nome: area.nome,
      descricao: area.descricao || ''
    });
    setIsOpen(true);
  };

  const handleDelete = (areaId: string) => {
    eliminarArea(areaId);
    toast({
      title: "Área eliminada",
      description: "A área foi eliminada com sucesso",
    });
  };

  const resetForm = () => {
    setFormData({ nome: '', descricao: '' });
    setEditingArea(null);
  };

  // Ordenar áreas por data de criação (mais antigas primeiro)
  const areasOrdenadas = [...areas].sort((a, b) => new Date(a.criadaEm).getTime() - new Date(b.criadaEm).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Áreas</h2>
          <p className="text-muted-foreground">
            Gerir as áreas que serão utilizadas em tarefas, propostas e clientes
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Área
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingArea ? 'Editar Área' : 'Nova Área'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Área</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Desenvolvimento Web, Marketing Digital..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição (opcional)</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição da área..."
                  rows={3}
                />
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
                  {editingArea ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {areasOrdenadas.map((area, index) => (
          <Card key={area.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{area.nome}</CardTitle>
                    <CardDescription className="text-sm">
                      Criada em {new Date(area.criadaEm).toLocaleDateString('pt-PT')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(area)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(area.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {area.descricao && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{area.descricao}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {areas.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Ainda não há áreas criadas. Crie a sua primeira área para começar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
