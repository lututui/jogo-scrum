# Corpo e roupas
#
# Cada função pinta um quadro da folha de corpo com as cores que recebe.
# O crachá do jogador fica na cintura, à direita (x 19 a 21), e deixa o
# centro do peito livre para as estampas das peças desbloqueáveis.

from functools import partial

from .medidas import CABECA_X, CABECA_Y, r
from .paleta import (
    COR_DA_CAMISETA_CATAVENTO,
    COR_DA_DOBRA_DO_POST_IT,
    COR_DA_FAIXA_REFLETIVA,
    COR_DA_LINHA_DO_POST_IT,
    COR_DE_SAPATO,
    COR_DO_ALVO,
    COR_DO_ALVO_CLARO,
    COR_DO_COLETE,
    COR_DO_CONTORNO_DO_VISTO,
    COR_DO_POST_IT,
    COR_DO_SELO,
    COR_DO_VISTO,
    COR_DO_X_DO_SELO,
)


# quadro 1 levanta o pé esquerdo e balança o braço direito; quadro 2, o
# oposto. A perna continua presa ao quadril: o que sobe é o pé, e a perna
# encurta por baixo. O braço que balança desce um pixel sem soltar do ombro.
ELEVACAO_DO_PE = 2


def passos(frame):
    return (ELEVACAO_DO_PE if frame == 1 else 0), (ELEVACAO_DO_PE if frame == 2 else 0)


# uma perna, do quadril até o sapato
def perna(d, x, elevacao, cor, altura=5):
    r(d, x, 24, 4, altura - elevacao, cor)


# pele: pernas, mãos, pescoço e cabeça; as pernas aparecem com shorts e saias
def camada_corpo(d, frame, pele):
    passo_a, passo_b = passos(frame)
    perna(d, 12, passo_a, pele)
    perna(d, 16, passo_b, pele)
    r(d, 8, 19, 2, 4 + min(passo_b, 1), pele)
    r(d, 22, 19, 2, 4 + min(passo_a, 1), pele)
    r(d, 14, 13, 4, 2, pele)
    r(d, CABECA_X, CABECA_Y, 10, 9, pele)


# ------------------------------------------------------------------
# parte de cima

ALTURA_DO_TRONCO = 9

# por dentro da saia o tronco perde a última linha, para não aparecer dos
# lados da cintura, que é mais estreita
ALTURA_POR_DENTRO = ALTURA_DO_TRONCO - 1


def tronco(d, cor, altura=ALTURA_DO_TRONCO):
    r(d, 10, 15, 12, altura, cor)


def mangas_curtas(d, cor):
    r(d, 8, 15, 2, 4, cor)
    r(d, 22, 15, 2, 4, cor)


# acompanham o braço e deixam dois pixels de mão
def mangas_compridas(d, frame, cor):
    passo_a, passo_b = passos(frame)
    r(d, 8, 15, 2, 6 + min(passo_b, 1), cor)
    r(d, 22, 15, 2, 6 + min(passo_a, 1), cor)


def camada_camiseta(d, frame, cor, altura=ALTURA_DO_TRONCO):
    tronco(d, cor, altura)
    mangas_curtas(d, cor)


# capuz caído dos lados do pescoço
def camada_moletom(d, frame, cor, altura=ALTURA_DO_TRONCO):
    tronco(d, cor, altura)
    mangas_compridas(d, frame, cor)
    r(d, 12, 14, 2, 1, cor)
    r(d, 18, 14, 2, 1, cor)


# aberta na frente: a camiseta de baixo aparece na gola e na barra
def camada_jaqueta(d, frame, cor, cor_interna):
    tronco(d, cor)
    mangas_compridas(d, frame, cor)
    r(d, 14, 15, 4, 1, cor_interna)
    r(d, 15, 16, 2, 8, cor_interna)


# ------------------------------------------------------------------
# peças desbloqueáveis

# um desenho em letras; cada letra é uma cor, "." é vazio
def estampa(d, x, y, linhas, cores):
    for dy, linha in enumerate(linhas):
        for dx, letra in enumerate(linha):
            if letra != ".":
                r(d, x + dx, y + dy, 1, 1, cores[letra])


ALVO = (
    "..RRR..",
    ".RBBBR.",
    "RBRRRBR",
    "RBRBRBR",
    "RBRRRBR",
    ".RBBBR.",
    "..RRR..",
)
# com contorno claro, para não sumir numa camiseta da mesma cor
VISTO = (
    ".......C.",
    "......CVC",
    ".C...CVVC",
    "CVC.CVVC.",
    "CVVCVVC..",
    ".CVVVC...",
    "..CVC....",
    "...C.....",
)
POST_IT = (
    "AAAAAA",
    "ALLLLA",
    "AAAAAA",
    "ALLLAA",
    "AAAAAD",
    "AAAAD.",
)
# o quadrado de papel cortado nas diagonais, antes de virar catavento; a
# moldura é a própria camiseta preta
SELO = (
    "BBBPBBB",
    "BXBBBXB",
    "BBXBXBB",
    "PBBPBBP",
    "BBXBXBB",
    "BXBBBXB",
    "BBBPBBB",
)


# metade da esquerda numa cor, a da direita na outra, mangas junto
def camada_meio_a_meio(d, frame, cor, cor_direita, altura=ALTURA_DO_TRONCO):
    r(d, 10, 15, 6, altura, cor)
    r(d, 16, 15, 6, altura, cor_direita)
    r(d, 8, 15, 2, 4, cor)
    r(d, 22, 15, 2, 4, cor_direita)


