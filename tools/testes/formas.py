# Formas das peças
#
# Confere o desenho de cada camada, sem olhar cor: nada sai do quadro de
# 32x32, nada cobre os olhos e o rosto, as mãos e os sapatos continuam à
# mostra em todas as combinações, e braços e pernas não se soltam do tronco
# ao andar.
#
# As camadas são desenhadas num gravador, que anota os pixels em vez de
# pintar; assim um pixel fora do quadro aparece, em vez de ser cortado.

import itertools

from sprites.camadas import MARCADORES, folhas_de_camada
from sprites.corpo import PECAS_DE_BAIXO, PECAS_DE_CIMA, PECAS_POR_FOLHA, camada_corpo, sapatos
from sprites.elenco import ESTILOS_DE_CABELO, EXPRESSOES
from sprites.medidas import ALTURA_SPRITE, CABECA_X, CABECA_Y, LARGURA_SPRITE, QUADROS
from sprites.paleta import COR_DE_CRACHA, COR_DE_SAPATO, CONTORNO
from sprites.personagem import montar_jogador
from sprites.rosto import cor_da_sobrancelha, desenhar_cabelo, desenhar_olhos, fundo_da_sobrancelha

from .comparacao import ARMACAO_DE_TESTE, CORES_DE_TESTE
from .folhas import para_rgba

# colunas dos braços em camada_corpo; as duas últimas linhas de cada um são a mão
COLUNAS_DOS_BRACOS = ((8, 9), (22, 23))
LINHAS_DA_MAO = 2

CABECA = {(x, y) for x in range(CABECA_X, CABECA_X + 10) for y in range(CABECA_Y, CABECA_Y + 9)}


# anota cada pixel com a cor que receberia
class Gravador:

    def __init__(self):
        self.pixels = {}

    def rectangle(self, caixa, fill):
        x0, y0, x1, y1 = caixa
        for x in range(x0, x1 + 1):
            for y in range(y0, y1 + 1):
                self.pixels[(x, y)] = fill


def gravar(desenhar, *argumentos):
    gravador = Gravador()
    desenhar(gravador, *argumentos)
    return gravador.pixels


def olhos(expressao):
    return gravar(desenhar_olhos, expressao, MARCADORES[0])


def maos(frame):
    corpo = gravar(camada_corpo, frame, MARCADORES[0])
    resultado = set()
    for colunas in COLUNAS_DOS_BRACOS:
        braco = [p for p in corpo if p[0] in colunas]
        fim = max(y for _, y in braco)
        resultado |= {(x, y) for x, y in braco if y > fim - LINHAS_DA_MAO}
    return resultado


def dentro_do_quadro(pixel):
    return 0 <= pixel[0] < LARGURA_SPRITE and 0 <= pixel[1] < ALTURA_SPRITE


# toda folha de camada, em todo quadro, cabe no 32x32
def conferir_limites():
    casos, falhas = 0, []
    for nome, (desenhar, categorias) in sorted(folhas_de_camada().items()):
        for frame in range(QUADROS):
            casos += 1
            pixels = gravar(desenhar, frame, *MARCADORES[:len(categorias)])
            fora = [p for p in pixels if not dentro_do_quadro(p)]
            if fora:
                falhas.append("%s, quadro %d: %d pixels fora do quadro, como %s" % (nome, frame, len(fora), fora[0]))
    return casos, falhas


# cabelo nenhum passa por cima dos olhos ou da sobrancelha
def conferir_cabelo_e_olhos():
    casos, falhas = 0, []
    for estilo, expressao in itertools.product(ESTILOS_DE_CABELO, EXPRESSOES):
        casos += 1
        em_cima = set(gravar(desenhar_cabelo, estilo, MARCADORES[0])) & set(olhos(expressao))
        if em_cima:
            falhas.append("cabelo %s cobre os olhos em %s: %s" % (estilo, expressao, sorted(em_cima)))
    return casos, falhas


