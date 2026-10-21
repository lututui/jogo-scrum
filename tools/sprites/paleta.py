# Paleta

TRANSPARENTE = (0, 0, 0, 0)

CONTORNO = "#2b3348"

# ------------------------------------------------------------------
# personagens

# do mais claro ao mais escuro; os seis são os do editor de personagem.
# Mais escuro que "escura", os olhos (em CONTORNO) deixam de aparecer
TOM_DE_PELE = {
    "clara": "#f1d3bb",
    "dourada": "#e8c09a",
    "media": "#dcab85",
    "parda": "#b07a50",
    "acobreada": "#96633f",
    "escura": "#7d4f31",
}

COR_DE_CABELO = {
    "preto": "#171320",
    "castanho": "#5d3a20",
    "castanho_claro": "#8f5c2c",
    "grisalho": "#b6b3ac",
    "loiro": "#d9bb6e",
    "verde_agua": "#49c9bb",
    "ruivo": "#a8452a",
}

# as cores de cabelo sugeridas no editor, as mesmas de CORES_PADRAO.cabelo
# em src/dados/aparencia.js
CABELOS_DO_EDITOR = ("loiro", "castanho", "grisalho", "preto", "ruivo")

COR_DE_ROUPA = {
    "vermelho": "#c0392b",
    "azul_petroleo": "#1f6f8b",
    "roxo": "#7a4bb5",
    "laranja": "#e08a3c",
    "cinza_claro": "#aab4c4",
    "cinza_azulado": "#6b7a90",
    "bege": "#c9a96a",
    "verde_escuro": "#3f7a52",
    "lilas": "#a87fc4",
    "branco": "#f4f6fa",
}

COR_DE_CALCA = "#39465c"
COR_DE_SAPATO = "#20283a"

COR_DA_ARMACAO = "#7b88a5"
COR_DA_LENTE = "#eef4fb"

COR_DA_SOBRANCELHA_CLARA = "#e8edf5"

# crachá do avatar: mesma cor do mentor de cada cadeira
COR_DE_CRACHA = {
    "po": COR_DE_ROUPA["vermelho"],
    "sm": COR_DE_ROUPA["azul_petroleo"],
    "dev": COR_DE_ROUPA["roxo"],
}

COR_DO_OBJETO_NA_MAO = "#f5f1e4"
COR_DA_CAPA_DO_OBJETO = "#8a5f3c"
COR_DA_LINHA_DO_OBJETO = "#8f9cb3"
COR_DA_PASTA = "#c79a5b"
COR_DA_ABA_DA_PASTA = "#e3c08a"
COR_DO_FONE = "#37425e"
COR_DA_ALMOFADA_DO_FONE = "#96a3bb"

# ------------------------------------------------------------------
# cenário

COR_DO_PISO = "#e7ebf4"
COR_DA_JUNTA_DO_PISO = "#dbe1ee"
COR_DA_PAREDE = "#c3cee4"
COR_DO_RODAPE = "#9fb0cf"
COR_DO_FRISO_DA_PAREDE = "#b2c0da"

COR_DO_TAMPO = "#8fa8cf"
COR_DO_BRILHO_DO_TAMPO = "#a8bcdc"
COR_DA_SOMBRA_DO_TAMPO = "#6d87b3"
COR_DA_PERNA_DA_MESA = "#6d87b3"
COR_DO_MONITOR = "#4c6a94"
COR_DA_TELA = "#63d29b"

COR_DA_MOLDURA_DO_QUADRO = "#5f7ba8"
COR_DO_FUNDO_DO_QUADRO = "#fbfcfe"
CORES_DOS_CARTOES = [
    COR_DE_ROUPA["vermelho"],
    COR_DE_ROUPA["laranja"],
    COR_DE_ROUPA["verde_escuro"],
]
