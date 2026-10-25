# Gerador da logo da Catavento
#
# Um catavento de papel em pixel art, de seis pás (ou quantas se pedir). Cada
# pá tem a face, um triângulo com a ponta no eixo, e a dobra, um triângulo
# menor do outro lado do eixo; as duas vão até a bissetriz entre o eixo e o
# vizinho. As outras pás são a primeira girada em partes iguais da volta. Cada
# pá tem uma cor só, e o contorno é essa cor escurecida: é ele que marca a
# dobra e faz a pá branca aparecer em fundo branco. O fundo é transparente.
#
# As cores vão para as pás em sentido horário, a partir da pá de cima; com
# menos cores que pás, repetem na ordem dada. O # é opcional (no terminal, uma
# cor com # precisa de aspas).
#
# Uso:
#   python3 tools/gerar_logo.py
#   python3 tools/gerar_logo.py --escala 10
#   python3 tools/gerar_logo.py --pas 4 --tamanho 48
#   python3 tools/gerar_logo.py --cores e05a10 f8c846 50af4b 25aacd 3a5fc8 8e44ad
#
# Saída: assets/logo_catavento.png (ou o nome dado em --saida)

import argparse
import math
import os
import re
import sys

from PIL import Image, ImageColor

from sprites.caminhos import DIR_ASSETS
from sprites.paleta import CORES_DO_CATAVENTO, TRANSPARENTE

COR_HEXADECIMAL = re.compile(r"^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$")

# quanto o contorno escurece a cor da pá
ESCURECIMENTO_DO_CONTORNO = 0.5


def cor(texto):
    if not COR_HEXADECIMAL.match(texto):
        raise argparse.ArgumentTypeError("cor inválida: %s (use #rrggbb ou #rgb)" % texto)
    return ImageColor.getrgb("#" + texto.lstrip("#")) + (255,)


def quantidade_de_pas(texto):
    valor = int(texto)
    if valor < 3:
        raise argparse.ArgumentTypeError("o catavento precisa de pelo menos 3 pás")
    return valor


def lado(texto):
    valor = int(texto)
    if valor < 16 or valor % 4:
        raise argparse.ArgumentTypeError("o tamanho precisa ser múltiplo de 4 e pelo menos 16")
    return valor


def contorno_da_cor(cor_da_pa):
    return tuple(round(c * (1 - ESCURECIMENTO_DO_CONTORNO)) for c in cor_da_pa[:3]) + (255,)


def cores_das_pas(cores, pas):
    return [cores[indice % len(cores)] for indice in range(pas)]


def no_triangulo(ponto, a, b, c):
    def lado_da_reta(p, q, r):
        return (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1])

    lados = (lado_da_reta(ponto, a, b), lado_da_reta(ponto, b, c), lado_da_reta(ponto, c, a))
    return not (min(lados) < 0 < max(lados))


# Em que parte cai o centro do pixel: (pá, "face" ou "dobra"), ou None. As
# contas são as da pá de cima, com o centro em (0, 0) e meia pá valendo m; o
# ponto é girado até ela. Na borda entre duas pás, a face vale antes da
# dobra, em todas as pás igual. O arredondamento põe na borda o pixel que o
# seno e o cosseno deixariam um fio para fora.
def parte_do_pixel(x, y, m, pas):
    u0 = x + 0.5 - 2 * m
    v0 = y + 0.5 - 2 * m
    largura = round(math.tan(math.pi / pas) * m, 9)

    for parte in ("face", "dobra"):
        for pa in range(pas):
            angulo = -2 * math.pi * pa / pas
            u = round(u0 * math.cos(angulo) - v0 * math.sin(angulo), 9)
            v = round(u0 * math.sin(angulo) + v0 * math.cos(angulo), 9)
            if parte == "face" and no_triangulo((u, v), (0, 0), (0, -2 * m), (-largura, -m)):
                return pa, parte
            if parte == "dobra" and no_triangulo((u, v), (0, 0), (0, -m), (largura, -m)):
                return pa, parte
    return None


# Contorno onde a parte encosta no vazio; entre duas partes, só a face leva a
# linha, para ela sair com um pixel só
def na_borda(partes, x, y):
    parte = partes[(x, y)][1]
    for vizinho in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        outra = partes.get(vizinho)
        if outra is None:
            return True
        if parte == "face" and outra[1] == "dobra":
            return True
    return False


def desenhar(tamanho, cores, pas=6):
    m = tamanho // 4
    imagem = Image.new("RGBA", (tamanho, tamanho), TRANSPARENTE)

    partes = {}
    for y in range(tamanho):
        for x in range(tamanho):
            parte = parte_do_pixel(x, y, m, pas)
            if parte:
                partes[(x, y)] = parte

    preenchimento = cores_das_pas(cores, pas)
    for (x, y), (pa, _) in partes.items():
        cor_da_pa = preenchimento[pa]
        imagem.putpixel((x, y), contorno_da_cor(cor_da_pa) if na_borda(partes, x, y) else cor_da_pa)
    return imagem


def ler_argumentos(argv=None):
    parser = argparse.ArgumentParser(description="Gera a logo da Catavento em pixel art.")
    parser.add_argument("--escala", type=int, default=4, help="ampliação de cada pixel (padrão: 4)")
    parser.add_argument("--cores", type=cor, nargs="+", default=[cor(c) for c in CORES_DO_CATAVENTO],
                        help="cor de cada pá; menos cores que pás repetem na ordem dada")
    parser.add_argument("--pas", type=quantidade_de_pas, default=6, help="número de pás (padrão: 6)")
    parser.add_argument("--tamanho", type=lado, default=64,
                        help="largura do catavento em pixels, antes da escala (múltiplo de 4)")
    parser.add_argument("--saida", default="logo_catavento.png", help="nome do arquivo em assets/")
    argumentos = parser.parse_args(argv)
    if argumentos.escala < 1:
        parser.error("a escala precisa ser pelo menos 1")
    return argumentos


def main(argv=None):
    argumentos = ler_argumentos(argv)
    imagem = desenhar(argumentos.tamanho, argumentos.cores, argumentos.pas)
    imagem = imagem.resize((imagem.width * argumentos.escala, imagem.height * argumentos.escala), Image.NEAREST)

    os.makedirs(DIR_ASSETS, exist_ok=True)
    caminho = os.path.join(DIR_ASSETS, argumentos.saida)
    imagem.save(caminho)
    print("logo gerada em", caminho)


if __name__ == "__main__":
    main(sys.argv[1:])
