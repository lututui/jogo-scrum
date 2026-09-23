# Gerador de sprites do protótipo
#
# Saída: assets/*.png

import os
from PIL import Image, ImageDraw

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_ASSETS = os.path.join(RAIZ, "assets")

# ------------------------------------------------------------------
# paleta

TRANSPARENTE = (0, 0, 0, 0)

CONTORNO = "#2b3348"
COR_DA_ARMACAO = "#7b88a5"
COR_DA_LENTE = "#eef4fb"

TOM_DE_PELE = {
    "clara": "#f1d3bb",
    "media": "#dcab85",
    "parda": "#b07a50",
    "escura": "#7d4f31",
}

COR_DE_CABELO = {
    "preto": "#171320",
    "castanho": "#5d3a20",
    "castanho_claro": "#8f5c2c",
    "grisalho": "#b6b3ac",
    "loiro": "#d9bb6e",
    "verde_agua": "#49c9bb",
}

COR_DE_ROUPA = {
    "vermelho": "#c0392b",
    "azul_petroleo": "#1f6f8b",
    "roxo": "#7a4bb5",
    "laranja": "#e08a3c",
    "cinza_claro": "#aab4c4",
    "cinza_azulado": "#6b7a90",
    "bege": "#c9a96a",
    "verde_escuro": "#3f7a52",
    "lilas": "#a87fc4",
    "branco": "#f4f6fa",
}

COR_DE_CALCA = "#39465c"
COR_DE_SAPATO = "#20283a"
COR_DO_OBJETO_NA_MAO = "#f5f1e4"
COR_DA_CAPA_DO_OBJETO = "#8a5f3c"
COR_DA_LINHA_DO_OBJETO = "#8f9cb3"
COR_DA_PASTA = "#c79a5b"
COR_DA_ABA_DA_PASTA = "#e3c08a"
COR_DO_FONE = "#37425e"
COR_DA_ALMOFADA_DO_FONE = "#96a3bb"

COR_DA_SOBRANCELHA_CLARA = "#e8edf5"
LIMIAR_DE_CONTRASTE = 45

# crachá do avatar: mesma cor do mentor de cada cadeira
COR_DE_CRACHA = {
    "po": COR_DE_ROUPA["vermelho"],
    "sm": COR_DE_ROUPA["azul_petroleo"],
    "dev": COR_DE_ROUPA["roxo"],
}

COR_DO_PISO = "#e7ebf4"
COR_DA_JUNTA_DO_PISO = "#dbe1ee"
COR_DA_PAREDE = "#c3cee4"
COR_DO_RODAPE = "#9fb0cf"
COR_DO_FRISO_DA_PAREDE = "#b2c0da"

COR_DO_TAMPO = "#8fa8cf"
COR_DO_BRILHO_DO_TAMPO = "#a8bcdc"
COR_DA_SOMBRA_DO_TAMPO = "#6d87b3"
COR_DA_PERNA_DA_MESA = "#6d87b3"
COR_DO_MONITOR = "#4c6a94"
COR_DA_TELA = "#63d29b"

COR_DA_MOLDURA_DO_QUADRO = "#5f7ba8"
COR_DO_FUNDO_DO_QUADRO = "#fbfcfe"
CORES_DOS_CARTOES = [
    COR_DE_ROUPA["vermelho"],
    COR_DE_ROUPA["laranja"],
    COR_DE_ROUPA["verde_escuro"],
]

# ------------------------------------------------------------------
# elenco

# cada personagem é uma combinação: cabelo, cor do cabelo, roupa, acessório, pele
ELENCO = {
    "marcia": ("franja_reta", "preto", "vermelho", "oculos", "clara"),
    "renan": ("raspado", "preto", "azul_petroleo", "caderno", "escura"),
    "bia": ("coque_alto", "castanho", "roxo", "oculos", "parda"),
    "caio": ("topete", "castanho_claro", "laranja", "fone", "clara"),
    "lu": ("curto_liso", "verde_agua", "cinza_claro", None, "media"),
    "gustavo": ("curto_liso", "grisalho", "cinza_azulado", None, "clara"),
    "estela": ("coque_baixo", "grisalho", "bege", "pasta", "escura"),
    "helio": ("curto_liso", "castanho", "verde_escuro", "provas", "parda"),
    "sandra": ("rabo_cavalo", "loiro", "lilas", "oculos", "clara"),
}

AVATAR_DO_JOGADOR = ("curto_liso", "castanho", "branco", None, "media")

# as três expressões de retrato, na ordem em que entram nas folhas de sprite
EXPRESSOES = ("neutro", "tenso", "aprovacao")

# ------------------------------------------------------------------
# medidas

LARGURA_SPRITE = 32
ALTURA_SPRITE = 32
CABECA_X = 11
CABECA_Y = 5
LARGURA_RETRATO = 72
ALTURA_RETRATO = 96
RECORTE_RETRATO = (7, 0, 25, 24)


