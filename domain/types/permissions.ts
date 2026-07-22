import { Role } from './index';

/** Um dos módulos listados no dashboard / roteados em app/(home). */
export type Modulo =
  | 'lojas'
  | 'fornos'
  | 'ordem-de-servico'
  | 'pecas'
  | 'pecas-forno'
  | 'manutencao';

/**
 * Módulos liberados para o perfil cliente: ver/cadastrar/editar lojas e fornos,
 * ver/cadastrar/cancelar ordens de serviço. Técnico (e admin) têm acesso total —
 * peças, peças do forno e manutenção (incluindo registrar manutenção numa ordem)
 * ficam restritos ao técnico.
 */
const MODULOS_CLIENTE: readonly Modulo[] = ['lojas', 'fornos', 'ordem-de-servico'];

export function podeAcessarModulo(role: Role, modulo: Modulo): boolean {
  if (role === 'CLIENT') return MODULOS_CLIENTE.includes(modulo);
  return true;
}

/** Finalizar uma ordem e registrar manutenção nos fornos dela são ações exclusivas do técnico. */
export function podeGerenciarOrdem(role: Role): boolean {
  return role !== 'CLIENT';
}

/**
 * Resolve a qual módulo uma rota de app/(home) pertence, para o guard de navegação.
 * `null` = rota liberada para todo mundo (ex: a home '/').
 */
export function moduloDaRota(pathname: string): Modulo | null {
  if (/^\/ordem-de-servico\/[^/]+\/forno\//.test(pathname)) return 'manutencao';
  if (pathname.startsWith('/ordem-de-servico')) return 'ordem-de-servico';
  if (pathname.startsWith('/lojas')) return 'lojas';
  if (pathname.startsWith('/pecas-forno')) return 'pecas-forno';
  if (pathname.startsWith('/pecas')) return 'pecas';
  if (pathname.startsWith('/fornos')) return 'fornos';
  if (pathname.startsWith('/manutencao')) return 'manutencao';
  return null;
}
