# Folha de tons
#
# Os seis tons de pele (colunas) com as cores de cabelo do editor (linhas),
# no avatar padrão com crachá, recortado da cabeça ao peito. A roupa tem cor
# para não se confundir com o fundo branco.
#
# Uso:
#   python3 tools/folhas/gerar_folha_tons.py
#   python3 tools/folhas/gerar_folha_tons.py --roupa laranja --expressao tenso

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.elenco import APARENCIA_PADRAO, EXPRESSOES
from sprites.paleta import CABELOS_DO_EDITOR, COR_DE_CABELO, COR_DE_ROUPA, TOM_DE_PELE
from sprites.personagem import montar_jogador
from folhas_comuns import (
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    ampliar,
    carregar_fonte,
    escrever_centralizado,
    salvar,
)

MARGEM = 24
LARGURA_DOS_ROTULOS = 90
ALTURA_DOS_ROTULOS = 30
ESPACO = 16

# da cabeça ao peito: o que muda com a pele e o cabelo
RECORTE = (0, 0, 32, 24)

NOME_DO_TOM = {
    "clara": "clara",
    "dourada": "dourada",
    "media": "média",
    "parda": "parda",
    "acobreada": "acobreada",
    "escura": "escura",
}


def celula(aparencia, expressao, escala):
    sprite = montar_jogador(aparencia, expressao=expressao, cadeira="po")
    return ampliar(sprite.crop(RECORTE), escala)


def desenhar_folha(roupa, expressao, escala):
    fonte = carregar_fonte(14)
    amostra = celula(APARENCIA_PADRAO, expressao, escala)
    largura_da_celula = amostra.width + ESPACO
    altura_da_celula = amostra.height + ESPACO

    largura = MARGEM * 2 + LARGURA_DOS_ROTULOS + largura_da_celula * len(TOM_DE_PELE) - ESPACO
    altura = MARGEM * 2 + ALTURA_DOS_ROTULOS + altura_da_celula * len(CABELOS_DO_EDITOR) - ESPACO
    folha = Image.new("RGB", (largura, altura), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    for coluna, tom in enumerate(TOM_DE_PELE):
        x = MARGEM + LARGURA_DOS_ROTULOS + coluna * largura_da_celula
        escrever_centralizado(d, x + amostra.width / 2, MARGEM, NOME_DO_TOM.get(tom, tom), fonte, COR_DO_TEXTO)

    for linha, cabelo in enumerate(CABELOS_DO_EDITOR):
        y = MARGEM + ALTURA_DOS_ROTULOS + linha * altura_da_celula
        d.text((MARGEM, y + amostra.height / 2 - 8), cabelo, font=fonte, fill=COR_DO_TEXTO)

        for coluna, tom in enumerate(TOM_DE_PELE.values()):
            x = MARGEM + LARGURA_DOS_ROTULOS + coluna * largura_da_celula
            aparencia = dict(APARENCIA_PADRAO, pele=tom, cabelo=COR_DE_CABELO[cabelo], superior=roupa)
            imagem = celula(aparencia, expressao, escala)
            folha.paste(imagem, (x, y), imagem)

    return folha


# nome da paleta de roupa ou #rrggbb
def ler_cor(valor):
    if valor.startswith("#"):
        return valor
    return COR_DE_ROUPA[valor]


def main():
    parser = argparse.ArgumentParser(description="Gera a folha com os tons de pele e as cores de cabelo")
    parser.add_argument("--escala", type=int, default=5, help="ampliação de cada sprite")
    parser.add_argument("--roupa", default="verde_escuro", help="cor da camiseta; evite branco, a cor do fundo")
    parser.add_argument("--expressao", default="tenso", choices=EXPRESSOES,
                        help="tenso e aprovacao mostram a sobrancelha")
    parser.add_argument("--saida", default="tons.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    if not argumentos.roupa.startswith("#") and argumentos.roupa not in COR_DE_ROUPA:
        parser.error("roupa desconhecida: %s (use #rrggbb ou %s)" % (argumentos.roupa, ", ".join(COR_DE_ROUPA)))

    folha = desenhar_folha(ler_cor(argumentos.roupa), argumentos.expressao, argumentos.escala)
    print("folha de tons em %s" % salvar(folha, argumentos.saida))


if __name__ == "__main__":
    main()
