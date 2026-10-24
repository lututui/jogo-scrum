import os
import re

from PIL import Image, ImageDraw, ImageFont

# raiz do projeto: este arquivo fica em tools/folhas
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ARQUIVO_DO_ELENCO = os.path.join(RAIZ, "src", "dados", "elenco.js")
DIR_FIGURAS = os.path.join(RAIZ, "figuras")

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


# as chaves internas não têm acento; a figura do texto tem
NOME_DA_EXPRESSAO = {
    "neutro": "neutro",
    "tenso": "tenso",
    "aprovacao": "aprovação",
}


def rotular_expressao(expressao):
    return NOME_DA_EXPRESSAO.get(expressao, expressao)


def carregar_fonte(tamanho):
    for caminho in CAMINHOS_DE_FONTE:
        if os.path.exists(caminho):
            return ImageFont.truetype(caminho, tamanho)
    return ImageFont.load_default()


def largura_do_texto(d, texto, fonte):
    esquerda, _, direita, _ = d.textbbox((0, 0), texto, font=fonte)
    return direita - esquerda


def escrever_centralizado(d, x, y, texto, fonte, cor):
    d.text((x - largura_do_texto(d, texto, fonte) / 2, y), texto, font=fonte, fill=cor)


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
