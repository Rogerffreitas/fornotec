import { router } from 'expo-router';
import { Modulo, podeAcessarModulo } from '../../domain/types/permissions';
import { Tom } from '../../components/ListRow';
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
  saudacao: string;
  userName: string;
  roleBadge: { texto: string; tom: Tom } | null;
  modulosVisiveis: DashboardModulo[];
  sair: () => void;
}

/** Bom dia / Boa tarde / Boa noite, conforme o horário local do dispositivo. */
function saudacaoPorHorario(hora: number): string {
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

/** Filtra os módulos visíveis pelo perfil do usuário e concentra o logout — a tela (`index.tsx`) só monta a UI. */
export function useDashboard(): UseDashboardResult {
  const { user, logout } = useAuth();

  const roleBadge: { texto: string; tom: Tom } | null =
    user?.role === 'TECHNICAL'
      ? { texto: 'Técnico', tom: 'sucesso' }
      : user?.role === 'CLIENT'
        ? { texto: 'Cliente', tom: 'neutro' }
        : null;

  function sair() {
    logout();
    router.replace('/login');
  }

  return {
    saudacao: saudacaoPorHorario(new Date().getHours()),
    userName: user?.name ?? '',
    roleBadge,
    modulosVisiveis: MODULOS.filter((m) => podeAcessarModulo(user!.role, m.modulo)),
    sair,
  };
}
