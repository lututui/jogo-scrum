# Comparação com o desenho original

import os

from PIL import Image, ImageChops

from sprites.caminhos import DIR_ASSETS
from sprites.elenco import AVATAR_DO_JOGADOR, ELENCO, EXPRESSOES
from sprites.medidas import QUADROS
from sprites.paleta import COR_DE_CRACHA
from sprites.personagem import montar

from .composicao import compor, folha_corpo, folha_retrato


def iguais(a, b):
    return a.size == b.size and ImageChops.difference(a, b).getbbox() is None


# nome do arquivo, spec e cadeira de cada personagem com folha em assets/
def personagens():
    for nome, spec in ELENCO.items():
        yield nome, spec, None
    for cadeira in COR_DE_CRACHA:
        yield "jogador_" + cadeira, AVATAR_DO_JOGADOR, cadeira


# cada quadro contra montar(), feito de uma vez
def comparar_quadros(folhas, nome, spec, cadeira):
    falhas = []
    for frame in range(QUADROS):
        for expressao in EXPRESSOES:
            esperado = montar(spec, frame=frame, expressao=expressao, cadeira=cadeira)
            if not iguais(compor(folhas, spec, frame, expressao, cadeira), esperado):
                falhas.append("%s, quadro %d, %s" % (nome, frame, expressao))
    return falhas


# as folhas de corpo e retrato contra os PNGs de assets/
def comparar_arquivos(folhas, nome, spec, cadeira):
    falhas = []
    for tipo, montar_folha in (("corpo", folha_corpo), ("retrato", folha_retrato)):
        arquivo = "%s_%s.png" % (tipo, nome)
        original = Image.open(os.path.join(DIR_ASSETS, arquivo)).convert("RGBA")
        if not iguais(montar_folha(folhas, spec, cadeira), original):
            falhas.append(arquivo)
    return falhas


def comparar_tudo(folhas):
    falhas = []
    for nome, spec, cadeira in personagens():
        falhas += comparar_quadros(folhas, nome, spec, cadeira)
        falhas += comparar_arquivos(folhas, nome, spec, cadeira)
    return falhas
