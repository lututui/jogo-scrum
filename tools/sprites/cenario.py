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
    COR_DA_AREIA,
    COR_DA_BORDA_DO_VASO,
    COR_DA_FOLHA,
    COR_DA_FOLHA_ESCURA,
    COR_DA_LINHA_DO_PAPEL,
    COR_DA_LOMBADA,
    COR_DA_MACANETA,
    COR_DA_MADEIRA,
    COR_DA_MADEIRA_CLARA,
    COR_DA_MADEIRA_ESCURA,
    COR_DA_MOCHILA,
    COR_DA_NUVEM,
    COR_DA_PORTA,
    COR_DA_TELA_DO_TABLET,
    COR_DO_BRILHO_DO_TROFEU,
    COR_DO_CAFE,
    COR_DO_ESTOFADO,
    COR_DO_ESTOFADO_ESCURO,
    COR_DO_LIVRO,
    COR_DO_METAL,
    COR_DO_METAL_ESCURO,
    COR_DO_PAPEL,
    COR_DO_POST_IT,
    COR_DO_TROFEU,
    COR_DO_VASO,
    COR_DO_VIDRO,
    CONTORNO,
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


# mesa de quem trabalha no escritório: de madeira, como a do dono, larga o
# bastante para os objetos de cada pessoa ao lado do monitor, e com a CPU
# embaixo do tampo
def sprite_mesa():
    img = Image.new("RGBA", (72, 40), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 27, 0, 18, 13, COR_DO_MONITOR)
    r(d, 29, 2, 14, 9, COR_DA_TELA)
    r(d, 34, 13, 4, 3, COR_DO_MONITOR)
    r(d, 2, 16, 68, 8, COR_DA_MADEIRA)
    r(d, 2, 16, 68, 2, COR_DA_MADEIRA_CLARA)
    r(d, 2, 22, 68, 2, COR_DA_MADEIRA_ESCURA)
    r(d, 6, 24, 4, 14, COR_DA_MADEIRA_ESCURA)
    r(d, 62, 24, 4, 14, COR_DA_MADEIRA_ESCURA)
    # CPU
    r(d, 49, 26, 10, 13, COR_DO_MONITOR)
    r(d, 50, 27, 8, 1, COR_DO_METAL_ESCURO)
    r(d, 50, 30, 8, 1, COR_DO_METAL_ESCURO)
    r(d, 56, 35, 2, 2, COR_DA_TELA)
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


# quadro do time na parede do escritório: o mesmo estilo do quadro pequeno,
# com as quatro colunas
def sprite_quadro_grande():
    img = Image.new("RGBA", (96, 40), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 96, 40, COR_DA_MOLDURA_DO_QUADRO)
    r(d, 2, 2, 92, 36, COR_DO_FUNDO_DO_QUADRO)
    for coluna in range(4):
        x = 4 + coluna * 23
        r(d, x, 4, 20, 2, COR_DO_FRISO_DA_PAREDE)
        for linha in range(3 - coluna % 2):
            cor = CORES_DOS_CARTOES[(coluna + linha) % len(CORES_DOS_CARTOES)]
            r(d, x + 2, 9 + linha * 9, 16, 6, cor)
        if coluna < 3:
            r(d, x + 21, 4, 1, 32, COR_DO_FRISO_DA_PAREDE)
    return img


def sprite_porta():
    img = Image.new("RGBA", (36, 52), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 36, 52, COR_DA_MOLDURA_DO_QUADRO)
    r(d, 3, 3, 30, 49, COR_DA_PORTA)
    r(d, 7, 8, 22, 16, COR_DO_FRISO_DA_PAREDE)
    r(d, 7, 28, 22, 18, COR_DO_FRISO_DA_PAREDE)
    r(d, 27, 27, 3, 3, COR_DA_MACANETA)
    return img


def sprite_janela():
    img = Image.new("RGBA", (56, 36), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 56, 36, COR_DA_MOLDURA_DO_QUADRO)
    r(d, 3, 3, 50, 30, COR_DO_VIDRO)
    r(d, 8, 22, 14, 6, COR_DA_NUVEM)
    r(d, 34, 10, 10, 4, COR_DA_NUVEM)
    r(d, 27, 3, 2, 30, COR_DA_MOLDURA_DO_QUADRO)
    r(d, 3, 17, 50, 2, COR_DA_MOLDURA_DO_QUADRO)
    return img


