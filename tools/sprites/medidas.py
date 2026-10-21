# Medidas e o retângulo, base de todo desenho

LARGURA_SPRITE = 32
ALTURA_SPRITE = 32
CABECA_X = 11
CABECA_Y = 5

LARGURA_RETRATO = 72
ALTURA_RETRATO = 96
RECORTE_RETRATO = (7, 0, 25, 24)

QUADROS = 3


# retângulo de w por h pixels a partir de (x, y)
def r(d, x, y, w, h, cor):
    if w <= 0 or h <= 0:
        return
    d.rectangle([x, y, x + w - 1, y + h - 1], fill=cor)
