# Teste das folhas de camada
#
# Monta personagens a partir de assets/camadas, trocando os marcadores pela
# cor de cada parte, e compara com o desenho feito de uma vez e com os PNGs
# de assets/. Qualquer pixel diferente é falha. O código fica em tools/testes.
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


def main():
    folhas = carregar_folhas(DIR_CAMADAS)
    etapas = (
        ("quadros do elenco e do avatar", lambda: comparar_quadros(folhas)),
        ("folhas de assets/", lambda: comparar_arquivos(folhas)),
        ("aparência padrão contra o avatar", comparar_aparencia_padrao),
        ("combinações de peças, cabelos e óculos", lambda: comparar_combinacoes(folhas)),
        ("peça de cima escondida pela saia", comparar_cintura),
    )

    todas_as_falhas = []
    for descricao, comparar in etapas:
        casos, falhas = comparar()
        print("%-42s %5d casos, %d diferentes" % (descricao, casos, len(falhas)))
        todas_as_falhas += falhas

    if todas_as_falhas:
        print("FALHOU em %d casos:" % len(todas_as_falhas))
        for falha in todas_as_falhas[:20]:
            print("  " + falha)
        sys.exit(1)

    print("tudo idêntico")


if __name__ == "__main__":
    main()
