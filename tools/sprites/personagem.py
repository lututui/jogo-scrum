# Montagem do personagem
#
# Ordem, de baixo para cima: corpo, parte de baixo, parte de cima, cabelo,
# óculos, olhos, acessório e crachá. Cada parte pinta só a sua área, então
# empilhar as camadas dá o mesmo desenho que pintar tudo de uma vez.

from PIL import Image, ImageDraw

from .acessorios import desenhar_acessorio, desenhar_cracha
from .corpo import PECAS_POR_FOLHA, camada_calca, camada_camiseta, camada_corpo, ordem_das_pecas
from .elenco import EXPRESSOES
from .medidas import (
    ALTURA_RETRATO,
    ALTURA_SPRITE,
    LARGURA_RETRATO,
    LARGURA_SPRITE,
    QUADROS,
    RECORTE_RETRATO,
)
from .paleta import COR_DE_CABELO, COR_DE_CALCA, COR_DE_CRACHA, COR_DE_ROUPA, TOM_DE_PELE, TRANSPARENTE
from .rosto import cor_da_sobrancelha, desenhar_cabelo, desenhar_oculos, desenhar_olhos, fundo_da_sobrancelha


def montar(spec, frame=0, expressao="neutro", cadeira=None):
    tipo_cabelo, nome_cabelo, nome_roupa, acessorio, nome_pele = spec
    pele = TOM_DE_PELE[nome_pele]
    cabelo = COR_DE_CABELO[nome_cabelo]

    img = Image.new("RGBA", (LARGURA_SPRITE, ALTURA_SPRITE), TRANSPARENTE)
    d = ImageDraw.Draw(img)

    camada_corpo(d, frame, pele)
    camada_calca(d, frame, COR_DE_CALCA)
    camada_camiseta(d, frame, COR_DE_ROUPA[nome_roupa])
    desenhar_cabelo(d, tipo_cabelo, cabelo)
    if acessorio == "oculos":
        desenhar_oculos(d)
    fundo = fundo_da_sobrancelha(img, pele)
    desenhar_olhos(d, expressao, cor_da_sobrancelha(cabelo, fundo))
    desenhar_acessorio(d, acessorio)
    if cadeira:
        desenhar_cracha(d, COR_DE_CRACHA[cadeira])
    return img


# as cores que a peça pede, tiradas da aparência pela categoria
def pintar_peca(d, frame, peca, aparencia):
    desenhar, categorias = peca
    desenhar(d, frame, *[aparencia[categoria] for categoria in categorias])


# o jogador a partir da aparência do editor; sem acessório de mão
def montar_jogador(aparencia, frame=0, expressao="neutro", cadeira=None):
    pele = aparencia["pele"]
    cabelo = aparencia["cabelo"]

    img = Image.new("RGBA", (LARGURA_SPRITE, ALTURA_SPRITE), TRANSPARENTE)
    d = ImageDraw.Draw(img)

    camada_corpo(d, frame, pele)
    for folha in ordem_das_pecas(aparencia):
        pintar_peca(d, frame, PECAS_POR_FOLHA[folha], aparencia)
    desenhar_cabelo(d, aparencia["estilo_de_cabelo"], cabelo)
    if aparencia["oculos"]:
        desenhar_oculos(d, aparencia["oculos"])
    fundo = fundo_da_sobrancelha(img, pele)
    desenhar_olhos(d, expressao, cor_da_sobrancelha(cabelo, fundo))
    if cadeira:
        desenhar_cracha(d, COR_DE_CRACHA[cadeira])
    return img


# três quadros lado a lado: parado, passo A, passo B
def folha_corpo(spec, cadeira=None):
    folha = Image.new("RGBA", (LARGURA_SPRITE * QUADROS, ALTURA_SPRITE), TRANSPARENTE)
    for i in range(QUADROS):
        folha.paste(montar(spec, frame=i, cadeira=cadeira), (i * LARGURA_SPRITE, 0))
    return folha


# a cabeça do sprite ampliada 4x, uma vez por expressão
def folha_retrato(spec, cadeira=None):
    folha = Image.new("RGBA", (LARGURA_RETRATO * len(EXPRESSOES), ALTURA_RETRATO), TRANSPARENTE)
    for i, expressao in enumerate(EXPRESSOES):
        corpo = montar(spec, frame=0, expressao=expressao, cadeira=cadeira)
        cabeca = corpo.crop(RECORTE_RETRATO)
        cabeca = cabeca.resize((LARGURA_RETRATO, ALTURA_RETRATO), Image.NEAREST)
        folha.paste(cabeca, (i * LARGURA_RETRATO, 0))
    return folha
