/** Dispara o download de um PDF gerado em memória — só funciona quando `Platform.OS === 'web'`. */
export async function baixarPdfNaWeb(bytes: Uint8Array, nomeArquivo: string) {
  // @ts-ignore -- globais de navegador, disponíveis apenas quando Platform.OS === 'web'
  const blob = new Blob([bytes], { type: 'application/pdf' });
  // @ts-ignore
  const url = URL.createObjectURL(blob);
  // @ts-ignore
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  link.click();
  // @ts-ignore
  URL.revokeObjectURL(url);
}