# por cima da camiseta, aberto no meio, com duas faixas refletivas
def camada_colete(d, frame, cor, altura=ALTURA_DO_TRONCO):
    camada_camiseta(d, frame, cor, altura)
    for x in (10, 17):
        r(d, x, 15, 5, altura, COR_DO_COLETE)
        r(d, x, 19, 5, 1, COR_DA_FAIXA_REFLETIVA)
        r(d, x, 21, 5, 1, COR_DA_FAIXA_REFLETIVA)


def camada_camiseta_alvo(d, frame, cor, altura=ALTURA_DO_TRONCO):
    camada_camiseta(d, frame, cor, altura)
    estampa(d, 12, 16, ALVO, {"R": COR_DO_ALVO, "B": COR_DO_ALVO_CLARO})


def camada_camiseta_visto(d, frame, cor, altura=ALTURA_DO_TRONCO):
    camada_camiseta(d, frame, cor, altura)
    estampa(d, 11, 15, VISTO, {"V": COR_DO_VISTO, "C": COR_DO_CONTORNO_DO_VISTO})


def camada_camiseta_post_it(d, frame, cor, altura=ALTURA_DO_TRONCO):
    camada_camiseta(d, frame, cor, altura)
    estampa(d, 13, 16, POST_IT, {"A": COR_DO_POST_IT[0], "L": COR_DA_LINHA_DO_POST_IT, "D": COR_DA_DOBRA_DO_POST_IT})


# preta, de cor fixa: não recebe cor do editor
def camada_camiseta_catavento(d, frame, altura=ALTURA_DO_TRONCO):
    camada_camiseta(d, frame, COR_DA_CAMISETA_CATAVENTO, altura)
    estampa(d, 12, 16, SELO, {"B": COR_DO_SELO, "X": COR_DO_X_DO_SELO, "P": COR_DA_CAMISETA_CATAVENTO})


# ------------------------------------------------------------------
# parte de baixo

# o sapato do pé levantado sobe junto
def sapatos(d, frame):
    passo_a, passo_b = passos(frame)
    r(d, 12, 29 - passo_a, 4, 2, COR_DE_SAPATO)
    r(d, 16, 29 - passo_b, 4, 2, COR_DE_SAPATO)


# mesma geometria das pernas
def camada_calca(d, frame, cor):
    passo_a, passo_b = passos(frame)
    perna(d, 12, passo_a, cor)
    perna(d, 16, passo_b, cor)
    sapatos(d, frame)


# até o joelho; a coxa não muda com o passo, só a canela encurta
def camada_shorts(d, frame, cor):
    r(d, 12, 24, 4, 3, cor)
    r(d, 16, 24, 4, 3, cor)
    sapatos(d, frame)


# as saias começam no torso, com a cintura um pixel mais estreita de cada
# lado, e por isso vão por cima da peça de cima
def cintura_da_saia(d, cor):
    r(d, 11, 23, 10, 1, cor)


# mesmo comprimento do shorts, abrindo na barra
def camada_saia_curta(d, frame, cor):
    cintura_da_saia(d, cor)
    r(d, 10, 24, 12, 1, cor)
    r(d, 9, 25, 14, 2, cor)
    sapatos(d, frame)


# mesmo comprimento da calça
def camada_saia_longa(d, frame, cor):
    cintura_da_saia(d, cor)
    r(d, 10, 24, 12, 2, cor)
    r(d, 9, 26, 14, 3, cor)
    sapatos(d, frame)


# ------------------------------------------------------------------
# catálogo: nome -> função e categorias de cor, na ordem dos argumentos

PECAS_DE_CIMA = {
    "camiseta": (camada_camiseta, ("superior",)),
    "moletom": (camada_moletom, ("superior",)),
    "jaqueta": (camada_jaqueta, ("superior", "interna")),
    "meio_a_meio": (camada_meio_a_meio, ("superior", "interna")),
    "colete": (camada_colete, ("superior",)),
    "camiseta_alvo": (camada_camiseta_alvo, ("superior",)),
    "camiseta_visto": (camada_camiseta_visto, ("superior",)),
    "camiseta_post_it": (camada_camiseta_post_it, ("superior",)),
    "camiseta_catavento": (camada_camiseta_catavento, ()),
}

PECAS_DE_BAIXO = {
    "calca": (camada_calca, ("inferior",)),
    "shorts": (camada_shorts, ("inferior",)),
    "saia_curta": (camada_saia_curta, ("inferior",)),
    "saia_longa": (camada_saia_longa, ("inferior",)),
}

# com saia, a peça de cima vai por dentro e não aparece dos lados da cintura;
# a jaqueta fica por fora e não tem essa versão
POR_DENTRO_DA_SAIA = dict(
    (nome, (partial(desenhar, altura=ALTURA_POR_DENTRO), categorias))
    for nome, (desenhar, categorias) in PECAS_DE_CIMA.items()
    if nome != "jaqueta"
)

# as mesmas peças pelo nome da folha de camada
PECAS_POR_FOLHA = dict(
    [("inferior_" + nome, peca) for nome, peca in PECAS_DE_BAIXO.items()]
    + [("superior_" + nome, peca) for nome, peca in PECAS_DE_CIMA.items()]
    + [("superior_" + nome + "_por_dentro", peca) for nome, peca in POR_DENTRO_DA_SAIA.items()]
)

# peças de baixo desenhadas depois da peça de cima
POR_CIMA_DO_TORSO = ("saia_curta", "saia_longa")


# folhas das duas peças, de baixo para cima
def ordem_das_pecas(aparencia):
    cima = "superior_" + aparencia["peca_de_cima"]
    baixo = "inferior_" + aparencia["peca_de_baixo"]
    if aparencia["peca_de_baixo"] not in POR_CIMA_DO_TORSO:
        return baixo, cima
    if aparencia["peca_de_cima"] in POR_DENTRO_DA_SAIA:
        cima += "_por_dentro"
    return cima, baixo
