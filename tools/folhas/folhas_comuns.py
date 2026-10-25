import json
import os
import re
import shutil
import subprocess

from PIL import Image, ImageDraw, ImageFont

# raiz do projeto: este arquivo fica em tools/folhas
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARQUIVO_DO_ELENCO = os.path.join(RAIZ, "src", "dados", "elenco.js")
DIR_FIGURAS = os.path.join(RAIZ, "figuras")
EXPORTAR_DADOS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "exportar_dados.mjs")

# ------------------------------------------------------------------
# paleta

COR_DE_FUNDO = "#ffffff"
COR_DO_TEXTO = "#1b2430"
COR_DO_TEXTO_SECUNDARIO = "#6d7b95"
COR_DA_LINHA_GUIA = "#d4dbe8"
COR_DO_PALCO = "#e7ebf4"

CAMINHOS_DE_FONTE = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/Library/Fonts/Arial.ttf",
    "C:/Windows/Fonts/arial.ttf",
]

CAMINHOS_DE_FONTE_NEGRITO = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]


# as chaves internas não têm acento; a figura do texto tem
NOME_DA_EXPRESSAO = {
    "neutro": "neutro",
    "tenso": "tenso",
    "aprovacao": "aprovação",
}


def rotular_expressao(expressao):
    return NOME_DA_EXPRESSAO.get(expressao, expressao)


def carregar_fonte(tamanho, negrito=False):
    for caminho in CAMINHOS_DE_FONTE_NEGRITO if negrito else CAMINHOS_DE_FONTE:
        if os.path.exists(caminho):
            return ImageFont.truetype(caminho, tamanho)
    return ImageFont.load_default()


def largura_do_texto(d, texto, fonte):
    esquerda, _, direita, _ = d.textbbox((0, 0), texto, font=fonte)
    return direita - esquerda


def escrever_centralizado(d, x, y, texto, fonte, cor):
    d.text((x - largura_do_texto(d, texto, fonte) / 2, y), texto, font=fonte, fill=cor)


def quebrar_texto(d, texto, fonte, largura):
    # quebra por palavra até cada linha caber na largura, em px
    linhas, atual = [], ""
    for palavra in texto.split():
        tentativa = (atual + " " + palavra).strip()
        if not atual or d.textlength(tentativa, font=fonte) <= largura:
            atual = tentativa
        else:
            linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


# ------------------------------------------------------------------
# folha ABNT
#
# A NBR 14724 pede A4 com margens de 3 cm (superior e esquerda) e 2 cm
# (inferior e direita): sobram 16 x 24,7 cm. Tirando o título e a fonte da
# figura, a figura tem até 22 cm de altura. As folhas que seguem esta medida
# saem em 300 dpi, com o dpi gravado no PNG, para entrar no texto com 16 cm
# de largura; o texto dentro delas vai de 8 a 10 pt.

DPI = 300
LARGURA_UTIL_CM = 16.0
ALTURA_MAXIMA_CM = 22.0


def cm(valor):
    return round(valor / 2.54 * DPI)


def pt(valor):
    return round(valor / 72 * DPI)


LARGURA_UTIL = cm(LARGURA_UTIL_CM)
ALTURA_MAXIMA = cm(ALTURA_MAXIMA_CM)


def fonte_em_pt(tamanho, negrito=False):
    return carregar_fonte(pt(tamanho), negrito)


# a maior escala inteira em que a grade de sprites cabe no espaço, em px
def maior_escala(largura, altura, colunas, linhas, sprite_largura, sprite_altura, espaco):
    por_largura = (largura // colunas - espaco) // sprite_largura
    por_altura = (altura // linhas - espaco) // sprite_altura
    return max(1, min(por_largura, por_altura))


def salvar_abnt(imagem, nome_do_arquivo):
    largura, altura = imagem.size
    if largura > LARGURA_UTIL or altura > ALTURA_MAXIMA:
        raise SystemExit("%s não cabe na folha: %.1f x %.1f cm (máximo %.0f x %.0f cm)" % (
            nome_do_arquivo, largura / DPI * 2.54, altura / DPI * 2.54, LARGURA_UTIL_CM, ALTURA_MAXIMA_CM))
    os.makedirs(DIR_FIGURAS, exist_ok=True)
    caminho = os.path.join(DIR_FIGURAS, nome_do_arquivo)
    imagem.save(caminho, dpi=(DPI, DPI))
    return caminho


def medidas_impressas(imagem):
    return "%.1f x %.1f cm" % (imagem.width / DPI * 2.54, imagem.height / DPI * 2.54)


# ------------------------------------------------------------------
# dados do jogo
#
# Os dados de src/dados são módulos JS; exportar_dados.mjs os lê com o Node,
# o mesmo que roda o servidor, e devolve em JSON o que as folhas usam.

_DADOS_DO_JOGO = None


def dados_do_jogo():
    global _DADOS_DO_JOGO
    if _DADOS_DO_JOGO is None:
        node = shutil.which("node")
        if not node:
            raise SystemExit("esta folha lê os dados do jogo com o Node; instale o Node (o mesmo do servidor)")
        saida = subprocess.run([node, "--no-warnings", EXPORTAR_DADOS], capture_output=True, text=True,
                               encoding="utf-8")
        if saida.returncode != 0:
            raise SystemExit("falhou ao ler os dados do jogo:\n" + saida.stderr)
        _DADOS_DO_JOGO = json.loads(saida.stdout)
    return _DADOS_DO_JOGO


# ------------------------------------------------------------------
# elenco

def nomes_do_elenco():
    # lê nome e papel de cada personagem direto do arquivo de dados do jogo
    if not os.path.exists(ARQUIVO_DO_ELENCO):
        return {}

    conteudo = open(ARQUIVO_DO_ELENCO, encoding="utf-8").read()
    padrao = re.compile(
        r'chave:\s*"(?P<chave>[^"]+)".*?'
        r'nome:\s*"(?P<nome>[^"]+)".*?'
        r'papel:\s*"(?P<papel>[^"]+)"',
        re.DOTALL,
    )

    encontrados = {}
    for achado in padrao.finditer(conteudo):
        encontrados[achado.group("chave")] = (achado.group("nome"), achado.group("papel"))
    return encontrados


def descrever(chave, catalogo):
    if chave in catalogo:
        return catalogo[chave]
    return (chave.capitalize(), "")


def ampliar(imagem, escala):
    return imagem.resize(
        (imagem.width * escala, imagem.height * escala),
        Image.NEAREST,
    )


def salvar(imagem, nome_do_arquivo):
    os.makedirs(DIR_FIGURAS, exist_ok=True)
    caminho = os.path.join(DIR_FIGURAS, nome_do_arquivo)
    imagem.save(caminho)
    return caminho
