# Teste das folhas de camada
#
# Monta personagens a partir de assets/camadas, trocando os marcadores pela
# cor de cada parte, e compara com o desenho feito de uma vez e com os PNGs
# de assets/. Qualquer pixel diferente é falha. Depois confere as formas:
# nada sai do quadro nem cobre olhos, mãos e sapatos. O código fica em
# tools/testes.
#
# python tools/testar_camadas.py

import sys

from sprites.caminhos import DIR_CAMADAS
from testes.comparacao import (
    comparar_aparencia_padrao,
    comparar_arquivos,
    comparar_cintura,
    comparar_combinacoes,
    comparar_quadros,
)
from testes.folhas import carregar_folhas
from testes.formas import (
    conferir_cabelo_e_olhos,
    conferir_combinacoes,
    conferir_limites,
    conferir_membros,
    conferir_roupa_e_cabeca,
)


def main():
    folhas = carregar_folhas(DIR_CAMADAS)
    etapas = (
        ("quadros do elenco e do avatar", lambda: comparar_quadros(folhas)),
        ("folhas de assets/", lambda: comparar_arquivos(folhas)),
        ("aparência padrão contra o avatar", comparar_aparencia_padrao),
        ("combinações de peças, cabelos e óculos", lambda: comparar_combinacoes(folhas)),
        ("peça de cima escondida pela saia", comparar_cintura),
        ("formas: camadas dentro do 32x32", conferir_limites),
        ("formas: cabelo longe dos olhos", conferir_cabelo_e_olhos),
        ("formas: roupa longe da cabeça", conferir_roupa_e_cabeca),
        ("formas: olhos, mãos e sapatos à mostra", conferir_combinacoes),
        ("formas: braços e pernas presos ao andar", conferir_membros),
    )

    todas_as_falhas = []
    for descricao, comparar in etapas:
        casos, falhas = comparar()
        print("%-42s %5d casos, %d falhas" % (descricao, casos, len(falhas)))
        todas_as_falhas += falhas

    if todas_as_falhas:
        print("FALHOU em %d casos:" % len(todas_as_falhas))
        for falha in todas_as_falhas[:20]:
            print("  " + falha)
        sys.exit(1)

    print("tudo certo")


if __name__ == "__main__":
    main()
