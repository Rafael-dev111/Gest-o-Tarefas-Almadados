
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Building, User, Phone, Mail, MapPin } from 'lucide-react';
import { Cliente } from '@/types';

export function ClientesSection() {
  const { clientes, areas, adicionarCliente, atualizarCliente, eliminarCliente } = useLocalStorage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    empresa: '',
    contacto: '',
    telemovel: '',
    email: '',
    localidade: '',
    morada: '',
    area: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.empresa.trim()) {
      toast({
        title: "Erro",
        description: "O nome da empresa é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingCliente) {
        atualizarCliente(editingCliente.id, {
          empresa: formData.empresa.trim(),
          contacto: formData.contacto.trim(),
          telemovel: formData.telemovel.trim(),
          email: formData.email.trim(),
          localidade: formData.localidade.trim(),
          morada: formData.morada.trim(),
          area: formData.area || undefined
        });
        toast({
          title: "Cliente atualizado",
          description: "O cliente foi atualizado com sucesso",
        });
      } else {
        adicionarCliente({
          empresa: formData.empresa.trim(),
          contacto: formData.contacto.trim(),
          telemovel: formData.telemovel.trim(),
          email: formData.email.trim(),
          localidade: formData.localidade.trim(),
          morada: formData.morada.trim(),
          area: formData.area || undefined
        });
        toast({
          title: "Cliente criado",
          description: "O novo cliente foi criado com sucesso",
        });
      }

      setFormData({ empresa: '', contacto: '', telemovel: '', email: '', localidade: '', morada: '', area: '' });
      setEditingCliente(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar o cliente",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setFormData({
      empresa: cliente.empresa,
      contacto: cliente.contacto || '',
      telemovel: cliente.telemovel || '',
      email: cliente.email || '',
      localidade: cliente.localidade || '',
      morada: cliente.morada || '',
      area: cliente.area || ''
    });
    setIsOpen(true);
  };

  const handleDelete = (clienteId: string) => {
    try {
      eliminarCliente(clienteId);
      toast({
        title: "Cliente eliminado",
        description: "O cliente foi eliminado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao eliminar cliente:', error);
      toast({
        title: "Erro",
        description: "Erro ao eliminar o cliente",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ empresa: '', contacto: '', telemovel: '', email: '', localidade: '', morada: '', area: '' });
    setEditingCliente(null);
  };

  // Ordenar clientes por data de criação (mais antigos primeiro)
  const clientesOrdenados = [...clientes].sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Clientes</h2>
          <p className="text-muted-foreground">
            Gerir informações dos clientes
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => setFormData(prev => ({ ...prev, empresa: e.target.value }))}
                    placeholder="Nome da empresa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contacto">Contacto</Label>
                  <Input
                    id="contacto"
                    value={formData.contacto}
                    onChange={(e) => setFormData(prev => ({ ...prev, contacto: e.target.value }))}
                    placeholder="Nome do contacto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telemovel">Telemóvel</Label>
                  <Input
                    id="telemovel"
                    value={formData.telemovel}
                    onChange={(e) => setFormData(prev => ({ ...prev, telemovel: e.target.value }))}
                    placeholder="Número de telemóvel"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email de contacto"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="localidade">Localidade</Label>
                  <Input
                    id="localidade"
                    value={formData.localidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, localidade: e.target.value }))}
                    placeholder="Localidade"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Área</Label>
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
              </div>
              <div>
                <Label htmlFor="morada">Morada</Label>
                <Input
                  id="morada"
                  value={formData.morada}
                  onChange={(e) => setFormData(prev => ({ ...prev, morada: e.target.value }))}
                  placeholder="Morada completa"
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
                  {editingCliente ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clientesOrdenados.map((cliente, index) => (
          <Card key={cliente.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      {cliente.empresa}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Criado em {new Date(cliente.criadoEm).toLocaleDateString('pt-PT')}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(cliente)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(cliente.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {cliente.contacto && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{cliente.contacto}</span>
                  </div>
                )}
                {cliente.telemovel && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{cliente.telemovel}</span>
                  </div>
                )}
                {cliente.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{cliente.email}</span>
                  </div>
                )}
                {cliente.localidade && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{cliente.localidade}</span>
                  </div>
                )}
                {cliente.morada && (
                  <div className="text-sm text-gray-600">
                    <strong>Morada:</strong> {cliente.morada}
                  </div>
                )}
                {cliente.area && (
                  <div className="mt-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {cliente.area}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {clientes.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground">
                Ainda não há clientes criados. Crie o seu primeiro cliente para começar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