# nenhuma peça de roupa entra na cabeça
def conferir_roupa_e_cabeca():
    casos, falhas = 0, []
    for nome, (desenhar, categorias) in sorted(PECAS_POR_FOLHA.items()):
        for frame in range(QUADROS):
            casos += 1
            em_cima = set(gravar(desenhar, frame, *MARCADORES[:len(categorias)])) & CABECA
            if em_cima:
                falhas.append("%s, quadro %d, entra na cabeça: %s" % (nome, frame, sorted(em_cima)[:4]))
    return casos, falhas


def aparencias():
    combinacoes = itertools.product(PECAS_DE_CIMA, PECAS_DE_BAIXO, ESTILOS_DE_CABELO, (None, ARMACAO_DE_TESTE, "cristal"))
    for indice, (cima, baixo, estilo, oculos) in enumerate(combinacoes):
        yield dict(CORES_DE_TESTE, peca_de_cima=cima, peca_de_baixo=baixo,
                   estilo_de_cabelo=estilo, oculos=oculos, acessorio="fone" if indice % 2 else None)


# braços: colunas e linhas do ombro até a ponta da mão; pernas: do quadril
# até a sola
BRACOS = ((8, 9, 22, 23), range(15, 24))
PERNAS = (tuple(range(12, 20)), range(23, ALTURA_SPRITE))


# no personagem montado, em cada quadro, cada coluna de braço e de perna é
# um traço só, do ombro ou do quadril até a mão ou o sapato, sem buraco
def conferir_membros():
    casos, falhas = 0, []
    for aparencia in aparencias():
        for frame in range(QUADROS):
            casos += 1
            img = montar_jogador(aparencia, frame, "neutro", "po")
            soltos = []
            for colunas, linhas in (BRACOS, PERNAS):
                for x in colunas:
                    cheios = [y for y in linhas if img.getpixel((x, y))[3] > 0]
                    if cheios and (cheios[0] != linhas[0] or len(cheios) != cheios[-1] - cheios[0] + 1):
                        soltos.append(x)
            if soltos:
                falhas.append("%s + %s, quadro %d: coluna solta em x %s" % (
                    aparencia["peca_de_cima"], aparencia["peca_de_baixo"], frame, soltos))
    return casos, falhas


# no personagem montado: olhos, mãos e sapatos aparecem na cor certa
def conferir_combinacoes():
    casos, falhas = 0, []
    pele = para_rgba(CORES_DE_TESTE["pele"])
    sapato = para_rgba(COR_DE_SAPATO)
    contorno = para_rgba(CONTORNO)
    cadeiras = itertools.cycle(COR_DE_CRACHA)

    for aparencia in aparencias():
        cadeira = next(cadeiras)
        for frame, expressao in itertools.product(range(QUADROS), EXPRESSOES):
            casos += 1
            img = montar_jogador(aparencia, frame, expressao, cadeira)
            sem_sobrancelha = montar_jogador(aparencia, frame, "neutro", cadeira)
            fundo = fundo_da_sobrancelha(sem_sobrancelha, aparencia["pele"])
            sobrancelha = para_rgba(cor_da_sobrancelha(aparencia["cabelo"], fundo))

            problemas = []
            for pixel, cor in olhos(expressao).items():
                esperado = contorno if cor == CONTORNO else sobrancelha
                if img.getpixel(pixel) != esperado:
                    problemas.append("olho coberto em %s" % (pixel,))
            if any(img.getpixel(p) != pele for p in maos(frame)):
                problemas.append("mão coberta")
            if any(img.getpixel(p) != sapato for p in gravar(sapatos, frame)):
                problemas.append("sapato coberto")

            if problemas:
                falhas.append("%s + %s, %s, óculos %s, quadro %d, %s: %s" % (
                    aparencia["peca_de_cima"], aparencia["peca_de_baixo"], aparencia["estilo_de_cabelo"],
                    (aparencia["oculos"] or "não"), frame, expressao, "; ".join(problemas)))
    return casos, falhas
