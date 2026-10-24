# Roda todos os geradores, em ordem
#
# Imagens e sons do jogo (assets/) e as folhas de figuras do texto do TCC
# (figuras/). Cada gerador roda no seu próprio processo, como se fosse
# chamado à mão; o primeiro que falhar interrompe o resto.
#
# python tools/gerar_tudo.py              tudo
# python tools/gerar_tudo.py --so-jogo    só assets/, sem as figuras

import argparse
import os
import subprocess
import sys

DIR_TOOLS = os.path.dirname(os.path.abspath(__file__))

JOGO = [
    "gerar_sprites.py",
    "gerar_sons.py",
]

FIGURAS = [
    os.path.join("folhas", "gerar_folha_elenco.py"),
    os.path.join("folhas", "gerar_folha_expressoes.py"),
    os.path.join("folhas", "gerar_folha_roupas.py"),
    os.path.join("folhas", "gerar_folha_tons.py"),
]


def ler_argumentos():
    parser = argparse.ArgumentParser(description="Roda todos os geradores do projeto.")
    parser.add_argument("--so-jogo", action="store_true",
                        help="gera só as imagens e os sons do jogo, sem as figuras do texto")
    return parser.parse_args()


def main():
    geradores = JOGO if ler_argumentos().so_jogo else JOGO + FIGURAS

    for posicao, gerador in enumerate(geradores, 1):
        print("[%d/%d] %s" % (posicao, len(geradores), gerador), flush=True)
        resultado = subprocess.run([sys.executable, os.path.join(DIR_TOOLS, gerador)])
        if resultado.returncode != 0:
            print("falhou: %s (código %d)" % (gerador, resultado.returncode))
            sys.exit(resultado.returncode)

    print("pronto: %d geradores" % len(geradores))


if __name__ == "__main__":
    main()
