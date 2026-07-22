import { moduloDaRota, podeAcessarModulo, podeGerenciarOrdem } from '../permissions';

describe('podeAcessarModulo', () => {
  it('libera lojas, fornos e ordem de serviço para o cliente', () => {
    expect(podeAcessarModulo('CLIENT', 'lojas')).toBe(true);
    expect(podeAcessarModulo('CLIENT', 'fornos')).toBe(true);
    expect(podeAcessarModulo('CLIENT', 'ordem-de-servico')).toBe(true);
  });

  it('bloqueia peças, peças-do-forno e manutenção para o cliente', () => {
    expect(podeAcessarModulo('CLIENT', 'pecas')).toBe(false);
    expect(podeAcessarModulo('CLIENT', 'pecas-forno')).toBe(false);
    expect(podeAcessarModulo('CLIENT', 'manutencao')).toBe(false);
  });

  it('libera todos os módulos para técnico e admin', () => {
    const modulos = ['lojas', 'fornos', 'ordem-de-servico', 'pecas', 'pecas-forno', 'manutencao'] as const;
    modulos.forEach((modulo) => {
      expect(podeAcessarModulo('TECHNICAL', modulo)).toBe(true);
      expect(podeAcessarModulo('ADMIN', modulo)).toBe(true);
    });
  });
});

describe('podeGerenciarOrdem', () => {
  it('é falso para cliente e verdadeiro para técnico/admin', () => {
    expect(podeGerenciarOrdem('CLIENT')).toBe(false);
    expect(podeGerenciarOrdem('TECHNICAL')).toBe(true);
    expect(podeGerenciarOrdem('ADMIN')).toBe(true);
  });
});

describe('moduloDaRota', () => {
  it('reconhece as rotas de cada módulo', () => {
    expect(moduloDaRota('/lojas')).toBe('lojas');
    expect(moduloDaRota('/lojas/nova-loja')).toBe('lojas');
    expect(moduloDaRota('/lojas/5')).toBe('lojas');
    expect(moduloDaRota('/fornos')).toBe('fornos');
    expect(moduloDaRota('/fornos/7')).toBe('fornos');
    expect(moduloDaRota('/pecas')).toBe('pecas');
    expect(moduloDaRota('/pecas-forno')).toBe('pecas-forno');
    expect(moduloDaRota('/pecas-forno/7')).toBe('pecas-forno');
    expect(moduloDaRota('/manutencao')).toBe('manutencao');
    expect(moduloDaRota('/manutencao/10')).toBe('manutencao');
    expect(moduloDaRota('/ordem-de-servico')).toBe('ordem-de-servico');
    expect(moduloDaRota('/ordem-de-servico/10')).toBe('ordem-de-servico');
  });

  it('trata a rota de registrar manutenção dentro de uma ordem como módulo de manutenção', () => {
    expect(moduloDaRota('/ordem-de-servico/10/forno/3')).toBe('manutencao');
  });

  it('retorna null para a home, liberada para todo mundo', () => {
    expect(moduloDaRota('/')).toBeNull();
  });
});
