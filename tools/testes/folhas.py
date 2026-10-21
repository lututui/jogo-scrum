# Leitura e recoloração das folhas de camada

import os

from PIL import Image

from sprites.camadas import MARCADOR, folhas_de_camada
from sprites.medidas import ALTURA_SPRITE, LARGURA_SPRITE


def para_rgba(cor):
    return Image.new("RGBA", (1, 1), cor).getpixel((0, 0))


MARCADOR_RGBA = para_rgba(MARCADOR)


def carregar_folhas(pasta):
    folhas = {}
    for nome in folhas_de_camada():
        folhas[nome] = Image.open(os.path.join(pasta, nome + ".png")).convert("RGBA")
    return folhas


# troca só os pixels exatamente magenta
def recolorir(imagem, cor):
    nova = imagem.copy()
    pixels = nova.load()
    destino = para_rgba(cor)
    for y in range(nova.height):
        for x in range(nova.width):
            if pixels[x, y] == MARCADOR_RGBA:
                pixels[x, y] = destino
    return nova


def quadro(folha, frame):
    x = frame * LARGURA_SPRITE
    return folha.crop((x, 0, x + LARGURA_SPRITE, ALTURA_SPRITE))


# põe o quadro da folha, já recolorido, por cima da base
def empilhar(base, folha, frame, cor):
    base.alpha_composite(recolorir(quadro(folha, frame), cor))
