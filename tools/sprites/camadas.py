# Folhas de camada
#
# Saída: assets/camadas/*.png, lidas pelo jogo para montar o personagem do
# jogador. Cada folha tem os três quadros da folha de corpo. A parte que o
# jogo recolore vem em magenta; a segunda cor da peça, quando há, em ciano.
# O resto (contorno, olhos, lente, sapato) já vem na cor final.

import os

from PIL import Image, ImageDraw

from .acessorios import desenhar_cracha, desenhar_fone
from .corpo import PECAS_POR_FOLHA, camada_corpo
from .elenco import ESTILOS_DE_CABELO, EXPRESSOES
from .medidas import ALTURA_SPRITE, LARGURA_SPRITE, QUADROS
from .paleta import (
    COR_DA_ARMACAO,
    COR_DA_SOBRANCELHA_CLARA,
    COR_DE_CABELO,
    COR_DE_CALCA,
    COR_DE_CRACHA,
    COR_DE_ROUPA,
    CONTORNO,
    TOM_DE_PELE,
    TRANSPARENTE,
)
from .rosto import desenhar_cabelo, desenhar_oculos, desenhar_oculos_cristal, desenhar_olhos

MARCADOR = "#ff00ff"
MARCADOR_SECUNDARIO = "#00ffff"

# o primeiro marcador vai para a primeira categoria da folha, e assim por diante
MARCADORES = (MARCADOR, MARCADOR_SECUNDARIO)

# nomes aceitos por --cor em cada categoria, além de #rrggbb
PALETAS = {
    "pele": TOM_DE_PELE,
    "inferior": dict(COR_DE_ROUPA, calca=COR_DE_CALCA),
    "superior": COR_DE_ROUPA,
    "interna": COR_DE_ROUPA,
    "cabelo": COR_DE_CABELO,
    "oculos": {"armacao": COR_DA_ARMACAO},
    "sobrancelha": dict(COR_DE_CABELO, contorno=CONTORNO, clara=COR_DA_SOBRANCELHA_CLARA),
    "cracha": COR_DE_CRACHA,
}


# nome da folha: função que desenha um quadro e suas categorias de cor
def folhas_de_camada():
    folhas = {
        "corpo": (camada_corpo, ("pele",)),
        "oculos": (lambda d, frame, cor: desenhar_oculos(d, cor), ("oculos",)),
        "cracha": (lambda d, frame, cor: desenhar_cracha(d, cor), ("cracha",)),
        # desbloqueáveis de cor fixa, sem marcador
        "oculos_cristal": (lambda d, frame: desenhar_oculos_cristal(d), ()),
        "fone": (lambda d, frame: desenhar_fone(d), ()),
    }

    folhas.update(PECAS_POR_FOLHA)

    for estilo in ESTILOS_DE_CABELO:
        folhas["cabelo_" + estilo] = (
            lambda d, frame, cor, estilo=estilo: desenhar_cabelo(d, estilo, cor),
            ("cabelo",),
        )

    for expressao in EXPRESSOES:
        folhas["olhos_" + expressao] = (
            lambda d, frame, cor, expressao=expressao: desenhar_olhos(d, expressao, cor),
            ("sobrancelha",),
        )

    return folhas


def folha_de_camada(desenhar, cores):
    folha = Image.new("RGBA", (LARGURA_SPRITE * QUADROS, ALTURA_SPRITE), TRANSPARENTE)
    for i in range(QUADROS):
        quadro = Image.new("RGBA", (LARGURA_SPRITE, ALTURA_SPRITE), TRANSPARENTE)
        desenhar(ImageDraw.Draw(quadro), i, *cores)
        folha.paste(quadro, (i * LARGURA_SPRITE, 0))
    return folha


# cores: categoria -> cor; a categoria ausente fica no seu marcador
def exportar_camadas(destino, cores):
    os.makedirs(destino, exist_ok=True)
    folhas = folhas_de_camada()

    for nome, (desenhar, categorias) in sorted(folhas.items()):
        cores_da_folha = [cores.get(c, MARCADORES[i]) for i, c in enumerate(categorias)]
        folha_de_camada(desenhar, cores_da_folha).save(os.path.join(destino, nome + ".png"))

    return len(folhas)


# "cabelo=castanho" ou "cabelo=#5d3a20" -> ("cabelo", "#5d3a20")
def ler_cor(texto):
    if "=" not in texto:
        raise ValueError("use CATEGORIA=COR, por exemplo cabelo=castanho")

    categoria, valor = texto.split("=", 1)
    if categoria not in PALETAS:
        raise ValueError("categoria desconhecida: %s (use %s)" % (categoria, ", ".join(PALETAS)))

    if valor.startswith("#") and len(valor) == 7:
        int(valor[1:], 16)
        return categoria, valor.lower()

    paleta = PALETAS[categoria]
    if valor not in paleta:
        raise ValueError("cor desconhecida para %s: %s (use #rrggbb ou %s)"
                         % (categoria, valor, ", ".join(paleta)))

    return categoria, paleta[valor]
