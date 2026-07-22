import React, { useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { TextField } from './TextField';
import { PrimaryButton } from './PrimaryButton';
import { SignaturePad } from './SignaturePad';
import { SignaturePadHandle } from './SignaturePad.types';
import { colors, spacing, radius, maxContentWidth } from './theme';
import { AssinaturaCliente } from '../domain/entities/Signature';

interface Props {
  visivel: boolean;
  carregando?: boolean;
  onCancelar: () => void;
  onConfirmar: (assinatura: AssinaturaCliente) => void;
}

/** Modal exibido ao finalizar uma ordem: pede nome + assinatura (traço) do responsável/cliente. */
export function AssinaturaModal({ visivel, carregando, onCancelar, onConfirmar }: Props) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const padRef = useRef<SignaturePadHandle>(null);

  function limparAssinatura() {
    padRef.current?.limpar();
    setErro(null);
  }

  function confirmar() {
    if (!nome.trim()) {
      setErro('Informe o nome do responsável/cliente.');
      return;
    }
    if (!padRef.current || padRef.current.estaVazia()) {
      setErro('Peça para o responsável/cliente assinar no campo abaixo.');
      return;
    }
    setErro(null);
    const { tracos, largura, altura } = padRef.current.obterAssinatura();
    onConfirmar({ nome: nome.trim(), tracos, largura, altura });
  }

  function fechar() {
    setNome('');
    setErro(null);
    onCancelar();
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={fechar}>
      <View style={styles.fundo}>
        <View style={styles.cartao}>
          <Text style={styles.titulo}>Finalizar ordem de serviço</Text>
          <Text style={styles.subtitulo}>
            Peça para o responsável pela loja conferir o serviço executado e assinar abaixo.
          </Text>

          <TextField
            rotulo="Nome do responsável/cliente *"
            value={nome}
            onChangeText={setNome}
            placeholder="Nome completo"
          />

          <Text style={styles.rotuloAssinatura}>Assinatura *</Text>
          <SignaturePad ref={padRef} altura={160} />
          <PrimaryButton
            titulo="Limpar assinatura"
            variante="secundaria"
            onPress={limparAssinatura}
            style={{ marginTop: spacing.sm }}
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <View style={styles.acoes}>
            <PrimaryButton
              titulo="Cancelar"
              variante="secundaria"
              onPress={fechar}
              desabilitado={carregando}
              style={{ flex: 1 }}
            />
            <PrimaryButton
              titulo="Confirmar e finalizar"
              onPress={confirmar}
              carregando={carregando}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  cartao: {
    width: '100%',
    maxWidth: maxContentWidth,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  titulo: { fontSize: 18, fontWeight: '700', color: colors.text },
  subtitulo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  rotuloAssinatura: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  erro: { color: colors.danger, fontSize: 12, marginTop: spacing.sm },
  acoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
