# Folha da agenda
#
# A sprint de dez dias em cada cadeira: as reuniões do Scrum, os eventos
# contextuais (imprevistos) e as ações opcionais do escritório, lidos dos
# dados do jogo. Os dias vão nas linhas e as cadeiras nas colunas, para caber
# em pé numa folha ABNT. Precisa dos retratos de assets/ (gerar_sprites.py).
#
# Uso:
#   python3 tools/folhas/gerar_folha_agenda.py

import argparse
import os
import sys

from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sprites.caminhos import DIR_ASSETS
from folhas_comuns import (
    COR_DA_LINHA_GUIA,
    COR_DE_FUNDO,
    COR_DO_TEXTO,
    COR_DO_TEXTO_SECUNDARIO,
    LARGURA_UTIL,
    cm,
    dados_do_jogo,
    fonte_em_pt,
    medidas_impressas,
    quebrar_texto,
    salvar_abnt,
)

DIAS = 10

# os ids não têm acento nem nome de exibição; a figura tem
NOME_DO_EVENTO = {
    "pedido-da-diretora": "Pedido da diretora",
    "pressao-do-dono": "Pressão do dono",
    "bloqueio-da-bia": "Bloqueio da Bia",
    "bug-em-producao": "Bug em produção",
    "atalho-tecnico": "Atalho técnico",
    "colega-travado": "Colega travada",
    "cliques-do-helio": "Cliques do Hélio",
    "quatro-coisas-do-caio": "As quatro coisas do Caio",
    "revisao-do-caio": "Revisão do Caio",
}

NOME_DA_REUNIAO = {
    "SPRINT PLANNING": "Sprint Planning",
    "DAILY SCRUM": "Daily Scrum",
    "SPRINT REVIEW": "Sprint Review",
    "SPRINT RETROSPECTIVE": "Sprint Retrospective",
}

REUNIAO, REUNIAO_CLARA = (31, 111, 139), (232, 241, 245)
IMPREVISTO, IMPREVISTO_CLARO = (192, 57, 43), (250, 236, 235)
OPCIONAL, OPCIONAL_CLARO, OPCIONAL_TEXTO = (214, 176, 96), (255, 248, 232), (110, 80, 30)
DIVISORIA = (236, 239, 245)

COLUNA_DOS_DIAS = cm(1.3)
CABECALHO = cm(1.0)
ALTURA_DO_DIA = cm(1.45)
RECUO = cm(0.12)
RAIO = cm(0.12)
LARGURA_DA_FAIXA = cm(1.75)
ROSTO = cm(0.8)
TRACO = 3


def nome_do_evento(id_):
    if id_ not in NOME_DO_EVENTO:
        raise SystemExit("evento sem nome na figura: %s (acrescente em NOME_DO_EVENTO)" % id_)
    return NOME_DO_EVENTO[id_]


