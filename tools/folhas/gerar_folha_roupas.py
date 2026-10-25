# Folha de roupas
#
# As peças de cima (linhas) com todas as de baixo (colunas), no avatar
# padrão com crachá, parado. As desbloqueáveis só entram com --desbloqueaveis.
# Tamanho de folha ABNT: sem --escala, a maior escala que cabe.
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
from sprites.medidas import ALTURA_SPRITE, LARGURA_SPRITE
from folhas_comuns import (
    ALTURA_MAXIMA,
    COR_DA_LINHA_GUIA,
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    LARGURA_UTIL,
    ampliar,
    cm,
    fonte_em_pt,
    maior_escala,
    medidas_impressas,
    salvar_abnt,
)

ESPACO = cm(0.3)

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
    fonte = fonte_em_pt(10)
    medida = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    rotulo_mais_largo = max(medida.textlength(NOME_DA_PECA[cima], font=fonte) for cima in pecas_de_cima)
    largura_dos_rotulos = int(rotulo_mais_largo + cm(0.3))
    altura_dos_rotulos = fonte.size + cm(0.3)
    if escala is None:
        escala = maior_escala(LARGURA_UTIL - largura_dos_rotulos, ALTURA_MAXIMA - altura_dos_rotulos,
                              len(PECAS_DE_BAIXO), len(pecas_de_cima), LARGURA_SPRITE, ALTURA_SPRITE, ESPACO)

    largura_da_celula = LARGURA_SPRITE * escala + ESPACO
    altura_da_celula = ALTURA_SPRITE * escala + ESPACO
    # o nome da última coluna pode passar da célula
    ultima = NOME_DA_PECA[list(PECAS_DE_BAIXO)[-1]]
    sobra = max(cm(0.1), int(medida.textlength(ultima, font=fonte) - LARGURA_SPRITE * escala) // 2)
    largura = largura_dos_rotulos + largura_da_celula * len(PECAS_DE_BAIXO) - ESPACO + sobra
    altura = altura_dos_rotulos + altura_da_celula * len(pecas_de_cima) - ESPACO
    folha = Image.new("RGB", (largura, altura), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    for coluna, baixo in enumerate(PECAS_DE_BAIXO):
        x = largura_dos_rotulos + coluna * largura_da_celula
        d.text((x + LARGURA_SPRITE * escala / 2, 0), NOME_DA_PECA[baixo], font=fonte, fill=COR_DO_TEXTO, anchor="ma")

    for linha, cima in enumerate(pecas_de_cima):
        y = altura_dos_rotulos + linha * altura_da_celula
        d.text((0, y + ALTURA_SPRITE * escala / 2), NOME_DA_PECA[cima], font=fonte, fill=COR_DO_TEXTO, anchor="lm")

        for coluna, baixo in enumerate(PECAS_DE_BAIXO):
            x = largura_dos_rotulos + coluna * largura_da_celula
            aparencia = dict(APARENCIA_PADRAO, peca_de_cima=cima, peca_de_baixo=baixo, **cores)
            imagem = celula(aparencia, escala)
            folha.paste(imagem, (x, y), imagem)
            guia = y + imagem.height + cm(0.05)
            d.line([x, guia, x + imagem.width, guia], fill=COR_DA_LINHA_GUIA, width=2)

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
    parser.add_argument("--escala", type=int, default=None,
                        help="ampliação de cada sprite (padrão: a maior que cabe)")
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
    print("folha de roupas em %s (%s)" % (salvar_abnt(folha, argumentos.saida), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
