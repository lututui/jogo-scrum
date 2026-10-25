# Comparação com o desenho original
#
# Cada função devolve quantos casos conferiu e a lista dos que diferem.

import itertools
import os

from PIL import Image

from sprites.caminhos import DIR_ASSETS
from sprites.corpo import PECAS_DE_BAIXO, PECAS_DE_CIMA, POR_CIMA_DO_TORSO, POR_DENTRO_DA_SAIA
from sprites.elenco import APARENCIA_PADRAO, AVATAR_DO_JOGADOR, ELENCO, ESTILOS_DE_CABELO, EXPRESSOES
from sprites.medidas import QUADROS
from sprites.paleta import COR_DE_CRACHA
from sprites.personagem import montar, montar_jogador

from .composicao import compor, compor_jogador, folha_corpo, folha_retrato
from .folhas import para_rgba

# cores fora das paletas, para provar que qualquer cor do seletor funciona
CORES_DE_TESTE = {
    "pele": "#c68e65",
    "cabelo": "#3b6fd1",
    "superior": "#2e8b57",
    "interna": "#f2d16b",
    "inferior": "#8e3b5e",
}
ARMACAO_DE_TESTE = "#d1495b"


# compara os bytes: getbbox() numa imagem RGBA olha só o alfa e deixaria
# passar uma troca de cor
def iguais(a, b):
    return a.mode == b.mode and a.size == b.size and a.tobytes() == b.tobytes()


def quadros_e_expressoes():
    return itertools.product(range(QUADROS), EXPRESSOES)


# nome do arquivo, spec e cadeira de cada personagem com folha em assets/
def personagens():
    for nome, spec in ELENCO.items():
        yield nome, spec, None
    for cadeira in COR_DE_CRACHA:
        yield "jogador_" + cadeira, AVATAR_DO_JOGADOR, cadeira


# cada quadro montado pelas camadas contra montar(), feito de uma vez
def comparar_quadros(folhas):
    casos, falhas = 0, []
    for nome, spec, cadeira in personagens():
        for frame, expressao in quadros_e_expressoes():
            casos += 1
            esperado = montar(spec, frame=frame, expressao=expressao, cadeira=cadeira)
            if not iguais(compor(folhas, spec, frame, expressao, cadeira), esperado):
                falhas.append("%s, quadro %d, %s" % (nome, frame, expressao))
    return casos, falhas


# as folhas de corpo e retrato contra os PNGs de assets/
def comparar_arquivos(folhas):
    casos, falhas = 0, []
    for nome, spec, cadeira in personagens():
        for tipo, montar_folha in (("corpo", folha_corpo), ("retrato", folha_retrato)):
            casos += 1
            arquivo = "%s_%s.png" % (tipo, nome)
            original = Image.open(os.path.join(DIR_ASSETS, arquivo)).convert("RGBA")
            if not iguais(montar_folha(folhas, spec, cadeira), original):
                falhas.append(arquivo)
    return casos, falhas


# a aparência padrão do editor tem que dar o avatar atual
def comparar_aparencia_padrao():
    casos, falhas = 0, []
    for cadeira in COR_DE_CRACHA:
        for frame, expressao in quadros_e_expressoes():
            casos += 1
            esperado = montar(AVATAR_DO_JOGADOR, frame=frame, expressao=expressao, cadeira=cadeira)
            if not iguais(montar_jogador(APARENCIA_PADRAO, frame, expressao, cadeira), esperado):
                falhas.append("aparência padrão, %s, quadro %d, %s" % (cadeira, frame, expressao))
    return casos, falhas


# toda peça de cima com toda peça de baixo, cada cabelo, sem óculos, com
# armação colorida e com os óculos cristal; o fone em metade dos casos
def aparencias_de_teste():
    combinacoes = itertools.product(PECAS_DE_CIMA, PECAS_DE_BAIXO, ESTILOS_DE_CABELO, (None, ARMACAO_DE_TESTE, "cristal"))
    for indice, (cima, baixo, estilo, oculos) in enumerate(combinacoes):
        yield dict(CORES_DE_TESTE, peca_de_cima=cima, peca_de_baixo=baixo,
                   estilo_de_cabelo=estilo, oculos=oculos, acessorio="fone" if indice % 2 else None)


# camadas recoloridas contra montar_jogador(), feito de uma vez
def comparar_combinacoes(folhas):
    casos, falhas = 0, []
    cadeiras = itertools.cycle(COR_DE_CRACHA)
    for aparencia in aparencias_de_teste():
        cadeira = next(cadeiras)
        for frame, expressao in quadros_e_expressoes():
            casos += 1
            esperado = montar_jogador(aparencia, frame, expressao, cadeira)
            if not iguais(compor_jogador(folhas, aparencia, frame, expressao, cadeira), esperado):
                falhas.append("%s + %s, %s, óculos %s, quadro %d, %s" % (
                    aparencia["peca_de_cima"], aparencia["peca_de_baixo"],
                    aparencia["estilo_de_cabelo"], (aparencia["oculos"] or "não"),
                    frame, expressao))
    return casos, falhas


LINHA_DA_CINTURA = 23


# com saia, só a jaqueta pode aparecer dos lados da cintura
def comparar_cintura():
    casos, falhas = 0, []
    cor_de_cima = para_rgba(CORES_DE_TESTE["superior"])
    for aparencia in aparencias_de_teste():
        if aparencia["peca_de_baixo"] not in POR_CIMA_DO_TORSO:
            continue
        for frame in range(QUADROS):
            casos += 1
            img = montar_jogador(aparencia, frame)
            aparece = any(img.getpixel((x, LINHA_DA_CINTURA)) == cor_de_cima for x in range(img.width))
            deveria = aparencia["peca_de_cima"] not in POR_DENTRO_DA_SAIA
            if aparece != deveria:
                falhas.append("%s + %s, quadro %d: peça de cima %s na cintura" % (
                    aparencia["peca_de_cima"], aparencia["peca_de_baixo"], frame,
                    "aparece" if aparece else "não aparece"))
    return casos, falhas