def sprite_relogio():
    img = Image.new("RGBA", (14, 14), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, 13, 13], fill=CONTORNO)
    d.ellipse([2, 2, 11, 11], fill=COR_DO_PAPEL)
    r(d, 6, 3, 1, 4, CONTORNO)
    r(d, 7, 6, 3, 1, CONTORNO)
    return img


def sprite_planta_grande():
    img = Image.new("RGBA", (20, 30), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    for x, y, w, h in [(4, 2, 5, 9), (11, 0, 5, 10), (7, 5, 6, 10), (2, 10, 6, 6), (12, 9, 6, 7)]:
        r(d, x, y, w, h, COR_DA_FOLHA)
    r(d, 9, 3, 2, 14, COR_DA_FOLHA_ESCURA)
    r(d, 4, 18, 12, 12, COR_DO_VASO)
    r(d, 4, 18, 12, 2, COR_DA_BORDA_DO_VASO)
    return img


def sprite_planta_pequena():
    img = Image.new("RGBA", (10, 12), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 2, 0, 3, 5, COR_DA_FOLHA)
    r(d, 5, 1, 3, 4, COR_DA_FOLHA_ESCURA)
    r(d, 2, 5, 6, 7, COR_DO_VASO)
    r(d, 2, 5, 6, 1, COR_DA_BORDA_DO_VASO)
    return img


def sprite_bebedouro():
    img = Image.new("RGBA", (12, 30), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 2, 0, 8, 10, COR_DO_VIDRO)
    r(d, 0, 10, 12, 20, COR_DO_METAL)
    r(d, 0, 10, 12, 2, COR_DO_METAL_ESCURO)
    r(d, 4, 14, 4, 2, COR_DO_POST_IT[2])
    return img


def sprite_poltrona():
    img = Image.new("RGBA", (18, 16), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 2, 0, 14, 8, COR_DO_ESTOFADO_ESCURO)
    r(d, 0, 6, 18, 6, COR_DO_ESTOFADO)
    r(d, 0, 4, 3, 9, COR_DO_ESTOFADO_ESCURO)
    r(d, 15, 4, 3, 9, COR_DO_ESTOFADO_ESCURO)
    r(d, 2, 12, 2, 4, COR_DA_MADEIRA_ESCURA)
    r(d, 14, 12, 2, 4, COR_DA_MADEIRA_ESCURA)
    return img


def sprite_mesinha():
    img = Image.new("RGBA", (20, 10), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 2, 20, 3, COR_DA_MADEIRA)
    r(d, 2, 5, 2, 5, COR_DA_MADEIRA_ESCURA)
    r(d, 16, 5, 2, 5, COR_DA_MADEIRA_ESCURA)
    r(d, 3, 0, 6, 2, COR_DO_POST_IT[1])
    r(d, 10, 0, 6, 2, COR_DO_POST_IT[2])
    return img


# mesa do dono: madeira, maior, com o contrato, o troféu e um porta-retrato
def sprite_mesa_do_dono():
    img = Image.new("RGBA", (64, 40), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 2, 14, 60, 10, COR_DA_MADEIRA)
    r(d, 2, 14, 60, 2, COR_DA_MADEIRA_CLARA)
    r(d, 2, 22, 60, 2, COR_DA_MADEIRA_ESCURA)
    r(d, 4, 24, 8, 14, COR_DA_MADEIRA_ESCURA)
    r(d, 52, 24, 8, 14, COR_DA_MADEIRA_ESCURA)
    r(d, 40, 4, 8, 10, COR_DA_MADEIRA_ESCURA)
    r(d, 41, 5, 6, 7, COR_DO_VIDRO)
    r(d, 12, 8, 14, 6, COR_DO_PAPEL)
    r(d, 14, 10, 10, 1, COR_DA_LINHA_DO_PAPEL)
    r(d, 30, 0, 4, 14, COR_DO_TROFEU)
    r(d, 29, 0, 6, 3, COR_DO_BRILHO_DO_TROFEU)
    return img


# objetos de mesa, um por pessoa, tirados do que cada uma diz no escritório

def sprite_papeis():  # Márcia: a folha dos quatorze pedidos, com post-its
    img = Image.new("RGBA", (14, 8), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 2, 10, 6, COR_DO_PAPEL)
    r(d, 2, 0, 10, 6, COR_DO_PAPEL)
    for linha in range(3):
        r(d, 3, 1 + linha * 2, 7, 1, COR_DA_LINHA_DO_PAPEL)
    r(d, 10, 0, 4, 3, COR_DO_POST_IT[0])
    r(d, 11, 4, 3, 3, COR_DO_POST_IT[1])
    return img


def sprite_ampulheta():  # Renan: os quinze minutos da Daily
    img = Image.new("RGBA", (7, 10), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 7, 1, COR_DA_MADEIRA)
    r(d, 0, 9, 7, 1, COR_DA_MADEIRA)
    r(d, 1, 1, 5, 2, COR_DO_METAL)
    r(d, 2, 3, 3, 2, COR_DO_METAL)
    r(d, 3, 5, 1, 1, COR_DA_AREIA)
    r(d, 2, 6, 3, 1, COR_DO_METAL)
    r(d, 1, 7, 5, 2, COR_DA_AREIA)
    return img


def sprite_monitor_e_livro():  # Bia: segundo monitor e um livro grosso
    img = Image.new("RGBA", (22, 13), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 0, 0, 12, 9, COR_DO_MONITOR)
    r(d, 1, 1, 10, 7, COR_DA_TELA)
    r(d, 5, 9, 2, 4, COR_DO_MONITOR)
    r(d, 14, 5, 8, 8, COR_DO_LIVRO)
    r(d, 14, 5, 8, 2, COR_DA_LOMBADA)
    r(d, 15, 7, 6, 1, COR_DO_PAPEL)
    return img


# Caio: café e as quatro coisas abertas, coladas na borda do monitor; a
# coluna da esquerda cai sobre a borda direita do monitor da mesa
def sprite_cafe_e_post_its():
    img = Image.new("RGBA", (22, 18), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    for i in range(4):
        r(d, 0, 1 + i * 3, 3, 3, COR_DO_POST_IT[i % 3])
    r(d, 10, 13, 5, 5, COR_DO_PAPEL)
    r(d, 15, 14, 2, 2, COR_DO_PAPEL)
    r(d, 11, 13, 3, 1, COR_DO_CAFE)
    return img


def sprite_mochila_e_tablet():  # Lu: a mochila de quem divide o tempo
    img = Image.new("RGBA", (22, 12), TRANSPARENTE)
    d = ImageDraw.Draw(img)
    r(d, 1, 2, 8, 1, COR_DA_MOCHILA)
    r(d, 0, 3, 10, 9, COR_DA_MOCHILA)
    r(d, 1, 7, 8, 4, COR_DO_METAL_ESCURO)
    r(d, 3, 4, 4, 2, COR_DO_POST_IT[0])
    r(d, 12, 5, 9, 7, COR_DO_METAL_ESCURO)
    r(d, 13, 6, 7, 5, COR_DA_TELA_DO_TABLET)
    return img


# nome do arquivo -> função que desenha
CENARIO = {
    "chao": tile_piso,
    "parede": tile_parede,
    "mesa": sprite_mesa,
    "quadro_parede": sprite_quadro,
    "agenda_parede": sprite_agenda,
    "mesa_redonda": sprite_mesa_redonda,
    "quadro_grande": sprite_quadro_grande,
    "porta": sprite_porta,
    "janela": sprite_janela,
    "relogio": sprite_relogio,
    "planta_grande": sprite_planta_grande,
    "planta_pequena": sprite_planta_pequena,
    "bebedouro": sprite_bebedouro,
    "poltrona": sprite_poltrona,
    "mesinha": sprite_mesinha,
    "mesa_do_dono": sprite_mesa_do_dono,
    "mesa_papeis": sprite_papeis,
    "mesa_ampulheta": sprite_ampulheta,
    "mesa_monitor_e_livro": sprite_monitor_e_livro,
    "mesa_cafe_e_post_its": sprite_cafe_e_post_its,
    "mesa_mochila_e_tablet": sprite_mochila_e_tablet,
}
