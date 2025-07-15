export interface Cliente {
  id: string;
  empresa: string;
  contacto: string;
  telemovel: string;
  email: string;
  localidade: string;
  morada: string;
  criadoEm: string;
}

export interface Tarefa {
  id: string;
  cliente: string;
  assunto: string;
  proposta?: string;
  concluida: boolean;
  criadaEm: string;
}

export interface Proposta {
  id: string;
  dataCreacao: string;
  cliente: Cliente;
  assunto: string;
  seguimento: string[];
  numeracao: number;
  situacao: 'pendente' | 'sem-interesse' | 'final';
  detalhesPendente?: string;
  criadaEm: string;
}

export interface Seguimento {
  id: string;
  data: string;
  detalhes: string;
  tipo: 'proposta' | 'reuniao' | 'chamada' | 'email' | 'outro';
}