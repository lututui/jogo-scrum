# Composição por camadas
#
# Mesma ordem de sprites.personagem, mas a partir das folhas.

from PIL import Image, ImageDraw

from sprites.acessorios import ACESSORIOS, desenhar_acessorio
from sprites.camadas import folhas_de_camada
from sprites.corpo import ordem_das_pecas
from sprites.elenco import EXPRESSOES
from sprites.medidas import (
    ALTURA_RETRATO,
    ALTURA_SPRITE,
    LARGURA_RETRATO,
    LARGURA_SPRITE,
    QUADROS,
    RECORTE_RETRATO,
)
from sprites.paleta import (
    COR_DA_ARMACAO,
    COR_DE_CABELO,
    COR_DE_CALCA,
    COR_DE_CRACHA,
    COR_DE_ROUPA,
    TOM_DE_PELE,
    TRANSPARENTE,
)
from sprites.rosto import cor_da_sobrancelha, fundo_da_sobrancelha

from .folhas import empilhar


def compor(folhas, spec, frame=0, expressao="neutro", cadeira=None):
    tipo_cabelo, nome_cabelo, nome_roupa, acessorio, nome_pele = spec
    pele = TOM_DE_PELE[nome_pele]
    cabelo = COR_DE_CABELO[nome_cabelo]

    img = Image.new("RGBA", (LARGURA_SPRITE, ALTURA_SPRITE), TRANSPARENTE)
    empilhar(img, folhas["corpo"], frame, pele)
    empilhar(img, folhas["inferior_calca"], frame, COR_DE_CALCA)
    empilhar(img, folhas["superior_camiseta"], frame, COR_DE_ROUPA[nome_roupa])
    empilhar(img, folhas["cabelo_" + tipo_cabelo], frame, cabelo)

    if acessorio == "oculos":
        empilhar(img, folhas["oculos"], frame, COR_DA_ARMACAO)

    # a sobrancelha depende do que já está embaixo dela
    fundo = fundo_da_sobrancelha(img, pele)
    empilhar(img, folhas["olhos_" + expressao], frame, cor_da_sobrancelha(cabelo, fundo))

    # fone e objetos na mão são só dos NPCs e não viraram camada
    if acessorio in ACESSORIOS:
        desenhar_acessorio(ImageDraw.Draw(img), acessorio)

    if cadeira:
        empilhar(img, folhas["cracha"], frame, COR_DE_CRACHA[cadeira])

    return img


# a folha da peça com as cores que ela pede, tiradas da aparência
def empilhar_peca(img, folhas, nome, frame, aparencia):
    _, categorias = folhas_de_camada()[nome]
    empilhar(img, folhas[nome], frame, *[aparencia[c] for c in categorias])


# o jogador a partir da aparência do editor, como o jogo fará
def compor_jogador(folhas, aparencia, frame=0, expressao="neutro", cadeira=None):
    pele = aparencia["pele"]
    cabelo = aparencia["cabelo"]

    img = Image.new("RGBA", (LARGURA_SPRITE, ALTURA_SPRITE), TRANSPARENTE)
    empilhar(img, folhas["corpo"], frame, pele)
    for nome in ordem_das_pecas(aparencia):
        empilhar_peca(img, folhas, nome, frame, aparencia)
    empilhar(img, folhas["cabelo_" + aparencia["estilo_de_cabelo"]], frame, cabelo)

    if aparencia["oculos"] == "cristal":
        empilhar(img, folhas["oculos_cristal"], frame)
    elif aparencia["oculos"]:
        empilhar(img, folhas["oculos"], frame, aparencia["oculos"])

    fundo = fundo_da_sobrancelha(img, pele)
    empilhar(img, folhas["olhos_" + expressao], frame, cor_da_sobrancelha(cabelo, fundo))

    if aparencia.get("acessorio") == "fone":
        empilhar(img, folhas["fone"], frame)

    if cadeira:
        empilhar(img, folhas["cracha"], frame, COR_DE_CRACHA[cadeira])

    return img


def folha_corpo(folhas, spec, cadeira=None):
    folha = Image.new("RGBA", (LARGURA_SPRITE * QUADROS, ALTURA_SPRITE), TRANSPARENTE)
    for i in range(QUADROS):
        folha.paste(compor(folhas, spec, frame=i, cadeira=cadeira), (i * LARGURA_SPRITE, 0))
    return folha


def folha_retrato(folhas, spec, cadeira=None):
    folha = Image.new("RGBA", (LARGURA_RETRATO * len(EXPRESSOES), ALTURA_RETRATO), TRANSPARENTE)
    for i, expressao in enumerate(EXPRESSOES):
        cabeca = compor(folhas, spec, expressao=expressao, cadeira=cadeira).crop(RECORTE_RETRATO)
        cabeca = cabeca.resize((LARGURA_RETRATO, ALTURA_RETRATO), Image.NEAREST)
        folha.paste(cabeca, (i * LARGURA_RETRATO, 0))
    return folha
