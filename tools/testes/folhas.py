# Leitura e recoloração das folhas de camada

import os

from PIL import Image

from sprites.camadas import MARCADORES, folhas_de_camada
from sprites.medidas import ALTURA_SPRITE, LARGURA_SPRITE


def para_rgba(cor):
    return Image.new("RGBA", (1, 1), cor).getpixel((0, 0))


MARCADORES_RGBA = [para_rgba(marcador) for marcador in MARCADORES]


def carregar_folhas(pasta):
    folhas = {}
    for nome in folhas_de_camada():
        folhas[nome] = Image.open(os.path.join(pasta, nome + ".png")).convert("RGBA")
    return folhas


# troca só os pixels exatamente no marcador; a primeira cor vai para o
# primeiro marcador, a segunda para o segundo
def recolorir(imagem, cores):
    trocas = {MARCADORES_RGBA[i]: para_rgba(cor) for i, cor in enumerate(cores)}
    nova = imagem.copy()
    pixels = nova.load()
    for y in range(nova.height):
        for x in range(nova.width):
            if pixels[x, y] in trocas:
                pixels[x, y] = trocas[pixels[x, y]]
    return nova


def quadro(folha, frame):
    x = frame * LARGURA_SPRITE
    return folha.crop((x, 0, x + LARGURA_SPRITE, ALTURA_SPRITE))


# põe o quadro da folha, já recolorido, por cima da base
def empilhar(base, folha, frame, *cores):
    base.alpha_composite(recolorir(quadro(folha, frame), cores))
