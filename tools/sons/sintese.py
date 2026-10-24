# Síntese simples, só com a biblioteca padrão
#
# Um som é uma lista de floats entre -1 e 1, a TAXA amostras por segundo.

import math
import random
import struct
import wave

TAXA = 22050


# lista de zeros com a duração pedida, em segundos

def silencio(segundos):
    return [0.0] * int(segundos * TAXA)


# valor da onda numa fase de 0 a 1

def onda(forma, fase, ciclo=0.5):
    fase -= math.floor(fase)
    if forma == "seno":
        return math.sin(2 * math.pi * fase)
    if forma == "triangulo":
        return 4 * fase - 1 if fase < 0.5 else 3 - 4 * fase
    if forma == "quadrada":
        return 1.0 if fase < ciclo else -1.0
    raise ValueError(forma)


# frequência de uma nota MIDI

def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


# envelope ataque, queda, sustentação e soltura; "dur" é o tempo até a
# soltura começar

def envelope(i, dur, ataque, queda, sustenta, solta):
    t = i / TAXA
    if t < ataque:
        return t / ataque if ataque else 1.0
    if t < ataque + queda:
        return 1 - (1 - sustenta) * (t - ataque) / queda
    if t < dur:
        return sustenta
    return max(0.0, sustenta * (1 - (t - dur) / solta)) if solta else 0.0


# uma nota; "freq" pode ser um número ou uma função do tempo (deslize)

def tom(freq, dur, forma="quadrada", ciclo=0.5, ataque=0.005, queda=0.05,
        sustenta=0.6, solta=0.05, vibrato=0.0):
    n = int((dur + solta) * TAXA)
    saida = []
    fase = 0.0
    for i in range(n):
        t = i / TAXA
        f = freq(t) if callable(freq) else freq
        if vibrato:
            f *= 1 + vibrato * math.sin(2 * math.pi * 5 * t)
        fase += f / TAXA
        saida.append(onda(forma, fase, ciclo) * envelope(i, dur, ataque, queda, sustenta, solta))
    return saida


# ruído branco com queda exponencial

def ruido(dur, queda=8.0, semente=1):
    gerador = random.Random(semente)
    return [gerador.uniform(-1, 1) * math.exp(-queda * i / TAXA) for i in range(int(dur * TAXA))]


# sino: parciais inarmônicas com queda própria

def sino(freq, dur, parciais=((1.0, 1.0, 3.0), (2.76, 0.4, 5.0), (5.4, 0.15, 8.0))):
    n = int(dur * TAXA)
    saida = [0.0] * n
    for razao, ganho, queda in parciais:
        for i in range(n):
            t = i / TAXA
            saida[i] += ganho * math.sin(2 * math.pi * freq * razao * t) * math.exp(-queda * t)
    return saida


# passa-baixa de um polo; "corte" pode ser função do tempo

def passa_baixa(sinal, corte):
    saida = []
    y = 0.0
    for i, x in enumerate(sinal):
        c = corte(i / TAXA) if callable(corte) else corte
        a = 1 - math.exp(-2 * math.pi * c / TAXA)
        y += a * (x - y)
        saida.append(y)
    return saida


# soma "sinal" em "base" a partir de "inicio" segundos; com "circular", o que
# passa do fim volta ao começo (para loops sem emenda)

def misturar(base, sinal, inicio=0.0, ganho=1.0, circular=False):
    i0 = int(round(inicio * TAXA))
    for i, x in enumerate(sinal):
        j = i0 + i
        if j >= len(base):
            if not circular:
                base.extend([0.0] * (j - len(base) + 1))
            else:
                j %= len(base)
        base[j] += x * ganho
    return base


# sons em sequência

def juntar(*partes):
    saida = []
    for parte in partes:
        saida.extend(parte)
    return saida


def ganho(sinal, g):
    return [x * g for x in sinal]


# pico em "pico" (0 a 1)

def normalizar(sinal, pico):
    maior = max(abs(x) for x in sinal) or 1.0
    return [x * pico / maior for x in sinal]


# rampas curtas nas pontas, para não estalar

def suavizar_pontas(sinal, segundos=0.004):
    n = min(int(segundos * TAXA), len(sinal) // 2)
    for i in range(n):
        sinal[i] *= i / n
        sinal[-1 - i] *= i / n
    return sinal


def salvar_wav(caminho, sinal):
    with wave.open(caminho, "wb") as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(b"".join(
            struct.pack("<h", int(max(-1.0, min(1.0, x)) * 32767)) for x in sinal))
