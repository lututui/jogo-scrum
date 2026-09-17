# Folha de expressões
#
# Gera uma imagem única comparando as três expressões de retrato em alguns
# personagens.
#
# O recorte é o mesmo que a caixa de diálogo usa
#
# Uso:
#   python3 tools/gerar_folha_expressoes.py
#   python3 tools/gerar_folha_expressoes.py --personagens marcia sandra lu --escala 7

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import gerar_sprites as sprites
from folhas_comuns import (
    COR_DA_LINHA_GUIA,
    COR_DE_FUNDO,
    COR_DO_PALCO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    ampliar,
    carregar_fonte,
    descrever,
    escrever_centralizado,
    largura_do_texto,
    nomes_do_elenco,
    rotular_expressao,
    salvar,
)

PERSONAGENS_PADRAO = ["marcia", "bia", "caio"]

MARGEM = 24
LARGURA_DA_COLUNA_DE_NOMES = 150
ESPACO_ENTRE_CELULAS = 12
ALTURA_DO_CABECALHO = 26


def recortar_cabeca(receita, expressao, escala):
    corpo = sprites.montar(receita, frame=0, expressao=expressao)
    return ampliar(corpo.crop(sprites.RECORTE_RETRATO), escala)


def desenhar_folha(chaves, escala, titulo):
    catalogo = nomes_do_elenco()
    fonte_nome = carregar_fonte(15)
    fonte_papel = carregar_fonte(12)
    fonte_cabecalho = carregar_fonte(13)
    fonte_titulo = carregar_fonte(17)

    amostra = recortar_cabeca(sprites.ELENCO[chaves[0]], sprites.EXPRESSOES[0], escala)
    largura_da_celula = amostra.width + ESPACO_ENTRE_CELULAS
    altura_da_celula = amostra.height + ESPACO_ENTRE_CELULAS

    topo = MARGEM + (30 if titulo else 0) + ALTURA_DO_CABECALHO
    largura = MARGEM * 2 + LARGURA_DA_COLUNA_DE_NOMES + largura_da_celula * len(sprites.EXPRESSOES)
    altura = topo + altura_da_celula * len(chaves) + MARGEM

    folha = Image.new("RGB", (largura, altura), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    if titulo:
        d.text((MARGEM, MARGEM - 6), titulo, font=fonte_titulo, fill=COR_DO_TEXTO)

    origem_x = MARGEM + LARGURA_DA_COLUNA_DE_NOMES

    for coluna, expressao in enumerate(sprites.EXPRESSOES):
        centro = origem_x + coluna * largura_da_celula + largura_da_celula / 2
        escrever_centralizado(
            d, centro, topo - ALTURA_DO_CABECALHO + 4, rotular_expressao(expressao),
            fonte_cabecalho, COR_DO_TEXTO
        )

    for linha, chave in enumerate(chaves):
        receita = sprites.ELENCO[chave]
        nome, papel = descrever(chave, catalogo)
        y = topo + linha * altura_da_celula

        d.line([MARGEM, y, largura - MARGEM, y], fill=COR_DA_LINHA_GUIA)
        d.text((MARGEM, y + altura_da_celula / 2 - 18), nome, font=fonte_nome, fill=COR_DO_TEXTO)
        if papel:
            d.text(
                (MARGEM, y + altura_da_celula / 2 + 2),
                papel,
                font=fonte_papel,
                fill=COR_DO_TEXTO_SECUNDARIO,
            )

        for coluna, expressao in enumerate(sprites.EXPRESSOES):
            cabeca = recortar_cabeca(receita, expressao, escala)
            x = origem_x + coluna * largura_da_celula + ESPACO_ENTRE_CELULAS / 2
            destino = (int(x), int(y + ESPACO_ENTRE_CELULAS / 2))
            # fundo do palco: os sprites claros sumiriam no branco da folha
            d.rectangle(
                [destino[0], destino[1], destino[0] + cabeca.width, destino[1] + cabeca.height],
                fill=COR_DO_PALCO,
            )
            folha.paste(cabeca, destino, cabeca)

    return folha


def main():
    parser = argparse.ArgumentParser(description="Compara as expressões de retrato numa única imagem")
    parser.add_argument(
        "--personagens",
        nargs="+",
        default=PERSONAGENS_PADRAO,
        help="chaves do elenco, na ordem das linhas",
    )
    parser.add_argument("--escala", type=int, default=6, help="ampliação de cada retrato")
    parser.add_argument("--saida", default="expressoes.png", help="nome do arquivo em figuras/")
    parser.add_argument("--titulo", default="", help="título; vazio para omitir")
    argumentos = parser.parse_args()

    desconhecidos = [c for c in argumentos.personagens if c not in sprites.ELENCO]
    if desconhecidos:
        parser.error(
            "personagem não encontrado: %s. Disponíveis: %s"
            % (", ".join(desconhecidos), ", ".join(sprites.ELENCO))
        )

    folha = desenhar_folha(argumentos.personagens, argumentos.escala, argumentos.titulo)
    print("folha de expressões em %s" % salvar(folha, argumentos.saida))


if __name__ == "__main__":
    main()
