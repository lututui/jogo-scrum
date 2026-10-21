# Corpo e roupas
#
# Cada função pinta um quadro da folha de corpo com a cor que recebe.

from .medidas import CABECA_X, CABECA_Y, r
from .paleta import COR_DE_SAPATO


# quadro 1 levanta a perna esquerda e abaixa a mão direita; quadro 2, o oposto
def passos(frame):
    return (1 if frame == 1 else 0), (1 if frame == 2 else 0)


# pele: pernas, mãos, pescoço e cabeça; as pernas aparecem com shorts e saias
def camada_corpo(d, frame, pele):
    passo_a, passo_b = passos(frame)
    r(d, 12, 24 + passo_a, 4, 5 - passo_a, pele)
    r(d, 16, 24 + passo_b, 4, 5 - passo_b, pele)
    r(d, 8, 19 + passo_b, 2, 4, pele)
    r(d, 22, 19 + passo_a, 2, 4, pele)
    r(d, 14, 13, 4, 2, pele)
    r(d, CABECA_X, CABECA_Y, 10, 9, pele)


# calça comprida; os sapatos têm cor fixa
def camada_calca(d, frame, cor):
    passo_a, passo_b = passos(frame)
    r(d, 12, 24 + passo_a, 4, 5 - passo_a, cor)
    r(d, 16, 24 + passo_b, 4, 5 - passo_b, cor)
    r(d, 12, 29, 4, 2, COR_DE_SAPATO)
    r(d, 16, 29, 4, 2, COR_DE_SAPATO)


# camiseta simples: tronco e mangas curtas
def camada_camiseta(d, frame, cor):
    r(d, 10, 15, 12, 9, cor)
    r(d, 8, 15, 2, 4, cor)
    r(d, 22, 15, 2, 4, cor)
