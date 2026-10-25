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
# óculos cristal: armação redonda, quase incolor, com um brilho na lente
COR_DA_ARMACAO_CRISTAL = "#b9d2e4"
COR_DO_BRILHO_DA_LENTE = "#ffffff"

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

# decoração do escritório
COR_DA_FOLHA = "#5c9e62"
COR_DA_FOLHA_ESCURA = "#3a7042"
COR_DO_VASO = "#b0704c"
COR_DA_BORDA_DO_VASO = "#8a5438"
COR_DO_PAPEL = "#fbfcfe"
COR_DA_LINHA_DO_PAPEL = "#9fb0cf"
COR_DO_POST_IT = ["#f2c94c", "#e88ca0", "#6ea0d2"]
COR_DA_MADEIRA = "#a47652"
COR_DA_MADEIRA_CLARA = "#be9169"
COR_DA_MADEIRA_ESCURA = "#7a543a"
COR_DO_ESTOFADO = "#5f7ba8"
COR_DO_ESTOFADO_ESCURO = "#425c86"
COR_DO_METAL = "#b4bccc"
COR_DO_METAL_ESCURO = "#78829a"
COR_DO_VIDRO = "#bedcf5"
COR_DA_NUVEM = "#e6f0fa"
COR_DO_LIVRO = "#7a4bb5"
COR_DA_LOMBADA = "#5a328c"
COR_DA_TELA_DO_TABLET = "#e8a0be"
COR_DA_MOCHILA = "#3c465a"
COR_DO_CAFE = "#78502f"
COR_DA_AREIA = "#f2c94c"
COR_DO_TROFEU = "#e6c85a"
COR_DO_BRILHO_DO_TROFEU = "#f0d76e"
COR_DA_PORTA = "#c9d3e6"
COR_DA_MACANETA = "#5f7ba8"

# ------------------------------------------------------------------
# logo da Catavento: as pás alternam estas cores, da pá de cima em sentido
# horário; o contorno de cada pá sai da cor dela

CORES_DO_CATAVENTO = ("#ffffff", "#c20505")

# ------------------------------------------------------------------
# peças desbloqueáveis: o que nelas tem cor fixa

COR_DO_COLETE = "#ef7d22"
COR_DA_FAIXA_REFLETIVA = "#f6f2c8"
COR_DO_ALVO = "#c20505"
COR_DO_ALVO_CLARO = "#ffffff"
COR_DO_VISTO = "#3f7a52"
COR_DO_CONTORNO_DO_VISTO = "#ffffff"
COR_DA_LINHA_DO_POST_IT = "#b89a3a"
COR_DA_DOBRA_DO_POST_IT = "#c9a640"
COR_DA_CAMISETA_CATAVENTO = "#16171b"
COR_DO_SELO = "#ffffff"
COR_DO_X_DO_SELO = "#c20505"
