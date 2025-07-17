import { useState, useEffect } from 'react';
import { Cliente, Tarefa, Proposta, Area } from '../types';

export function useLocalStorage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);

  // Carregar dados do localStorage
  useEffect(() => {
    const clientesArmazenados = localStorage.getItem('almadados-clientes');
    const tarefasArmazenadas = localStorage.getItem('almadados-tarefas');
    const propostasArmazenadas = localStorage.getItem('almadados-propostas');
    const areasArmazenadas = localStorage.getItem('almadados-areas');

    if (clientesArmazenados) {
      setClientes(JSON.parse(clientesArmazenados));
    }
    if (tarefasArmazenadas) {
      setTarefas(JSON.parse(tarefasArmazenadas));
    }
    if (propostasArmazenadas) {
      setPropostas(JSON.parse(propostasArmazenadas));
    }
    if (areasArmazenadas) {
      setAreas(JSON.parse(areasArmazenadas));
    }
  }, []);

  // Salvar dados no localStorage
  const salvarClientes = (novosClientes: Cliente[]) => {
    setClientes(novosClientes);
    localStorage.setItem('almadados-clientes', JSON.stringify(novosClientes));
  };

  const salvarTarefas = (novasTarefas: Tarefa[]) => {
    setTarefas(novasTarefas);
    localStorage.setItem('almadados-tarefas', JSON.stringify(novasTarefas));
  };

  const salvarPropostas = (novasPropostas: Proposta[]) => {
    setPropostas(novasPropostas);
    localStorage.setItem('almadados-propostas', JSON.stringify(novasPropostas));
  };

  const salvarAreas = (novasAreas: Area[]) => {
    setAreas(novasAreas);
    localStorage.setItem('almadados-areas', JSON.stringify(novasAreas));
  };

  // Adicionar entidades
  const adicionarCliente = (cliente: Omit<Cliente, 'id' | 'criadoEm'>) => {
    const novoCliente: Cliente = {
      ...cliente,
      id: Date.now().toString(),
      criadoEm: new Date().toISOString(),
    };
    salvarClientes([...clientes, novoCliente]);
    return novoCliente;
  };

  const adicionarTarefa = (tarefa: Omit<Tarefa, 'id' | 'criadaEm' | 'concluida'>) => {
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: Date.now().toString(),
      concluida: false,
      criadaEm: new Date().toISOString(),
    };
    salvarTarefas([...tarefas, novaTarefa]);
    return novaTarefa;
  };

  const adicionarProposta = (proposta: Omit<Proposta, 'id' | 'criadaEm' | 'numeracao'>) => {
    const ultimaPropostaDoCliente = propostas
      .filter(p => p.cliente.id === proposta.cliente.id)
      .sort((a, b) => b.numeracao - a.numeracao)[0];
    
    const proximaNumericao = ultimaPropostaDoCliente ? ultimaPropostaDoCliente.numeracao + 1 : 1;
    
    const novaProposta: Proposta = {
      ...proposta,
      id: Date.now().toString(),
      numeracao: proximaNumericao,
      criadaEm: new Date().toISOString(),
    };
    salvarPropostas([...propostas, novaProposta]);
    return novaProposta;
  };

  const adicionarArea = (area: Omit<Area, 'id' | 'criadaEm'>) => {
    const novaArea: Area = {
      ...area,
      id: Date.now().toString(),
      criadaEm: new Date().toISOString(),
    };
    salvarAreas([...areas, novaArea]);
    return novaArea;
  };

  // Atualizar entidades
  const atualizarTarefa = (id: string, updates: Partial<Tarefa>) => {
    const tarefasAtualizadas = tarefas.map(tarefa => 
      tarefa.id === id ? { ...tarefa, ...updates } : tarefa
    );
    salvarTarefas(tarefasAtualizadas);
  };

  const atualizarProposta = (id: string, updates: Partial<Proposta>) => {
    const propostasAtualizadas = propostas.map(proposta => 
      proposta.id === id ? { ...proposta, ...updates } : proposta
    );
    salvarPropostas(propostasAtualizadas);
  };

  const atualizarCliente = (id: string, updates: Partial<Cliente>) => {
    const clientesAtualizados = clientes.map(cliente => 
      cliente.id === id ? { ...cliente, ...updates } : cliente
    );
    salvarClientes(clientesAtualizados);
  };

  const atualizarArea = (id: string, updates: Partial<Area>) => {
    const areasAtualizadas = areas.map(area => 
      area.id === id ? { ...area, ...updates } : area
    );
    salvarAreas(areasAtualizadas);
  };

  // Buscar cliente por nome ou criar novo
  const buscarOuCriarCliente = (nomeEmpresa: string, nomeContacto: string = '') => {
    const clienteExistente = clientes.find(c => 
      c.empresa.toLowerCase() === nomeEmpresa.toLowerCase()
    );
    
    if (clienteExistente) {
      return clienteExistente;
    }
    
    return adicionarCliente({
      empresa: nomeEmpresa,
      contacto: nomeContacto,
      telemovel: '',
      email: '',
      localidade: '',
      morada: '',
    });
  };

  // Função para exportar dados (backup)
  const exportarDados = () => {
    const dados = {
      clientes,
      tarefas,
      propostas,
      exportadoEm: new Date().toISOString(),
    };
    return JSON.stringify(dados, null, 2);
  };

  // Função para importar dados (restaurar backup)
  const importarDados = (dadosJson: string) => {
    try {
      const dados = JSON.parse(dadosJson);
      if (dados.clientes) salvarClientes(dados.clientes);
      if (dados.tarefas) salvarTarefas(dados.tarefas);
      if (dados.propostas) salvarPropostas(dados.propostas);
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  };

  // Eliminar entidades
  const eliminarCliente = (id: string) => {
    const clientesAtualizados = clientes.filter(cliente => cliente.id !== id);
    salvarClientes(clientesAtualizados);
  };

  const eliminarTarefa = (id: string) => {
    const tarefasAtualizadas = tarefas.filter(tarefa => tarefa.id !== id);
    salvarTarefas(tarefasAtualizadas);
  };

  const eliminarProposta = (id: string) => {
    const propostasAtualizadas = propostas.filter(proposta => proposta.id !== id);
    salvarPropostas(propostasAtualizadas);
  };

  const eliminarArea = (id: string) => {
    const areasAtualizadas = areas.filter(area => area.id !== id);
    salvarAreas(areasAtualizadas);
  };

  return {
    clientes,
    tarefas,
    propostas,
    areas,
    adicionarCliente,
    adicionarTarefa,
    adicionarProposta,
    adicionarArea,
    atualizarTarefa,
    atualizarProposta,
    atualizarCliente,
    atualizarArea,
    eliminarCliente,
    eliminarTarefa,
    eliminarProposta,
    eliminarArea,
    buscarOuCriarCliente,
    exportarDados,
    importarDados,
  };
}