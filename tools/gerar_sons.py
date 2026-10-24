# Gerador dos sons do protótipo
#
# Saída: assets/sons/*.wav (efeitos, timbres de voz e a música em loop)
# Só usa a biblioteca padrão do Python.
#
# python tools/gerar_sons.py

import os

from sons.efeitos import EFEITOS
from sons.musica import gerar_musica
from sons.sintese import salvar_wav
from sons.voz import TIMBRES
from sprites.caminhos import DIR_ASSETS

DIR_SONS = os.path.join(DIR_ASSETS, "sons")


def main():
    os.makedirs(DIR_SONS, exist_ok=True)
    for nome, gerar in EFEITOS.items():
        salvar_wav(os.path.join(DIR_SONS, nome + ".wav"), gerar())
    for nome, gerar in TIMBRES.items():
        salvar_wav(os.path.join(DIR_SONS, "voz_" + nome + ".wav"), gerar())
    salvar_wav(os.path.join(DIR_SONS, "musica.wav"), gerar_musica())
    print("sons gerados em", DIR_SONS)


if __name__ == "__main__":
    main()
