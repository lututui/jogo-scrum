# Folha do elenco
#
# Uso:
#   python3 tools/gerar_folha_elenco.py
#   python3 tools/gerar_folha_elenco.py --escala 8 --colunas 4

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.elenco import ELENCO
from sprites.personagem import montar
from folhas_comuns import (
    COR_DA_LINHA_GUIA,
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    ampliar,
    carregar_fonte,
    descrever,
    escrever_centralizado,
    nomes_do_elenco,
    salvar,
)

MARGEM = 24
ESPACO_ENTRE_COLUNAS = 20
ALTURA_DO_RODAPE = 60


def montar_cartoes(escala):
    # cada cartão é um personagem: sprite ampliado, nome e papel
    catalogo = nomes_do_elenco()
    cartoes = []

    for chave, receita in ELENCO.items():
        nome, papel = descrever(chave, catalogo)
        cartoes.append({
            "imagem": ampliar(montar(receita), escala),
            "nome": nome,
            "papel": papel,
        })

    return cartoes


def desenhar_folha(cartoes, colunas, titulo):
    fonte_nome = carregar_fonte(15)
    fonte_papel = carregar_fonte(12)
    fonte_titulo = carregar_fonte(17)

    largura_do_sprite = cartoes[0]["imagem"].width
    altura_do_sprite = cartoes[0]["imagem"].height
    largura_da_celula = largura_do_sprite + ESPACO_ENTRE_COLUNAS
    altura_da_celula = altura_do_sprite + ALTURA_DO_RODAPE

    linhas = (len(cartoes) + colunas - 1) // colunas
    topo = MARGEM + (30 if titulo else 0)

    largura = MARGEM * 2 + largura_da_celula * colunas
    altura = topo + altura_da_celula * linhas + MARGEM

    folha = Image.new("RGB", (largura, altura), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    if titulo:
        d.text((MARGEM, MARGEM - 6), titulo, font=fonte_titulo, fill=COR_DO_TEXTO)

    for indice, cartao in enumerate(cartoes):
        coluna = indice % colunas
        linha = indice // colunas
        x = MARGEM + coluna * largura_da_celula
        y = topo + linha * altura_da_celula
        centro = x + largura_da_celula / 2 - ESPACO_ENTRE_COLUNAS / 2

        folha.paste(cartao["imagem"], (int(x), int(y)), cartao["imagem"])

        base = y + altura_do_sprite + 6
        d.line(
            [x, base, x + largura_do_sprite, base],
            fill=COR_DA_LINHA_GUIA,
        )
        escrever_centralizado(d, centro, base + 6, cartao["nome"], fonte_nome, COR_DO_TEXTO)
        if cartao["papel"]:
            escrever_centralizado(
                d, centro, base + 24, cartao["papel"], fonte_papel, COR_DO_TEXTO_SECUNDARIO
            )

    return folha


def main():
    parser = argparse.ArgumentParser(description="Gera a folha do elenco em uma única imagem")
    parser.add_argument("--escala", type=int, default=6, help="ampliação de cada sprite")
    parser.add_argument("--colunas", type=int, default=3, help="personagens por linha")
    parser.add_argument("--saida", default="elenco.png", help="nome do arquivo em figuras/")
    parser.add_argument("--titulo", default="", help="título; vazio para omitir")
    argumentos = parser.parse_args()

    cartoes = montar_cartoes(argumentos.escala)
    folha = desenhar_folha(cartoes, argumentos.colunas, argumentos.titulo)
    print("folha do elenco em %s" % salvar(folha, argumentos.saida))


if __name__ == "__main__":
    main()