def r(d, x, y, w, h, cor):
    if w <= 0 or h <= 0:
        return
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=cor)


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
    # curto_liso usa apenas a touca base


def desenhar_oculos(d):
    # armacao desenhada antes da expressao
    # as lentes ficam como fundo claro e os olhos aparecem por cima
    for x in (12, 17):
        r(d, x, 10, 4, 2, COR_DA_LENTE)
        r(d, x, 9, 4, 1, COR_DA_ARMACAO)
        r(d, x, 10, 1, 2, COR_DA_ARMACAO)
        r(d, x + 3, 10, 1, 2, COR_DA_ARMACAO)
    r(d, 16, 9, 1, 1, COR_DA_ARMACAO)


def luminancia(cor):
    vermelho = int(cor[1:3], 16)
    verde = int(cor[3:5], 16)
    azul = int(cor[5:7], 16)
    return 0.299 * vermelho + 0.587 * verde + 0.114 * azul


LINHA_DA_SOBRANCELHA = 8
COLUNA_DE_AMOSTRA_DA_SOBRANCELHA = 13


def para_hexadecimal(pixel):
    return "#%02x%02x%02x" % pixel[:3]


def fundo_da_sobrancelha(img, cor_da_pele):
    # mede o que ja foi desenhado onde a sobrancelha vai cair
    pixel = img.getpixel((COLUNA_DE_AMOSTRA_DA_SOBRANCELHA, LINHA_DA_SOBRANCELHA))
    if pixel[3] == 0:
        return cor_da_pele
    return para_hexadecimal(pixel)


def cor_da_sobrancelha(cor_do_cabelo, cor_de_fundo):
    # a cor do cabelo vem primeiro por ser a mais natural
    for candidata in (cor_do_cabelo, CONTORNO):
        if abs(luminancia(candidata) - luminancia(cor_de_fundo)) >= LIMIAR_DE_CONTRASTE:
            return candidata

    return COR_DA_SOBRANCELHA_CLARA


def desenhar_expressao(d, expressao, cor_do_cabelo, cor_de_fundo):
    for x in (13, 18):
        if expressao == "neutro":
            r(d, x, 10, 1, 2, CONTORNO)
        elif expressao == "tenso":
            r(d, x, 10, 2, 1, CONTORNO)
        elif expressao == "aprovacao":
            r(d, x, 11, 2, 1, CONTORNO)

    cor = cor_da_sobrancelha(cor_do_cabelo, cor_de_fundo)
    base = LINHA_DA_SOBRANCELHA

    if expressao == "tenso":
        r(d, 12, base, 3, 1, cor)
        r(d, 17, base, 3, 1, cor)
    elif expressao == "aprovacao":
        # sobrancelha arqueada: ponta na fileira de cima, extremidades embaixo
        for centro in (13, 18):
            r(d, centro - 1, base, 1, 1, cor)
            r(d, centro, base - 1, 1, 1, cor)
            r(d, centro + 1, base, 1, 1, cor)


def desenhar_fone(d):
    r(d, 11, 3, 10, 1, COR_DO_FONE)
    r(d, 10, 4, 1, 4, COR_DO_FONE)
    r(d, 21, 4, 1, 4, COR_DO_FONE)
    for x in (9, 21):
        r(d, x, 8, 2, 4, COR_DO_FONE)
    r(d, 10, 9, 1, 2, COR_DA_ALMOFADA_DO_FONE)
    r(d, 21, 9, 1, 2, COR_DA_ALMOFADA_DO_FONE)


def desenhar_caderno(d):
    # objeto encostado no braço
    r(d, 24, 18, 5, 6, CONTORNO)
    r(d, 25, 19, 3, 4, COR_DO_OBJETO_NA_MAO)
    r(d, 24, 19, 1, 4, COR_DA_CAPA_DO_OBJETO)
    r(d, 25, 20, 3, 1, COR_DA_LINHA_DO_OBJETO)
    r(d, 25, 22, 2, 1, COR_DA_LINHA_DO_OBJETO)


def desenhar_provas(d):
    # folhas soltas e desalinhadas
    r(d, 25, 17, 4, 5, CONTORNO)
    r(d, 26, 18, 2, 3, COR_DO_OBJETO_NA_MAO)
    r(d, 24, 19, 4, 5, CONTORNO)
    r(d, 25, 20, 2, 3, COR_DO_OBJETO_NA_MAO)
    r(d, 25, 21, 2, 1, COR_DA_LINHA_DO_OBJETO)


def desenhar_pasta(d):
    # superfície fechada e opaca, com aba
    r(d, 24, 18, 5, 6, CONTORNO)
    r(d, 25, 19, 3, 4, COR_DA_PASTA)
    r(d, 25, 19, 3, 1, COR_DA_ABA_DA_PASTA)
    r(d, 26, 21, 2, 1, COR_DA_ABA_DA_PASTA)


