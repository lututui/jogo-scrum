# Folha de roupas
#
# As peças de cima (linhas) com todas as de baixo (colunas), no avatar
# padrão com crachá, parado. As desbloqueáveis só entram com --desbloqueaveis.
#
# Uso:
#   python3 tools/folhas/gerar_folha_roupas.py
#   python3 tools/folhas/gerar_folha_roupas.py --superior laranja --interna branco --inferior calca
#   python3 tools/folhas/gerar_folha_roupas.py --desbloqueaveis --saida roupas_todas.png

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.corpo import PECAS_DE_BAIXO, PECAS_DE_CIMA
from sprites.elenco import APARENCIA_PADRAO
from sprites.paleta import COR_DE_CALCA, COR_DE_ROUPA
from sprites.personagem import montar_jogador
from folhas_comuns import (
    COR_DA_LINHA_GUIA,
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    ampliar,
    carregar_fonte,
    escrever_centralizado,
    salvar,
)

MARGEM = 24
LARGURA_DOS_ROTULOS = 110
ALTURA_DOS_ROTULOS = 30
ESPACO = 24

# as que o editor oferece desde o começo; as outras dependem de conquista
PECAS_BASICAS = ("camiseta", "moletom", "jaqueta")

NOME_DA_PECA = {
    "camiseta": "camiseta",
    "moletom": "moletom",
    "jaqueta": "jaqueta",
    "meio_a_meio": "meio a meio",
    "colete": "colete",
    "camiseta_alvo": "alvo",
    "camiseta_visto": "visto",
    "camiseta_post_it": "post-it",
    "camiseta_catavento": "Catavento",
    "calca": "calça",
    "shorts": "shorts",
    "saia_curta": "saia curta",
    "saia_longa": "saia longa",
}


def celula(aparencia, escala):
    return ampliar(montar_jogador(aparencia, cadeira="po"), escala)


def desenhar_folha(cores, escala, pecas_de_cima):
    fonte = carregar_fonte(14)
    amostra = celula(APARENCIA_PADRAO, escala)
    largura_da_celula = amostra.width + ESPACO
    altura_da_celula = amostra.height + ESPACO

    largura = MARGEM * 2 + LARGURA_DOS_ROTULOS + largura_da_celula * len(PECAS_DE_BAIXO)
    altura = MARGEM * 2 + ALTURA_DOS_ROTULOS + altura_da_celula * len(pecas_de_cima)
    folha = Image.new("RGB", (largura, altura), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    for coluna, baixo in enumerate(PECAS_DE_BAIXO):
        x = MARGEM + LARGURA_DOS_ROTULOS + coluna * largura_da_celula
        escrever_centralizado(d, x + amostra.width / 2, MARGEM, NOME_DA_PECA[baixo], fonte, COR_DO_TEXTO)

    for linha, cima in enumerate(pecas_de_cima):
        y = MARGEM + ALTURA_DOS_ROTULOS + linha * altura_da_celula
        d.text((MARGEM, y + amostra.height / 2 - 8), NOME_DA_PECA[cima], font=fonte, fill=COR_DO_TEXTO)

        for coluna, baixo in enumerate(PECAS_DE_BAIXO):
            x = MARGEM + LARGURA_DOS_ROTULOS + coluna * largura_da_celula
            aparencia = dict(APARENCIA_PADRAO, peca_de_cima=cima, peca_de_baixo=baixo, **cores)
            imagem = celula(aparencia, escala)
            folha.paste(imagem, (x, y), imagem)
            d.line([x, y + imagem.height + 4, x + imagem.width, y + imagem.height + 4],
                   fill=COR_DA_LINHA_GUIA)

    return folha


# nome da paleta de roupa ou #rrggbb
def ler_cor(valor):
    if valor.startswith("#"):
        return valor
    if valor == "calca":
        return COR_DE_CALCA
    return COR_DE_ROUPA[valor]


def main():
    parser = argparse.ArgumentParser(description="Gera a folha com todas as combinações de roupa")
    parser.add_argument("--escala", type=int, default=6, help="ampliação de cada sprite")
    parser.add_argument("--superior", default="verde_escuro", help="cor da peça de cima")
    parser.add_argument("--interna", default="branco", help="cor da camiseta por baixo da jaqueta")
    parser.add_argument("--inferior", default="bege", help="cor da peça de baixo")
    parser.add_argument("--desbloqueaveis", action="store_true", help="inclui as peças desbloqueáveis")
    parser.add_argument("--saida", default="roupas.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    cores = {
        "superior": ler_cor(argumentos.superior),
        "interna": ler_cor(argumentos.interna),
        "inferior": ler_cor(argumentos.inferior),
    }
    pecas = list(PECAS_DE_CIMA) if argumentos.desbloqueaveis else list(PECAS_BASICAS)
    folha = desenhar_folha(cores, argumentos.escala, pecas)
    print("folha de roupas em %s" % salvar(folha, argumentos.saida))


if __name__ == "__main__":
    main()
