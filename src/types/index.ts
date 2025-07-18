
export interface Area {
  id: string;
  nome: string;
  descricao?: string;
  criadaEm: string;
}

export interface Cliente {
  id: string;
  empresa: string;
  contacto: string;
  telemovel: string;
  email: string;
  localidade: string;
  morada: string;
  area?: string;
  criadoEm: string;
}

export interface Tarefa {
  id: string;
  cliente: string;
  assunto: string;
  proposta?: string;
  area?: string;
  concluida: boolean;
  criadaEm: string;
}

export interface Seguimento {
  id: string;
  data: string;
  detalhes: string;
  tipo: 'proposta' | 'reuniao' | 'chamada' | 'email' | 'outro';
  proximoContacto?: string;
}

export interface Proposta {
  id: string;
  dataCreacao: string;
  cliente: Cliente;
  assunto: string;
  seguimento: Seguimento[];
  numeracao: number;
  situacao: 'ativa' | 'concluida-sucesso' | 'concluida-sem-sucesso';
  detalhesPendente?: string;
  area?: string;
  criadaEm: string;
}
