/** Um ponto do traço de assinatura, em pixels do canvas onde foi desenhado. */
export interface PontoAssinatura {
  x: number;
  y: number;
}

/** Um traço = sequência de pontos capturados enquanto o dedo/mouse ficou pressionado. */
export type TracoAssinatura = PontoAssinatura[];

export interface AssinaturaCliente {
  nome: string;
  tracos: TracoAssinatura[];
  /** Tamanho do canvas onde a assinatura foi desenhada, para o PDF escalar os traços corretamente. */
  largura: number;
  altura: number;
}
