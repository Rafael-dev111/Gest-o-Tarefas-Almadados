
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Seguimento } from '../types';
import { Plus, Calendar, MessageSquare, Phone, Mail, User, MoreHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface SeguimentoManagerProps {
  seguimentos: Seguimento[];
  onAddSeguimento: (seguimento: Omit<Seguimento, 'id'>) => void;
}

export function SeguimentoManager({ seguimentos, onAddSeguimento }: SeguimentoManagerProps) {
  const [novoSeguimento, setNovoSeguimento] = useState({
    data: new Date().toISOString().split('T')[0],
    detalhes: '',
    tipo: 'outro' as const,
  });
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [seguimentosExpanded, setSeguimentosExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoSeguimento.detalhes.trim()) return;

    onAddSeguimento(novoSeguimento);
    setNovoSeguimento({
      data: new Date().toISOString().split('T')[0],
      detalhes: '',
      tipo: 'outro',
    });
    setMostrarFormulario(false);
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'proposta':
        return <MessageSquare size={16} className="text-blue-500" />;
      case 'reuniao':
        return <User size={16} className="text-green-500" />;
      case 'chamada':
        return <Phone size={16} className="text-purple-500" />;
      case 'email':
        return <Mail size={16} className="text-orange-500" />;
      default:
        return <MoreHorizontal size={16} className="text-gray-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'proposta':
        return 'Proposta';
      case 'reuniao':
        return 'Reunião';
      case 'chamada':
        return 'Chamada';
      case 'email':
        return 'Email';
      default:
        return 'Outro';
    }
  };

  // Ordenar seguimentos por data (mais antigo primeiro) e adicionar numeração
  const seguimentosOrdenados = seguimentos
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
    .map((seguimento, index) => ({
      ...seguimento,
      numero: index + 1
    }))
    .reverse(); // Inverter para mostrar o mais recente primeiro

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h4 className="font-medium text-gray-900">Seguimentos ({seguimentos.length})</h4>
          {seguimentos.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setSeguimentosExpanded(!seguimentosExpanded)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {seguimentosExpanded ? (
                <>
                  <ChevronUp size={16} className="mr-1" />
                  Ocultar seguimentos
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" />
                  Ver seguimentos
                </>
              )}
            </Button>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          <Plus size={16} className="mr-1" />
          Adicionar Seguimento
        </Button>
      </div>

      {mostrarFormulario && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Novo Seguimento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="seg-data" className="text-xs">Data</Label>
                  <Input
                    id="seg-data"
                    type="date"
                    value={novoSeguimento.data}
                    onChange={(e) => setNovoSeguimento({ ...novoSeguimento, data: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="seg-tipo" className="text-xs">Tipo</Label>
                  <Select value={novoSeguimento.tipo} onValueChange={(value: any) => setNovoSeguimento({ ...novoSeguimento, tipo: value })}>
                    <SelectTrigger id="seg-tipo" className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proposta">Proposta</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="chamada">Chamada</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="seg-detalhes" className="text-xs">Detalhes</Label>
                <Textarea
                  id="seg-detalhes"
                  value={novoSeguimento.detalhes}
                  onChange={(e) => setNovoSeguimento({ ...novoSeguimento, detalhes: e.target.value })}
                  placeholder="Descreva os detalhes do seguimento..."
                  rows={3}
                  required
                  className="text-sm"
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" size="sm">
                  Adicionar
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setMostrarFormulario(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {seguimentosExpanded && seguimentos.length > 0 && (
        <div className="space-y-3">
          {seguimentosOrdenados.map((seguimento) => (
            <div key={seguimento.id} className="border rounded-lg p-3 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    Seguimento {seguimento.numero}
                  </span>
                  {getTipoIcon(seguimento.tipo)}
                  <span className="font-medium text-sm">{getTipoLabel(seguimento.tipo)}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>{new Date(seguimento.data).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
              <p className="text-sm text-gray-700">{seguimento.detalhes}</p>
            </div>
          ))}
        </div>
      )}

      {seguimentos.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">Nenhum seguimento adicionado</p>
      )}
    </div>
  );
}