def criar_retratos():
    guardados = {}

    # a cabeça do retrato neutro, com a altura pedida
    def retrato(quem, altura):
        if (quem, altura) not in guardados:
            imagem = Image.open(os.path.join(DIR_ASSETS, "retrato_%s.png" % quem)).convert("RGBA")
            cabeca = imagem.crop((0, 0, 72, 96))
            guardados[(quem, altura)] = cabeca.resize((altura * 3 // 4, altura), Image.NEAREST)
        return guardados[(quem, altura)]

    return retrato


def desenhar_folha(dados):
    fonte, fonte_menor, fonte_maior = fonte_em_pt(9), fonte_em_pt(8), fonte_em_pt(10)
    entrelinha, entrelinha_menor = round(fonte.size * 1.2), round(fonte_menor.size * 1.2)
    retrato = criar_retratos()

    cadeiras = dados["cadeiras"]
    coluna = (LARGURA_UTIL - COLUNA_DOS_DIAS) // len(cadeiras)
    fim_da_grade = CABECALHO + DIAS * ALTURA_DO_DIA
    folha = Image.new("RGB", (LARGURA_UTIL, fim_da_grade + cm(1.3)), COR_DE_FUNDO)
    d = ImageDraw.Draw(folha)

    def escrever_linhas(x, y, linhas, fonte_, cor, centro=False):
        for k, linha in enumerate(linhas):
            d.text((x, y + k * round(fonte_.size * 1.2)), linha, font=fonte_, fill=cor, anchor="ma" if centro else "la")

    # cabeçalho e grade
    for i, cadeira in enumerate(cadeiras):
        largura = d.textlength(cadeira["nome"], font=fonte_maior) + cm(0.45)
        x = COLUNA_DOS_DIAS + i * coluna + (coluna - largura) / 2
        d.rectangle((x, CABECALHO / 2 - cm(0.1), x + cm(0.25), CABECALHO / 2 + cm(0.15)), fill=cadeira["cor"])
        d.text((x + cm(0.45), CABECALHO / 2 + cm(0.03)), cadeira["nome"], font=fonte_maior, fill=COR_DO_TEXTO,
               anchor="lm")
    for dia in range(1, DIAS + 2):
        y = CABECALHO + (dia - 1) * ALTURA_DO_DIA
        d.line([(0, y), (folha.width, y)], fill=COR_DA_LINHA_GUIA, width=2)
        if dia <= DIAS:
            d.text((COLUNA_DOS_DIAS / 2 - cm(0.1), y + ALTURA_DO_DIA / 2), "dia %d" % dia, font=fonte,
                   fill=COR_DO_TEXTO_SECUNDARIO, anchor="mm")
    for i in range(len(cadeiras)):
        x = COLUNA_DOS_DIAS + i * coluna
        d.line([(x, CABECALHO), (x, fim_da_grade)], fill=DIVISORIA, width=2)

    for i, cadeira in enumerate(cadeiras):
        chave = cadeira["chave"]
        x = COLUNA_DOS_DIAS + i * coluna
        acoes = [acao for acao in dados["acoes"] if chave in acao["cadeiras"]]

        # reunião: cheia quando a cadeira tem a cena própria; o rótulo é o da agenda do jogo
        for reuniao in dados["reunioes"]:
            y = CABECALHO + (reuniao["dia"] - 1) * ALTURA_DO_DIA
            papel = reuniao["papeis"].get(chave, {})
            cheia = papel.get("conduz", False)
            rotulo = (papel.get("rotulo") or "participa").replace("você ", "")
            d.rounded_rectangle((x + RECUO, y + RECUO, x + coluna - RECUO, y + ALTURA_DO_DIA - RECUO), RAIO,
                                fill=REUNIAO if cheia else REUNIAO_CLARA, outline=REUNIAO, width=TRACO)
            meio = y + ALTURA_DO_DIA / 2
            d.text((x + coluna / 2, meio - cm(0.05)), NOME_DA_REUNIAO.get(reuniao["nome"], reuniao["nome"]),
                   font=fonte, fill="white" if cheia else REUNIAO, anchor="md")
            d.text((x + coluna / 2, meio + cm(0.08)), rotulo, font=fonte_menor,
                   fill="white" if cheia else COR_DO_TEXTO_SECUNDARIO, anchor="ma")

        # imprevisto, à esquerda da faixa da ação quando há uma
        direita = x + coluna - RECUO - (LARGURA_DA_FAIXA + RECUO if acoes else 0)
        for evento in dados["contextuais"]:
            if chave not in evento["cadeiras"]:
                continue
            y = CABECALHO + (evento["dia"] - 1) * ALTURA_DO_DIA
            d.rounded_rectangle((x + RECUO, y + RECUO, direita, y + ALTURA_DO_DIA - RECUO), RAIO,
                                fill=IMPREVISTO_CLARO, outline=IMPREVISTO, width=TRACO)
            rosto = retrato(evento["quem"], ROSTO)
            folha.paste(rosto, (x + 2 * RECUO, int(y + (ALTURA_DO_DIA - rosto.height) / 2)), rosto)
            texto_x = x + 3 * RECUO + rosto.width
            linhas = quebrar_texto(d, nome_do_evento(evento["id"]), fonte, direita - texto_x - RECUO)
            bloco = round(fonte_menor.size * 1.25) + len(linhas) * entrelinha
            texto_y = y + (ALTURA_DO_DIA - bloco) / 2
            d.text((texto_x, texto_y), "imprevisto", font=fonte_menor, fill=IMPREVISTO)
            escrever_linhas(texto_x, texto_y + round(fonte_menor.size * 1.25), linhas, fonte, COR_DO_TEXTO)

        # ação opcional: faixa vertical nos dias em que o "!" aparece
        for acao in acoes:
            x0 = x + coluna - RECUO - LARGURA_DA_FAIXA
            y0 = CABECALHO + (acao["dias"][0] - 1) * ALTURA_DO_DIA + RECUO
            y1 = CABECALHO + acao["dias"][1] * ALTURA_DO_DIA - RECUO
            d.rounded_rectangle((x0, y0, x0 + LARGURA_DA_FAIXA, y1), RAIO, fill=OPCIONAL_CLARO, outline=OPCIONAL,
                                width=TRACO)
            centro = x0 + LARGURA_DA_FAIXA / 2
            rosto = retrato(acao["quem"], ROSTO)
            folha.paste(rosto, (int(centro - rosto.width / 2), y0 + RECUO), rosto)
            texto_y = y0 + 2 * RECUO + rosto.height
            escrever_linhas(centro, texto_y, ["ação", "opcional"], fonte_menor, OPCIONAL_TEXTO, centro=True)
            texto_y += 2 * entrelinha_menor + cm(0.1)
            linhas = quebrar_texto(d, nome_do_evento(acao["id"]), fonte, LARGURA_DA_FAIXA - 2 * RECUO)
            escrever_linhas(centro, texto_y, linhas, fonte, COR_DO_TEXTO, centro=True)
            d.text((centro, texto_y + len(linhas) * entrelinha + cm(0.1)), "dias %d a %d" % tuple(acao["dias"]),
                   font=fonte_menor, fill=OPCIONAL_TEXTO, anchor="ma")

    # chave de cores
    y = fim_da_grade + cm(0.45)
    x = 0
    for borda, fundo, texto in [(REUNIAO, REUNIAO, "reunião com cena própria da cadeira"),
                                (REUNIAO, REUNIAO_CLARA, "reunião em que participa"),
                                (IMPREVISTO, IMPREVISTO_CLARO, "imprevisto"),
                                (OPCIONAL, OPCIONAL_CLARO, "ação opcional")]:
        d.rounded_rectangle((x, y, x + cm(0.4), y + cm(0.4)), cm(0.06), fill=fundo, outline=borda, width=TRACO)
        d.text((x + cm(0.55), y + cm(0.2)), texto, font=fonte_menor, fill=COR_DO_TEXTO_SECUNDARIO, anchor="lm")
        x += cm(0.85) + d.textlength(texto, font=fonte_menor)
    return folha


def main():
    parser = argparse.ArgumentParser(description="Gera a folha com a agenda da sprint em cada cadeira")
    parser.add_argument("--saida", default="agenda.png", help="nome do arquivo em figuras/")
    argumentos = parser.parse_args()

    folha = desenhar_folha(dados_do_jogo())
    print("folha da agenda em %s (%s)" % (salvar_abnt(folha, argumentos.saida), medidas_impressas(folha)))


if __name__ == "__main__":
    main()
