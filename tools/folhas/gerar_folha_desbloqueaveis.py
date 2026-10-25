# Folha de desbloqueáveis
#
# Cada conquista com o item que ela libera no editor, já vestido no avatar
# padrão, com o nome, o item e a descrição da conquista, lidos dos dados do
# jogo. Duas colunas, em tamanho de folha ABNT.
#
# Uso:
#   python3 tools/folhas/gerar_folha_desbloqueaveis.py

import argparse
import os
import re
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.elenco import APARENCIA_PADRAO
from sprites.paleta import COR_DE_ROUPA
from sprites.personagem import montar_jogador
from folhas_comuns import (
    COR_DE_FUNDO,
    COR_DO_PALCO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    LARGURA_UTIL,
    ampliar,
    cm,
    dados_do_jogo,
    fonte_em_pt,
    medidas_impressas,
    quebrar_texto,
    salvar_abnt,
)

COR_DO_ITEM = (31, 111, 139)
COLUNAS = 2
ESCALA = 9
ESPACO_ENTRE_COLUNAS = cm(0.5)
ENTRE_LINHAS = cm(0.45)
RECUO_DO_TEXTO = cm(0.3)

# cinza para as estampas aparecerem; o meio a meio mostra as duas cores
SUPERIOR = COR_DE_ROUPA["cinza_azulado"]
INTERNA = COR_DE_ROUPA["laranja"]
SUPERIOR_POR_ITEM = {"meio_a_meio": COR_DE_ROUPA["azul_petroleo"]}


# pecaDeCima -> peca_de_cima
def campo_em_python(campo):
    return re.sub(r"([A-Z])", lambda achado: "_" + achado.group(1).lower(), campo)


def vestir(itens):
    aparencia = dict(APARENCIA_PADRAO, superior=SUPERIOR, interna=INTERNA)
    for item in itens:
        aparencia[campo_em_python(item["campo"])] = item["valor"]
        aparencia["superior"] = SUPERIOR_POR_ITEM.get(item["valor"], aparencia["superior"])
    return montar_jogador(aparencia, cadeira="po")


def desenhar_folha(conquistas):
    fonte_do_nome, fonte_do_item, fonte_da_descricao = fonte_em_pt(10, negrito=True), fonte_em_pt(9), fonte_em_pt(8)
    lado = 32 * ESCALA
    quadro = lado + cm(0.2)
    celula = (LARGURA_UTIL - ESPACO_ENTRE_COLUNAS) // COLUNAS
    largura_do_texto = celula - quadro - RECUO_DO_TEXTO
    linhas = (len(conquistas) + COLUNAS - 1) // COLUNAS
    folha = Image.new("RGB", (LARGURA_UTIL, linhas * (quadro + ENTRE_LINHAS) - ENTRE_LINHAS), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    for i, conquista in enumerate(conquistas):
        x = (i % COLUNAS) * (celula + ESPACO_ENTRE_COLUNAS)
        y = (i // COLUNAS) * (quadro + ENTRE_LINHAS)
        folha.paste(COR_DO_PALCO, (x, y, x + quadro, y + quadro))
        sprite = ampliar(vestir(conquista["itens"]), ESCALA)
        folha.paste(sprite, (x + (quadro - lado) // 2, y + (quadro - lado) // 2), sprite)

        texto_x, texto_y = x + quadro + RECUO_DO_TEXTO, y + cm(0.15)
        for linha in quebrar_texto(d, conquista["nome"], fonte_do_nome, largura_do_texto):
            d.text((texto_x, texto_y), linha, font=fonte_do_nome, fill=COR_DO_TEXTO)
            texto_y += round(fonte_do_nome.size * 1.25)
        texto_y += cm(0.05)
        itens = ", ".join(item["nome"] for item in conquista["itens"]) or "nenhum item"
        for linha in quebrar_texto(d, itens, fonte_do_item, largura_do_texto):
            d.text((texto_x, texto_y), linha, font=fonte_do_item, fill=COR_DO_ITEM)
            texto_y += round(fonte_do_item.size * 1.25)
        texto_y += cm(0.15)
        for linha in quebrar_texto(d, conquista["descricao"], fonte_da_descricao, largura_do_texto):
            d.text((texto_x, texto_y), linha, font=fonte_da_descricao, fill=COR_DO_TEXTO_SECUNDARIO)
            texto_y += round(fonte_da_descricao.size * 1.3)
    return folha


def main():
    parser = argparse.ArgumentParser(description="Gera a folha com o item que cada conquista libera")
    parser.add_argument("--saida", default="desbloqueaveis.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    folha = desenhar_folha(dados_do_jogo()["conquistas"])
    print("folha de desbloqueáveis em %s (%s)" % (salvar_abnt(folha, argumentos.saida), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
