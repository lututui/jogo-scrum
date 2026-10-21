# Cabelo, óculos, olhos e sobrancelha

from .medidas import CABECA_X, CABECA_Y, r
from .paleta import COR_DA_ARMACAO, COR_DA_LENTE, COR_DA_SOBRANCELHA_CLARA, CONTORNO

LINHA_DA_SOBRANCELHA = 8
COLUNA_DE_AMOSTRA_DA_SOBRANCELHA = 13
LIMIAR_DE_CONTRASTE = 45


# touca base e o detalhe de cada estilo; curto_liso é só a touca
def desenhar_cabelo(d, tipo, cor):
    hx, hy = CABECA_X, CABECA_Y
    r(d, hx, hy - 2, 10, 4, cor)
    if tipo == "franja_reta":
        r(d, hx - 1, hy - 2, 1, 9, cor)
        r(d, hx + 10, hy - 2, 1, 9, cor)
    elif tipo == "raspado":
        r(d, hx + 1, hy - 4, 8, 3, cor)
        r(d, hx, hy + 2, 1, 2, cor)
        r(d, hx + 9, hy + 2, 1, 2, cor)
    elif tipo == "coque_alto":
        r(d, hx + 3, hy - 5, 5, 4, cor)
    elif tipo == "coque_baixo":
        r(d, hx + 10, hy + 4, 3, 3, cor)
    elif tipo == "topete":
        r(d, hx + 1, hy - 4, 2, 2, cor)
        r(d, hx + 4, hy - 5, 2, 3, cor)
        r(d, hx + 7, hy - 4, 2, 2, cor)
    elif tipo == "rabo_cavalo":
        r(d, hx + 10, hy, 2, 9, cor)


# vem antes dos olhos: a lente é fundo e os olhos ficam por cima
def desenhar_oculos(d, cor_da_armacao=COR_DA_ARMACAO):
    for x in (12, 17):
        r(d, x, 10, 4, 2, COR_DA_LENTE)
        r(d, x, 9, 4, 1, cor_da_armacao)
        r(d, x, 10, 1, 2, cor_da_armacao)
        r(d, x + 3, 10, 1, 2, cor_da_armacao)
    r(d, 16, 9, 1, 1, cor_da_armacao)


def luminancia(cor):
    vermelho = int(cor[1:3], 16)
    verde = int(cor[3:5], 16)
    azul = int(cor[5:7], 16)
    return 0.299 * vermelho + 0.587 * verde + 0.114 * azul


def para_hexadecimal(pixel):
    return "#%02x%02x%02x" % pixel[:3]


# o que já foi desenhado onde a sobrancelha vai cair
def fundo_da_sobrancelha(img, cor_da_pele):
    pixel = img.getpixel((COLUNA_DE_AMOSTRA_DA_SOBRANCELHA, LINHA_DA_SOBRANCELHA))
    if pixel[3] == 0:
        return cor_da_pele
    return para_hexadecimal(pixel)


# a cor do cabelo vem primeiro por ser a mais natural
def cor_da_sobrancelha(cor_do_cabelo, cor_de_fundo):
    for candidata in (cor_do_cabelo, CONTORNO):
        if abs(luminancia(candidata) - luminancia(cor_de_fundo)) >= LIMIAR_DE_CONTRASTE:
            return candidata

    return COR_DA_SOBRANCELHA_CLARA


# olhos em contorno; a sobrancelha usa a cor recebida
def desenhar_olhos(d, expressao, cor):
    for x in (13, 18):
        if expressao == "neutro":
            r(d, x, 10, 1, 2, CONTORNO)
        elif expressao == "tenso":
            r(d, x, 10, 2, 1, CONTORNO)
        elif expressao == "aprovacao":
            r(d, x, 11, 2, 1, CONTORNO)

    base = LINHA_DA_SOBRANCELHA

    if expressao == "tenso":
        r(d, 12, base, 3, 1, cor)
        r(d, 17, base, 3, 1, cor)
    elif expressao == "aprovacao":
        for centro in (13, 18):
            r(d, centro - 1, base, 1, 1, cor)
            r(d, centro, base - 1, 1, 1, cor)
            r(d, centro + 1, base, 1, 1, cor)
