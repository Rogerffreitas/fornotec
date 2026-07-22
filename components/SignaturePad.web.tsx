import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { colors, radius } from './theme';
import { PontoAssinatura, TracoAssinatura } from '../domain/entities/Signature';
import { SignaturePadHandle } from './SignaturePad.types';

export type { SignaturePadHandle };

interface Props {
  altura?: number;
}

function extrairPonto(e: any, canvas: HTMLCanvasElement): PontoAssinatura {
  const rect = canvas.getBoundingClientRect();
  const toque = e.touches?.[0] ?? e.changedTouches?.[0];
  const clientX = toque ? toque.clientX : e.clientX;
  const clientY = toque ? toque.clientY : e.clientY;
  return { x: clientX - rect.left, y: clientY - rect.top };
}

/**
 * Campo de assinatura (web): desenha no canvas com o dedo/mouse e guarda os traços como
 * pontos (vetor), não como imagem — fica bem menor e o PDF desenha as linhas direto com
 * o pdf-lib, sem precisar embutir uma imagem rasterizada.
 *
 * O canvas precisa da largura em pixels reais (não só CSS) pra as coordenadas do
 * traço baterem com o desenho, por isso mede o container com onLayout antes de
 * renderizar o <canvas> de verdade.
 */
export const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ altura = 160 }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const desenhandoRef = useRef(false);
  const tracosRef = useRef<TracoAssinatura[]>([]);
  const tracoAtualRef = useRef<TracoAssinatura>([]);
  const [largura, setLargura] = useState(0);

  useImperativeHandle(ref, () => ({
    limpar() {
      tracosRef.current = [];
      tracoAtualRef.current = [];
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    },
    estaVazia() {
      return tracosRef.current.length === 0;
    },
    obterAssinatura() {
      return { tracos: tracosRef.current, largura, altura };
    },
  }));

  function iniciar(e: any) {
    e.preventDefault?.();
    const canvas = canvasRef.current;
    if (!canvas) return;
    desenhandoRef.current = true;
    tracoAtualRef.current = [extrairPonto(e, canvas)];
  }

  function mover(e: any) {
    if (!desenhandoRef.current) return;
    e.preventDefault?.();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ponto = extrairPonto(e, canvas);
    const pontos = tracoAtualRef.current;
    pontos.push(ponto);

    const ctx = canvas.getContext('2d');
    if (ctx && pontos.length > 1) {
      const anterior = pontos[pontos.length - 2];
      ctx.strokeStyle = colors.text;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(anterior.x, anterior.y);
      ctx.lineTo(ponto.x, ponto.y);
      ctx.stroke();
    }
  }

  function finalizar() {
    if (!desenhandoRef.current) return;
    desenhandoRef.current = false;
    if (tracoAtualRef.current.length > 1) {
      tracosRef.current.push(tracoAtualRef.current);
    }
    tracoAtualRef.current = [];
  }

  function aoMedir(e: LayoutChangeEvent) {
    const larguraLayout = Math.round(e.nativeEvent.layout.width);
    if (larguraLayout > 0 && larguraLayout !== largura) setLargura(larguraLayout);
  }

  return (
    <View style={styles.container} onLayout={aoMedir}>
      {largura > 0
        ? React.createElement('canvas', {
            ref: canvasRef,
            width: largura,
            height: altura,
            style: { touchAction: 'none', display: 'block' },
            onMouseDown: iniciar,
            onMouseMove: mover,
            onMouseUp: finalizar,
            onMouseLeave: finalizar,
            onTouchStart: iniciar,
            onTouchMove: mover,
            onTouchEnd: finalizar,
          })
        : null}
    </View>
  );
});

SignaturePad.displayName = 'SignaturePad';

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
});
