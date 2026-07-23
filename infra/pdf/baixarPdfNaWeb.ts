/**
 * Abre um PDF gerado em memória em outra aba (visualizador nativo do navegador), em vez de
 * forçar o download — só funciona quando `Platform.OS === 'web'`. Usa um link com
 * `target="_blank"` (não `window.open`) porque um clique sintético em `<a>` não esbarra no
 * bloqueio de pop-up dos navegadores, diferente de abrir uma janela via script.
 */
export async function baixarPdfNaWeb(bytes: Uint8Array, _nomeArquivo: string) {
  // @ts-ignore -- globais de navegador, disponíveis apenas quando Platform.OS === 'web'
  const blob = new Blob([bytes], { type: 'application/pdf' });
  // @ts-ignore
  const url = URL.createObjectURL(blob);
  // @ts-ignore
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener';
  link.click();
  // Revoga só depois de um tempo — a aba nova ainda precisa carregar a URL do blob.
  setTimeout(() => {
    // @ts-ignore
    URL.revokeObjectURL(url);
  }, 60_000);
}
