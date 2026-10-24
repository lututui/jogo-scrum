# Música em loop, calma, a mesma no escritório, nas reuniões e nas decisões
#
# 8 compassos a 72 bpm: só um arpejo macio e o baixo, sobre C, Am, F e G, dois
# compassos cada. O que passa do fim volta ao começo, e o loop não tem emenda.

from .sintese import TAXA, hz, misturar, normalizar, passa_baixa, tom

BPM = 72
TEMPO = 60 / BPM
COMPASSO = 4 * TEMPO

# acorde -> (fundamental, terça, quinta) e baixo
ACORDES = {
    "C": ([60, 64, 67], 48),
    "Am": ([57, 60, 64], 45),
    "F": ([53, 57, 60], 41),
    "G": ([55, 59, 62], 43),
}

HARMONIA = ["C", "C", "Am", "Am", "F", "F", "G", "G"]

# notas do acorde por colcheia: fundamental, quinta, terça, quinta, oitava...
ARPEJO = [0, 2, 1, 2, 3, 2, 1, 2]


def gerar_musica():
    total = int(round(len(HARMONIA) * COMPASSO * TAXA))
    mistura = [0.0] * total

    for c, nome in enumerate(HARMONIA):
        notas, baixo = ACORDES[nome]
        notas = notas + [notas[0] + 12]
        inicio = c * COMPASSO

        linha = tom(hz(baixo), COMPASSO - 0.15, forma="triangulo", ataque=0.02, queda=0.8,
                    sustenta=0.5, solta=0.3)
        misturar(mistura, passa_baixa(linha, 450), inicio, 0.45, circular=True)

        for k, indice in enumerate(ARPEJO):
            pingo = tom(hz(notas[indice]), 0.25, forma="triangulo", ataque=0.01, queda=0.35,
                        sustenta=0.0, solta=0.05)
            misturar(mistura, passa_baixa(pingo, 1400), inicio + k * TEMPO / 2, 0.3, circular=True)

    return normalizar(mistura, 0.5)
