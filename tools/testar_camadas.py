# Teste das folhas de camada
#
# Monta cada personagem a partir de assets/camadas, trocando o magenta pela
# cor de cada parte, e compara com o desenho feito de uma vez e com os PNGs
# de assets/. Qualquer pixel diferente é falha. O código fica em tools/testes.
#
# python tools/testar_camadas.py

import sys

from sprites.caminhos import DIR_CAMADAS
from sprites.elenco import EXPRESSOES
from sprites.medidas import QUADROS
from testes.comparacao import comparar_tudo, personagens
from testes.folhas import carregar_folhas


def main():
    falhas = comparar_tudo(carregar_folhas(DIR_CAMADAS))

    if falhas:
        print("FALHOU em %d casos:" % len(falhas))
        for falha in falhas:
            print("  " + falha)
        sys.exit(1)

    total = sum(1 for _ in personagens())
    print("%d quadros e %d folhas montados por camadas, todos idênticos ao desenho original"
          % (total * QUADROS * len(EXPRESSOES), total * 2))


if __name__ == "__main__":
    main()
