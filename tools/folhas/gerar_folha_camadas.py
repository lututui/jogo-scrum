# Folha de camadas
#
# O personagem do jogador montado camada por camada, na ordem do jogo
# (ui/montarJogador.js): em cima, a folha da camada como sai de
# assets/camadas, com magenta e ciano no lugar das cores; embaixo, o
# personagem até aquela camada. Tamanho de folha ABNT.
#
# Uso:
#   python3 tools/folhas/gerar_folha_camadas.py
#   python3 tools/folhas/gerar_folha_camadas.py --cadeira dev --saida camadas_dev.png

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.camadas import folhas_de_camada
from sprites.caminhos import DIR_CAMADAS
from sprites.corpo import ordem_das_pecas
from sprites.elenco import APARENCIA_PADRAO
from sprites.paleta import COR_DE_CABELO, COR_DE_CRACHA, COR_DE_ROUPA
from sprites.rosto import cor_da_sobrancelha, fundo_da_sobrancelha
from testes.folhas import carregar_folhas, quadro, recolorir
from folhas_comuns import (
    COR_DE_FUNDO,
    COR_DO_PALCO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    LARGURA_UTIL,
    cm,
    fonte_em_pt,
    medidas_impressas,
    salvar_abnt,
)

# uma aparência que passa por todas as camadas
APARENCIA = dict(
    APARENCIA_PADRAO,
    peca_de_cima="jaqueta",
    superior=COR_DE_ROUPA["azul_petroleo"],
    interna="#f4f6fa",
    peca_de_baixo="saia_longa",
    inferior="#c9a96a",
    estilo_de_cabelo="rabo_cavalo",
    cabelo=COR_DE_CABELO["ruivo"],
    oculos="#2b3348",
    acessorio="fone",
)

COLUNAS = 4
ESCALA = 11
LARGURA_DOS_ROTULOS = cm(1.9)
ESPACO = cm(0.2)
ENTRE_LINHAS = cm(0.5)


# (rótulo, folha, cores); cores None: a sobrancelha, que depende do que já está embaixo
def etapas(aparencia, cadeira):
    lista = [("corpo", "corpo", [aparencia["pele"]])]
    for nome in ordem_das_pecas(aparencia):
        _, categorias = folhas_de_camada()[nome]
        rotulo = "parte de cima" if nome.startswith("superior_") else "parte de baixo"
        lista.append((rotulo, nome, [aparencia[c] for c in categorias]))
    lista.append(("cabelo", "cabelo_" + aparencia["estilo_de_cabelo"], [aparencia["cabelo"]]))
    if aparencia["oculos"] == "cristal":
        lista.append(("óculos", "oculos_cristal", []))
    elif aparencia["oculos"]:
        lista.append(("óculos", "oculos", [aparencia["oculos"]]))
    lista.append(("olhos", "olhos_neutro", None))
    if aparencia.get("acessorio") == "fone":
        lista.append(("fone", "fone", []))
    lista.append(("crachá", "cracha", [COR_DE_CRACHA[cadeira]]))
    return lista


def desenhar_folha(aparencia, cadeira):
    folhas = carregar_folhas(DIR_CAMADAS)
    lista = etapas(aparencia, cadeira)
    fonte, fonte_menor = fonte_em_pt(10), fonte_em_pt(8)

    lado = 32 * ESCALA
    celula = (LARGURA_UTIL - LARGURA_DOS_ROTULOS) // COLUNAS
    titulo = fonte.size + cm(0.25)
    altura_da_linha = titulo + 2 * lado + ESPACO
    linhas = (len(lista) + COLUNAS - 1) // COLUNAS
    folha = Image.new("RGB", (LARGURA_UTIL, linhas * altura_da_linha + (linhas - 1) * ENTRE_LINHAS), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    acumulado = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    for i, (rotulo, nome, cores) in enumerate(lista):
        if cores is None:
            cores = [cor_da_sobrancelha(aparencia["cabelo"], fundo_da_sobrancelha(acumulado, aparencia["pele"]))]
        bruta = quadro(folhas[nome], 0)
        acumulado.alpha_composite(recolorir(bruta, cores))

        coluna, linha = i % COLUNAS, i // COLUNAS
        x = LARGURA_DOS_ROTULOS + coluna * celula + (celula - lado) // 2
        y = linha * (altura_da_linha + ENTRE_LINHAS)
        d.text((x + lado / 2, y), "%d. %s" % (i + 1, rotulo), font=fonte, fill=COR_DO_TEXTO, anchor="ma")

        folha.paste(COR_DO_PALCO, (x, y + titulo, x + lado, y + titulo + lado))
        grande = bruta.resize((lado, lado), Image.NEAREST)
        folha.paste(grande, (x, y + titulo), grande)
        grande = acumulado.resize((lado, lado), Image.NEAREST)
        folha.paste(grande, (x, y + titulo + lado + ESPACO), grande)

        if coluna == 0:
            d.text((0, y + titulo + lado / 2), "folha", font=fonte_menor,
                   fill=COR_DO_TEXTO_SECUNDARIO, anchor="lm")
            d.text((0, y + titulo + lado + ESPACO + lado / 2), "resultado", font=fonte_menor,
                   fill=COR_DO_TEXTO_SECUNDARIO, anchor="lm")
    return folha


def main():
    parser = argparse.ArgumentParser(description="Gera a folha com a montagem do personagem por camadas")
    parser.add_argument("--cadeira", default="sm", choices=sorted(COR_DE_CRACHA), help="cor do crachá")
    parser.add_argument("--saida", default="camadas.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    folha = desenhar_folha(APARENCIA, argumentos.cadeira)
    print("folha de camadas em %s (%s)" % (salvar_abnt(folha, argumentos.saida), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
