# Folha do elenco
#
# Cada personagem com nome e papel, em tamanho de folha ABNT. Sai em duas
# figuras de uma linha: o time da Catavento (5) e quem está em volta dele
# (4), elenco_1.png e elenco_2.png, na mesma escala.
#
# Uso:
#   python3 tools/folhas/gerar_folha_elenco.py
#   python3 tools/folhas/gerar_folha_elenco.py --por-figura 3,3,3 --escala 8
#   python3 tools/folhas/gerar_folha_elenco.py --por-figura 9

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.elenco import ELENCO
from sprites.medidas import ALTURA_SPRITE, LARGURA_SPRITE
from sprites.personagem import montar
from folhas_comuns import (
    ALTURA_MAXIMA,
    COR_DA_LINHA_GUIA,
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    LARGURA_UTIL,
    ampliar,
    cm,
    descrever,
    fonte_em_pt,
    maior_escala,
    medidas_impressas,
    nomes_do_elenco,
    quebrar_texto,
    salvar_abnt,
)

ESPACO = cm(0.3)
# folga acima dos sprites: o cabelo de alguns começa na primeira linha do sprite
MARGEM_DE_CIMA = cm(0.2)


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


# uma figura de uma linha; célula e rodapé iguais em todas as figuras
def desenhar_folha(cartoes, largura_da_celula, linhas_do_papel):
    fonte_nome, fonte_papel = fonte_em_pt(10), fonte_em_pt(8)
    medida = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    largura_do_texto = largura_da_celula - ESPACO

    papeis = [quebrar_texto(medida, cartao["papel"], fonte_papel, largura_do_texto) for cartao in cartoes]
    altura_do_sprite = cartoes[0]["imagem"].height
    rodape = cm(0.2) + round(fonte_nome.size * 1.3) + linhas_do_papel * round(fonte_papel.size * 1.25)

    folha = Image.new("RGB", (largura_da_celula * len(cartoes), MARGEM_DE_CIMA + altura_do_sprite + rodape),
                      COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    for indice, cartao in enumerate(cartoes):
        x = indice * largura_da_celula
        centro = x + largura_da_celula / 2
        imagem = cartao["imagem"]
        folha.paste(imagem, (int(centro - imagem.width / 2), MARGEM_DE_CIMA), imagem)

        base = MARGEM_DE_CIMA + altura_do_sprite + cm(0.05)
        d.line([centro - imagem.width / 2, base, centro + imagem.width / 2, base],
               fill=COR_DA_LINHA_GUIA, width=2)
        y = base + cm(0.15)
        d.text((centro, y), cartao["nome"], font=fonte_nome, fill=COR_DO_TEXTO, anchor="ma")
        y += round(fonte_nome.size * 1.3)
        for linha in papeis[indice]:
            d.text((centro, y), linha, font=fonte_papel, fill=COR_DO_TEXTO_SECUNDARIO, anchor="ma")
            y += round(fonte_papel.size * 1.25)

    return folha


# "5,4" -> [5, 4]; sobrando personagens, o último tamanho se repete
def ler_grupos(texto, total, parser):
    try:
        tamanhos = [int(parte) for parte in texto.split(",")]
    except ValueError:
        parser.error("--por-figura espera números separados por vírgula, como 5,4")
    if any(tamanho < 1 for tamanho in tamanhos):
        parser.error("--por-figura: cada figura precisa de pelo menos 1 personagem")

    grupos, inicio = [], 0
    while inicio < total:
        tamanho = tamanhos[min(len(grupos), len(tamanhos) - 1)]
        grupos.append((inicio, min(inicio + tamanho, total)))
        inicio += tamanho
    return grupos


def main():
    parser = argparse.ArgumentParser(description="Gera a folha do elenco")
    parser.add_argument("--por-figura", default="5,4",
                        help="personagens em cada figura, na ordem do elenco (um número só: todos numa figura)")
    parser.add_argument("--escala", type=int, default=None,
                        help="ampliação de cada sprite (padrão: a maior que cabe)")
    parser.add_argument("--saida", default="elenco.png", help="nome do arquivo em figuras/ (recebe _1, _2...)")
    argumentos = parser.parse_args()

    grupos = ler_grupos(argumentos.por_figura, len(ELENCO), parser)
    colunas = max(fim - inicio for inicio, fim in grupos)
    largura_da_celula = LARGURA_UTIL // colunas
    escala = argumentos.escala or maior_escala(LARGURA_UTIL, ALTURA_MAXIMA, colunas, 1,
                                               LARGURA_SPRITE, ALTURA_SPRITE, ESPACO)
    largura_da_celula = max(largura_da_celula, LARGURA_SPRITE * escala + ESPACO)

    cartoes = montar_cartoes(escala)
    medida = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    linhas_do_papel = max(len(quebrar_texto(medida, cartao["papel"], fonte_em_pt(8), largura_da_celula - ESPACO))
                          for cartao in cartoes)
    base, extensao = os.path.splitext(argumentos.saida)
    for numero, (inicio, fim) in enumerate(grupos, 1):
        nome = argumentos.saida if len(grupos) == 1 else "%s_%d%s" % (base, numero, extensao)
        folha = desenhar_folha(cartoes[inicio:fim], largura_da_celula, linhas_do_papel)
        print("folha do elenco em %s (%s)" % (salvar_abnt(folha, nome), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
