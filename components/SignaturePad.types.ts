import { TracoAssinatura } from '../domain/entities/Signature';

/**
 * Compartilhado entre SignaturePad.tsx (fallback nativo) e SignaturePad.web.tsx (implementação
 * real) — o Metro escolhe o arquivo certo por plataforma, mas o TypeScript (que não entende
 * esse sufixo) sempre resolve `./SignaturePad` para o .tsx puro, então os dois precisam do
 * mesmo formato de handle vindo daqui.
 */
export interface SignaturePadHandle {
  limpar: () => void;
  estaVazia: () => boolean;
  obterAssinatura: () => { tracos: TracoAssinatura[]; largura: number; altura: number };
}
