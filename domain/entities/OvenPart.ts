/**
 * Associação N:N — um forno tem muitas peças e uma peça pode estar em muitos
 * fornos. Não apareceu como arquivo separado na árvore original, mas é
 * necessária para modelar "oven parts" descrito nos atributos.
 */
export interface OvenPart {
  id: number;
  enterpriseId: string;
  ovenId: number;
  partId: number;
}
