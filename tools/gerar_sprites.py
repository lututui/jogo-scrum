# Gerador de sprites do protótipo
#
# Saída: assets/*.png e as folhas de camada em assets/camadas/*.png
# O desenho fica em tools/sprites; este arquivo só junta e salva.
#
# python tools/gerar_sprites.py                 tudo, camadas em magenta
# python tools/gerar_sprites.py --so-camadas    só as camadas
# python tools/gerar_sprites.py --cor cabelo=castanho --cor superior=#f4f6fa
#                                               camadas coloridas, em
#                                               tools/camadas_coloridas

import argparse
import os

from sprites.camadas import PALETAS, exportar_camadas, ler_cor
from sprites.caminhos import DIR_ASSETS, DIR_CAMADAS, DIR_CAMADAS_COLORIDAS
from sprites.cenario import CENARIO
from sprites.elenco import AVATAR_DO_JOGADOR, ELENCO
from sprites.paleta import COR_DE_CRACHA
from sprites.personagem import folha_corpo, folha_retrato


# folhas de corpo e retrato do elenco e do avatar, e o cenário
def gerar_assets():
    os.makedirs(DIR_ASSETS, exist_ok=True)
    imagens = {}

    for nome, spec in ELENCO.items():
        imagens["corpo_" + nome] = folha_corpo(spec)
        imagens["retrato_" + nome] = folha_retrato(spec)

    for cadeira in COR_DE_CRACHA:
        imagens["corpo_jogador_" + cadeira] = folha_corpo(AVATAR_DO_JOGADOR, cadeira=cadeira)
        imagens["retrato_jogador_" + cadeira] = folha_retrato(AVATAR_DO_JOGADOR, cadeira=cadeira)

    for nome, desenhar in CENARIO.items():
        imagens[nome] = desenhar()

    for nome, img in sorted(imagens.items()):
        img.save(os.path.join(DIR_ASSETS, nome + ".png"))

    print("%d imagens geradas em %s" % (len(imagens), DIR_ASSETS))


def ler_argumentos():
    parser = argparse.ArgumentParser(description="Gera os sprites e as folhas de camada.")
    parser.add_argument(
        "--so-camadas", action="store_true",
        help="gera só as folhas de camada, sem refazer assets/*.png")
    parser.add_argument(
        "--cor", action="append", default=[], metavar="CATEGORIA=COR",
        help="pinta uma categoria com cor fixa no lugar do magenta: #rrggbb ou um "
             "nome da paleta, por exemplo cabelo=castanho. Categorias: "
             + ", ".join(PALETAS))
    parser.add_argument(
        "--saida-camadas", metavar="PASTA",
        help="pasta das folhas de camada. Padrão: assets/camadas; com --cor, "
             "tools/camadas_coloridas, para não substituir as folhas que o jogo recolore")
    argumentos = parser.parse_args()

    try:
        argumentos.cores = dict(ler_cor(texto) for texto in argumentos.cor)
    except ValueError as erro:
        parser.error(str(erro))

    return argumentos


def main():
    argumentos = ler_argumentos()
    cores = argumentos.cores
    destino = argumentos.saida_camadas or (DIR_CAMADAS_COLORIDAS if cores else DIR_CAMADAS)

    if not argumentos.so_camadas:
        gerar_assets()

    total = exportar_camadas(destino, cores)
    print("%d folhas de camada geradas em %s" % (total, destino))


if __name__ == "__main__":
    main()
