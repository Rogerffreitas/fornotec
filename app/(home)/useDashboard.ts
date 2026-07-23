import { router } from 'expo-router';
import { Modulo, podeAcessarModulo } from '../../domain/types/permissions';
import { useAuth } from '../../context/AuthContext';

export interface DashboardModulo {
  titulo: string;
  descricao: string;
  rota: string;
  modulo: Modulo;
}

const MODULOS: DashboardModulo[] = [
  { titulo: 'Lojas', descricao: 'Cadastro de lojas', rota: '/lojas', modulo: 'lojas' },
  {
    titulo: 'Ordens de Serviço',
    descricao: 'Abrir e acompanhar ordens',
    rota: '/ordem-de-servico',
    modulo: 'ordem-de-servico',
  },
  { titulo: 'Peças', descricao: 'Cadastro de peças', rota: '/pecas', modulo: 'pecas' },
  { titulo: 'Fornos', descricao: 'Cadastro de fornos por loja', rota: '/fornos', modulo: 'fornos' },
  {
    titulo: 'Peças do Forno',
    descricao: 'Associar peças aos fornos',
    rota: '/pecas-forno',
    modulo: 'pecas-forno',
  },
  {
    titulo: 'Manutenções',
    descricao: 'Histórico de manutenções',
    rota: '/manutencao',
    modulo: 'manutencao',
  },
  {
    titulo: 'Relatórios',
    descricao: 'Relatórios analítico e sintético por loja',
    rota: '/reports',
    modulo: 'relatorios',
  },
];

export interface UseDashboardResult {
  userName: string;
  roleLabel: string;
  modulosVisiveis: DashboardModulo[];
  sair: () => void;
}

/** Filtra os módulos visíveis pelo perfil do usuário e concentra o logout — a tela (`index.tsx`) só monta a UI. */
export function useDashboard(): UseDashboardResult {
  const { user, logout } = useAuth();

  const roleLabel =
    user?.role === 'TECHNICAL' ? 'Perfil: técnico' : user?.role === 'CLIENT' ? 'Perfil: cliente' : '';

  function sair() {
    logout();
    router.replace('/login');
  }

  return {
    userName: user?.name ?? '',
    roleLabel,
    modulosVisiveis: MODULOS.filter((m) => podeAcessarModulo(user!.role, m.modulo)),
    sair,
  };
}
