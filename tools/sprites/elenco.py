# Elenco

from .paleta import COR_DE_CABELO, COR_DE_CALCA, COR_DE_ROUPA, TOM_DE_PELE

# cada personagem é uma combinação: cabelo, cor do cabelo, roupa, acessório, pele
ELENCO = {
    "marcia": ("franja_reta", "preto", "vermelho", "oculos", "clara"),
    "renan": ("raspado", "preto", "azul_petroleo", "caderno", "escura"),
    "bia": ("coque_alto", "castanho", "roxo", "oculos", "parda"),
    "caio": ("topete", "castanho_claro", "laranja", "fone", "clara"),
    "lu": ("curto_liso", "verde_agua", "cinza_claro", None, "media"),
    "gustavo": ("curto_liso", "grisalho", "cinza_azulado", None, "clara"),
    "estela": ("coque_baixo", "grisalho", "bege", "pasta", "escura"),
    "helio": ("curto_liso", "castanho", "verde_escuro", "provas", "parda"),
    "sandra": ("rabo_cavalo", "loiro", "lilas", "oculos", "clara"),
}

AVATAR_DO_JOGADOR = ("curto_liso", "castanho", "branco", None, "media")

# o mesmo avatar como o editor de personagem vai guardar: peças por nome,
# cores em #rrggbb com a chave da categoria; oculos é a cor da armação,
# "cristal" ou None; acessorio é "fone" ou None
APARENCIA_PADRAO = {
    "pele": TOM_DE_PELE["media"],
    "estilo_de_cabelo": "curto_liso",
    "cabelo": COR_DE_CABELO["castanho"],
    "peca_de_cima": "camiseta",
    "superior": COR_DE_ROUPA["branco"],
    "interna": COR_DE_ROUPA["cinza_claro"],
    "peca_de_baixo": "calca",
    "inferior": COR_DE_CALCA,
    "oculos": None,
    "acessorio": None,
}

# as três expressões de retrato, na ordem em que entram nas folhas
EXPRESSOES = ("neutro", "tenso", "aprovacao")

ESTILOS_DE_CABELO = (
    "curto_liso", "franja_reta", "raspado", "coque_alto",
    "coque_baixo", "topete", "rabo_cavalo",
)