def desenhar_acessorio(d, acessorio):
    if acessorio == "fone":
        desenhar_fone(d)
    elif acessorio == "caderno":
        desenhar_caderno(d)
    elif acessorio == "provas":
        desenhar_provas(d)
    elif acessorio == "pasta":
        desenhar_pasta(d)

def desenhar_cracha(d, cadeira):
    r(d, 13, 15, 1, 1, CONTORNO)
    r(d, 18, 15, 1, 1, CONTORNO)
    r(d, 13, 16, 6, 6, CONTORNO)
    r(d, 14, 17, 4, 4, COR_DE_CRACHA[cadeira])
    r(d, 14, 17, 4, 1, COR_DO_OBJETO_NA_MAO)


def montar(spec, frame=0, expressao="neutro", cadeira=None):
    tipo_cabelo, nome_cabelo, nome_roupa, acessorio, nome_pele = spec
    pele = TOM_DE_PELE[nome_pele]
    cabelo = COR_DE_CABELO[nome_cabelo]
    roupa = COR_DE_ROUPA[nome_roupa]

    img = Image.new("RGBA", (LARGURA_SPRITE, ALTURA_SPRITE), TRANSPARENTE)
    d = ImageDraw.Draw(img)

    passo_a = 1 if frame == 1 else 0
    passo_b = 1 if frame == 2 else 0

    # pernas e sapatos
    r(d, 12, 24 + passo_a, 4, 5 - passo_a, COR_DE_CALCA)
    r(d, 16, 24 + passo_b, 4, 5 - passo_b, COR_DE_CALCA)
    r(d, 12, 29, 4, 2, COR_DE_SAPATO)
    r(d, 16, 29, 4, 2, COR_DE_SAPATO)

    # tronco, braços e pescoço
    r(d, 10, 15, 12, 9, roupa)
    r(d, 8, 15, 2, 4, roupa)
    r(d, 22, 15, 2, 4, roupa)
    r(d, 8, 19 + passo_b, 2, 4, pele)
    r(d, 22, 19 + passo_a, 2, 4, pele)
    r(d, 14, 13, 4, 2, pele)

    # cabeça
    r(d, CABECA_X, CABECA_Y, 10, 9, pele)
    desenhar_cabelo(d, tipo_cabelo, cabelo)
    # a lente entra como fundo e os olhos ficam por cima
    if acessorio == "oculos":
        desenhar_oculos(d)
    fundo = fundo_da_sobrancelha(img, pele)
    desenhar_expressao(d, expressao, cabelo, fundo)
    if acessorio:
        desenhar_acessorio(d, acessorio)
    if cadeira:
        desenhar_cracha(d, cadeira)
    return img


def folha_corpo(spec, cadeira=None):
    # três quadros lado a lado: parado, passo A, passo B
    folha = Image.new("RGBA", (LARGURA_SPRITE * 3, ALTURA_SPRITE), TRANSPARENTE)
    for i in range(3):
        folha.paste(montar(spec, frame=i, cadeira=cadeira), (i * LARGURA_SPRITE, 0))
    return folha


def folha_retrato(spec, cadeira=None):
    # a própria cabeça do sprite ampliada 4x, em três expressões
    folha = Image.new("RGBA", (LARGURA_RETRATO * 3, ALTURA_RETRATO), TRANSPARENTE)
    for i, expressao in enumerate(EXPRESSOES):
        corpo = montar(spec, frame=0, expressao=expressao, cadeira=cadeira)
        cabeca = corpo.crop(RECORTE_RETRATO)
        cabeca = cabeca.resize((LARGURA_RETRATO, ALTURA_RETRATO), Image.NEAREST)
        folha.paste(cabeca, (i * LARGURA_RETRATO, 0))
    return folha


# ----------------------------------------------------------------
# cenário

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


def sprite_agenda():
    # calendário da parede: abre a agenda da sprint, com os eventos do Scrum
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


# ------------------------------------------------------------------
# saída

def main():
    os.makedirs(DIR_ASSETS, exist_ok=True)
    imagens = {}

    for nome, spec in ELENCO.items():
        imagens["corpo_" + nome] = folha_corpo(spec)
        imagens["retrato_" + nome] = folha_retrato(spec)

    for cadeira in COR_DE_CRACHA:
        imagens["corpo_jogador_" + cadeira] = folha_corpo(AVATAR_DO_JOGADOR, cadeira=cadeira)
        imagens["retrato_jogador_" + cadeira] = folha_retrato(AVATAR_DO_JOGADOR, cadeira=cadeira)

    imagens["chao"] = tile_piso()
    imagens["parede"] = tile_parede()
    imagens["mesa"] = sprite_mesa()
    imagens["quadro_parede"] = sprite_quadro()
    imagens["agenda_parede"] = sprite_agenda()

    for nome, img in sorted(imagens.items()):
        img.save(os.path.join(DIR_ASSETS, nome + ".png"))

    print("%d imagens geradas em %s" % (len(imagens), DIR_ASSETS))


if __name__ == "__main__":
    main()
