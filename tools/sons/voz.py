# Timbres de voz
#
# Cada timbre é uma sílaba curta em lá 440; o jogo muda a altura na hora de
# tocar (altura da pessoa, letra e entonação), e assim uma voz é só um
# timbre mais alguns números, como a aparência no criador de personagem.

import math

from .sintese import misturar, normalizar, passa_baixa, ruido, suavizar_pontas, tom

BASE = 440.0
DURACAO = 0.05
PICO = 0.3


# a altura cai um pouco no começo, como numa sílaba falada
def queda_de_altura(t):
    return BASE * 2 ** (max(0.0, 0.012 - t) / 0.012 / 12)


def silaba(forma, ciclo=0.5, corte=3000):
    som = tom(queda_de_altura, DURACAO, forma=forma, ciclo=ciclo, ataque=0.004, queda=0.03,
              sustenta=0.35, solta=0.02)
    return normalizar(suavizar_pontas(passa_baixa(som, corte)), PICO)


def suave():
    return silaba("triangulo", corte=2500)


def clara():
    return silaba("quadrada", 0.5, corte=2800)


def nasal():
    return silaba("quadrada", 0.125, corte=3800)


def redonda():
    som = tom(lambda t: BASE * (1 - 0.15 * min(t, 0.05) / 0.05), DURACAO, forma="seno",
              ataque=0.004, queda=0.03, sustenta=0.4, solta=0.02)
    som = [x + 0.25 * math.copysign(x * x, x) for x in som]
    return normalizar(suavizar_pontas(som), PICO)


def soprada():
    som = misturar(silaba("triangulo", corte=2200),
                   passa_baixa(ruido(DURACAO + 0.02, queda=30, semente=5), 3000), ganho=0.35)
    return normalizar(suavizar_pontas(som), PICO)


TIMBRES = {
    "suave": suave,
    "clara": clara,
    "nasal": nasal,
    "redonda": redonda,
    "soprada": soprada,
}
