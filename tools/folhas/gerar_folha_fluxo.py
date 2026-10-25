# Folha do fluxo de cenas
#
# Como o jogador passa de uma cena a outra, do carregamento ao fim, com a
# sprint de dez dias em volta do escritório. As posições são fixas, à mão:
# uma cena nova no jogo pede uma caixa nova aqui. Tamanho de folha ABNT.
#
# Uso:
#   python3 tools/folhas/gerar_folha_fluxo.py

import argparse
import math
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from folhas_comuns import (
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    LARGURA_UTIL,
    cm,
    fonte_em_pt,
    medidas_impressas,
    salvar_abnt,
)

BORDA, FUNDO, LINHA = (31, 111, 139), (232, 241, 245), (74, 85, 104)
SPRINT_FUNDO, SPRINT_BORDA = (247, 249, 251), (160, 174, 192)
POR_CIMA, POR_CIMA_BORDA, POR_CIMA_TEXTO = (255, 248, 232), (214, 176, 96), (110, 80, 30)
TRACO = 4
ALTURA_CM = 15.2


class Desenho:

    def __init__(self):
        self.folha = Image.new("RGB", (LARGURA_UTIL, cm(ALTURA_CM)), COR_DE_FUNDO)
        self.d = ImageDraw.Draw(self.folha)
        self.fonte, self.fonte_menor = fonte_em_pt(9), fonte_em_pt(8)

    # caixa com centro (x, y) e largura em cm; devolve as bordas em cm
    def caixa(self, x, y, largura, texto, sub=None, pilula=False, altura=1.0):
        d = self.d
        raio = cm(altura / 2) if pilula else cm(0.12)
        d.rounded_rectangle((cm(x - largura / 2), cm(y - altura / 2), cm(x + largura / 2), cm(y + altura / 2)),
                            raio, fill=FUNDO, outline=BORDA, width=TRACO)
        if sub:
            d.text((cm(x), cm(y) - cm(0.02)), texto, font=self.fonte, fill=COR_DO_TEXTO, anchor="md")
            d.text((cm(x), cm(y) + cm(0.1)), sub, font=self.fonte_menor, fill=COR_DO_TEXTO_SECUNDARIO, anchor="ma")
        else:
            d.text((cm(x), cm(y)), texto, font=self.fonte, fill=COR_DO_TEXTO, anchor="mm")
        return {"e": x - largura / 2, "d": x + largura / 2, "c": y - altura / 2, "b": y + altura / 2}

    # ponta de seta em q, vindo de p, em cm
    def ponta(self, p, q):
        angulo = math.atan2(q[1] - p[1], q[0] - p[0])
        comprimento, meia_base = 0.22, 0.1
        cos, sen = math.cos(angulo), math.sin(angulo)
        pontos = [q,
                  (q[0] - comprimento * cos + meia_base * sen, q[1] - comprimento * sen - meia_base * cos),
                  (q[0] - comprimento * cos - meia_base * sen, q[1] - comprimento * sen + meia_base * cos)]
        self.d.polygon([(cm(x), cm(y)) for x, y in pontos], fill=LINHA)

    # rótulo: ao lado da linha, à direita ("d") ou acima ("c")
    def seta(self, *pontos, dupla=False, rotulo=None, onde=None, lado="d"):
        self.d.line([(cm(x), cm(y)) for x, y in pontos], fill=LINHA, width=TRACO, joint="curve")
        self.ponta(pontos[-2], pontos[-1])
        if dupla:
            self.ponta(pontos[1], pontos[0])
        if rotulo:
            self.d.text((cm(onde[0]), cm(onde[1])), rotulo, font=self.fonte_menor, fill=COR_DO_TEXTO_SECUNDARIO,
                        anchor="lm" if lado == "d" else "md")


