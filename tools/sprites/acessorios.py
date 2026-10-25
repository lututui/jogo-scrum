# Fone, objetos na mão e crachá

from .medidas import r
from .paleta import (
    COR_DA_ABA_DA_PASTA,
    COR_DA_ALMOFADA_DO_FONE,
    COR_DA_CAPA_DO_OBJETO,
    COR_DA_LINHA_DO_OBJETO,
    COR_DA_PASTA,
    COR_DO_FONE,
    COR_DO_OBJETO_NA_MAO,
    CONTORNO,
)


def desenhar_fone(d):
    r(d, 11, 3, 10, 1, COR_DO_FONE)
    r(d, 10, 4, 1, 4, COR_DO_FONE)
    r(d, 21, 4, 1, 4, COR_DO_FONE)
    for x in (9, 21):
        r(d, x, 8, 2, 4, COR_DO_FONE)
    r(d, 10, 9, 1, 2, COR_DA_ALMOFADA_DO_FONE)
    r(d, 21, 9, 1, 2, COR_DA_ALMOFADA_DO_FONE)


# objeto encostado no braço
def desenhar_caderno(d):
    r(d, 24, 18, 5, 6, CONTORNO)
    r(d, 25, 19, 3, 4, COR_DO_OBJETO_NA_MAO)
    r(d, 24, 19, 1, 4, COR_DA_CAPA_DO_OBJETO)
    r(d, 25, 20, 3, 1, COR_DA_LINHA_DO_OBJETO)
    r(d, 25, 22, 2, 1, COR_DA_LINHA_DO_OBJETO)


# folhas soltas e desalinhadas
def desenhar_provas(d):
    r(d, 25, 17, 4, 5, CONTORNO)
    r(d, 26, 18, 2, 3, COR_DO_OBJETO_NA_MAO)
    r(d, 24, 19, 4, 5, CONTORNO)
    r(d, 25, 20, 2, 3, COR_DO_OBJETO_NA_MAO)
    r(d, 25, 21, 2, 1, COR_DA_LINHA_DO_OBJETO)


# superfície fechada e opaca, com aba
def desenhar_pasta(d):
    r(d, 24, 18, 5, 6, CONTORNO)
    r(d, 25, 19, 3, 4, COR_DA_PASTA)
    r(d, 25, 19, 3, 1, COR_DA_ABA_DA_PASTA)
    r(d, 26, 21, 2, 1, COR_DA_ABA_DA_PASTA)


# os óculos ficam em rosto.py, porque vêm antes dos olhos
ACESSORIOS = {
    "fone": desenhar_fone,
    "caderno": desenhar_caderno,
    "provas": desenhar_provas,
    "pasta": desenhar_pasta,
}


def desenhar_acessorio(d, acessorio):
    if acessorio in ACESSORIOS:
        ACESSORIOS[acessorio](d)


# preso na cintura, à direita, para o peito ficar livre para as estampas
def desenhar_cracha(d, cor):
    r(d, 19, 20, 3, 4, CONTORNO)
    r(d, 20, 21, 1, 2, cor)
