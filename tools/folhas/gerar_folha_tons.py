# Folha de tons
#
# Os seis tons de pele (colunas) com as cores de cabelo do editor (linhas),
# no avatar padrão com crachá, recortado da cabeça ao peito. A roupa tem cor
# para não se confundir com o fundo branco. Tamanho de folha ABNT: sem
# --escala, a maior escala que cabe.
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
    ALTURA_MAXIMA,
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

ESPACO = cm(0.25)

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
    fonte = fonte_em_pt(10)
    medida = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    largura_dos_rotulos = int(max(medida.textlength(cabelo, font=fonte) for cabelo in CABELOS_DO_EDITOR) + cm(0.3))
    altura_dos_rotulos = fonte.size + cm(0.3)
    largura_do_recorte, altura_do_recorte = RECORTE[2] - RECORTE[0], RECORTE[3] - RECORTE[1]
    if escala is None:
        escala = maior_escala(LARGURA_UTIL - largura_dos_rotulos, ALTURA_MAXIMA - altura_dos_rotulos,
                              len(TOM_DE_PELE), len(CABELOS_DO_EDITOR), largura_do_recorte, altura_do_recorte,
                              ESPACO)

    largura_da_celula = largura_do_recorte * escala + ESPACO
    altura_da_celula = altura_do_recorte * escala + ESPACO
    # o nome da última coluna pode passar da célula
    ultimo = list(TOM_DE_PELE)[-1]
    ultimo = NOME_DO_TOM.get(ultimo, ultimo)
    sobra = max(cm(0.1), int(medida.textlength(ultimo, font=fonte) - largura_do_recorte * escala) // 2)
    largura = largura_dos_rotulos + largura_da_celula * len(TOM_DE_PELE) - ESPACO + sobra
    altura = altura_dos_rotulos + altura_da_celula * len(CABELOS_DO_EDITOR) - ESPACO
    folha = Image.new("RGB", (largura, altura), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    for coluna, tom in enumerate(TOM_DE_PELE):
        x = largura_dos_rotulos + coluna * largura_da_celula
        d.text((x + largura_do_recorte * escala / 2, 0), NOME_DO_TOM.get(tom, tom), font=fonte, fill=COR_DO_TEXTO,
               anchor="ma")

    for linha, cabelo in enumerate(CABELOS_DO_EDITOR):
        y = altura_dos_rotulos + linha * altura_da_celula
        d.text((0, y + altura_do_recorte * escala / 2), cabelo, font=fonte, fill=COR_DO_TEXTO, anchor="lm")

        for coluna, tom in enumerate(TOM_DE_PELE.values()):
            x = largura_dos_rotulos + coluna * largura_da_celula
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
    parser.add_argument("--escala", type=int, default=None,
                        help="ampliação de cada sprite (padrão: a maior que cabe)")
    parser.add_argument("--roupa", default="verde_escuro", help="cor da camiseta; evite branco, a cor do fundo")
    parser.add_argument("--expressao", default="tenso", choices=EXPRESSOES,
                        help="tenso e aprovacao mostram a sobrancelha")
    parser.add_argument("--saida", default="tons.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    if not argumentos.roupa.startswith("#") and argumentos.roupa not in COR_DE_ROUPA:
        parser.error("roupa desconhecida: %s (use #rrggbb ou %s)" % (argumentos.roupa, ", ".join(COR_DE_ROUPA)))

    folha = desenhar_folha(ler_cor(argumentos.roupa), argumentos.expressao, argumentos.escala)
    print("folha de tons em %s (%s)" % (salvar_abnt(folha, argumentos.saida), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
