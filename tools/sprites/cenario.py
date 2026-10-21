# Piso, parede e móveis

from PIL import Image, ImageDraw

from .medidas import r
from .paleta import (
    COR_DA_JUNTA_DO_PISO,
    COR_DA_MOLDURA_DO_QUADRO,
    COR_DA_PAREDE,
    COR_DA_PERNA_DA_MESA,
    COR_DA_SOMBRA_DO_TAMPO,
    COR_DA_TELA,
    COR_DO_BRILHO_DO_TAMPO,
    COR_DO_FRISO_DA_PAREDE,
    COR_DO_FUNDO_DO_QUADRO,
    COR_DO_MONITOR,
    COR_DO_PISO,
    COR_DO_RODAPE,
    COR_DO_TAMPO,
    CORES_DOS_CARTOES,
    TRANSPARENTE,
)


def tile_piso():
    img = Image.new("RGBA", (32, 32), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 32, 32, COR_DO_PISO)
    r(d, 0, 0, 32, 1, COR_DA_JUNTA_DO_PISO)
    r(d, 0, 0, 1, 32, COR_DA_JUNTA_DO_PISO)
    return img


def tile_parede():
    img = Image.new("RGBA", (32, 32), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 32, 32, COR_DA_PAREDE)
    r(d, 0, 30, 32, 2, COR_DO_RODAPE)
    r(d, 0, 14, 32, 1, COR_DO_FRISO_DA_PAREDE)
    return img


def sprite_mesa():
    img = Image.new("RGBA", (48, 40), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 15, 0, 18, 13, COR_DO_MONITOR)
    r(d, 17, 2, 14, 9, COR_DA_TELA)
    r(d, 22, 13, 4, 3, COR_DO_MONITOR)
    r(d, 2, 16, 44, 8, COR_DO_TAMPO)
    r(d, 2, 16, 44, 2, COR_DO_BRILHO_DO_TAMPO)
    r(d, 2, 22, 44, 2, COR_DA_SOMBRA_DO_TAMPO)
    r(d, 6, 24, 4, 14, COR_DA_PERNA_DA_MESA)
    r(d, 38, 24, 4, 14, COR_DA_PERNA_DA_MESA)
    return img


def sprite_quadro():
    img = Image.new("RGBA", (48, 32), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 48, 32, COR_DA_MOLDURA_DO_QUADRO)
    r(d, 2, 2, 44, 28, COR_DO_FUNDO_DO_QUADRO)
    for i, cor in enumerate(CORES_DOS_CARTOES):
        r(d, 6 + i * 13, 8, 9, 5, cor)
    return img


# calendário da parede: abre a agenda da sprint
def sprite_agenda():
    img = Image.new("RGBA", (32, 36), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 32, 36, COR_DA_MOLDURA_DO_QUADRO)
    r(d, 2, 2, 28, 32, COR_DO_FUNDO_DO_QUADRO)
    r(d, 2, 2, 28, 7, COR_DA_MOLDURA_DO_QUADRO)
    for linha in range(3):
        for coluna in range(4):
            cor = CORES_DOS_CARTOES[(linha + coluna) % len(CORES_DOS_CARTOES)]
            marcado = (linha * 4 + coluna) % 5 == 0
            r(d, 5 + coluna * 6, 12 + linha * 7, 4, 4,
              cor if marcado else COR_DO_FRISO_DA_PAREDE)
    return img


# mesa da sala de reunião: elipse vista de frente, com tampo e base
def sprite_mesa_redonda():
    largura = 132
    altura = 68
    img = Image.new("RGBA", (largura, altura), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    meio = largura // 2

    d.ellipse([0, 14, largura - 1, 52], fill=COR_DA_SOMBRA_DO_TAMPO)
    d.ellipse([0, 8, largura - 1, 44], fill=COR_DO_TAMPO)
    d.ellipse([14, 14, largura - 15, 38], fill=COR_DO_BRILHO_DO_TAMPO)

    r(d, meio - 9, 44, 18, 15, COR_DA_PERNA_DA_MESA)
    r(d, meio - 24, 58, 48, 7, COR_DA_SOMBRA_DO_TAMPO)
    return img


# nome do arquivo -> função que desenha
CENARIO = {
    "chao": tile_piso,
    "parede": tile_parede,
    "mesa": sprite_mesa,
    "quadro_parede": sprite_quadro,
    "agenda_parede": sprite_agenda,
    "mesa_redonda": sprite_mesa_redonda,
}