def desenhar_folha():
    f = Desenho()
    d = f.d

    # até a sprint
    carregamento = f.caixa(8, 0.5, 3.2, "Carregamento", pilula=True, altura=0.8)
    menu = f.caixa(8, 1.9, 2.4, "Menu")
    editor = f.caixa(13.6, 1.9, 4.0, "Editor de personagem")
    guia = f.caixa(13.6, 3.4, 4.0, "Guia")
    selecao = f.caixa(8, 4.6, 3.6, "Seleção de papel")
    f.seta((8, carregamento["b"]), (8, menu["c"]))
    f.seta((menu["d"], 1.9), (editor["e"], 1.9), rotulo="primeira vez", onde=(10.4, 1.8), lado="c")
    f.seta((13.6, editor["b"]), (13.6, guia["c"]))
    f.seta((13.6, guia["b"]), (13.6, 4.6), (selecao["d"], 4.6))
    f.seta((8, menu["b"]), (8, selecao["c"]), rotulo="JOGAR", onde=(8.2, 3.25))

    # a sprint: o escritório no meio, o que se abre dele dos lados
    topo, base = 5.6, 11.4
    d.rounded_rectangle((cm(2.2), cm(topo), cm(15.6), cm(base)), cm(0.2), fill=SPRINT_FUNDO, outline=SPRINT_BORDA,
                        width=3)
    d.text((cm(2.5), cm(topo + 0.2)), "Sprint de 10 dias", font=f.fonte_menor, fill=COR_DO_TEXTO_SECUNDARIO)
    f.seta((8, selecao["b"]), (8, topo))
    escritorio = f.caixa(8.2, 8.5, 2.6, "Escritório", altura=1.2)
    for y, nome in [(6.9, "Agenda"), (8.5, "Quadro Kanban"), (10.1, "Evento contextual")]:
        alvo = f.caixa(4.35, y, 3.3, nome)
        f.seta((escritorio["e"], 8.5 + (y - 8.5) * 0.25), (alvo["d"], y), dupla=True)
    for y, nome, dia in [(6.6, "Sprint Planning", "dia 1"), (7.9, "Daily Scrum", "dia 2"),
                         (9.2, "Sprint Review", "dia 9"), (10.5, "Sprint Retrospective", "dia 10")]:
        alvo = f.caixa(13.15, y, 4.3, nome, sub=dia, altura=1.05)
        f.seta((escritorio["d"], 8.5 + (y - 8.55) * 0.25), (alvo["e"], y), dupla=True)

    # depois da sprint
    sintese = f.caixa(8, 12.5, 3.6, "Síntese da sprint")
    fim = f.caixa(8, 14.3, 2.0, "Fim", pilula=True, altura=0.8)
    f.seta((8, base), (8, sintese["c"]), rotulo="fim do dia 10", onde=(8.2, 11.7))
    f.seta((8, sintese["b"]), (8, fim["c"]), rotulo="três cadeiras", onde=(8.2, 13.45))
    f.seta((sintese["e"], 12.5), (1.3, 12.5), (1.3, 4.6), (selecao["e"], 4.6))
    largura = d.textlength("falta cadeira", font=f.fonte_menor) + cm(0.2)
    d.rectangle((cm(4.0) - largura / 2, cm(12.3), cm(4.0) + largura / 2, cm(12.7)), fill=COR_DE_FUNDO)
    d.text((cm(4.0), cm(12.5)), "falta cadeira", font=f.fonte_menor, fill=COR_DO_TEXTO_SECUNDARIO, anchor="mm")
    f.seta((fim["e"], 14.3), (0.4, 14.3), (0.4, 1.9), (menu["e"], 1.9))

    # as telas que abrem por cima de qualquer cena
    d.rounded_rectangle((cm(10.6), cm(13.75), cm(15.6), cm(14.95)), cm(0.12), fill=POR_CIMA, outline=POR_CIMA_BORDA,
                        width=3)
    d.text((cm(13.1), cm(14.12)), "abrem por cima das cenas:", font=f.fonte_menor, fill=POR_CIMA_TEXTO, anchor="mm")
    d.text((cm(13.1), cm(14.55)), "Glossário, Dicas, Configurações", font=f.fonte_menor, fill=COR_DO_TEXTO,
           anchor="mm")
    return f.folha


def main():
    parser = argparse.ArgumentParser(description="Gera a folha com o fluxo das cenas do jogo")
    parser.add_argument("--saida", default="fluxo.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    folha = desenhar_folha()
    print("folha do fluxo em %s (%s)" % (salvar_abnt(folha, argumentos.saida), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
