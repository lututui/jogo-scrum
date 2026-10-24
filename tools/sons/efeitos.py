# Efeitos de interface e de retorno
#
# Curtos e macios: o jogo é de leitura, e o som só confirma o que a tela já
# mostra. Nenhum efeito diferencia opção boa de ruim.

from .sintese import (TAXA, ganho, hz, juntar, misturar, normalizar, passa_baixa,
                      ruido, silencio, sino, suavizar_pontas, tom)

PICO = 0.6


def acabar(sinal, corte=4000):
    return normalizar(suavizar_pontas(passa_baixa(sinal, corte)), PICO)


# mover o cursor numa lista
def cursor():
    return normalizar(acabar(tom(hz(84), 0.025, ciclo=0.5, queda=0.02, sustenta=0.2, solta=0.02), 3000), PICO * 0.6)


# confirmar uma escolha (vale para qualquer opção)
def confirmar():
    return ganho(acabar(juntar(
        tom(hz(76), 0.04, ciclo=0.25, sustenta=0.5, solta=0.01),
        tom(hz(83), 0.09, ciclo=0.25, sustenta=0.5, solta=0.06))), 0.7)


# voltar ou fechar
def voltar():
    return ganho(acabar(juntar(
        tom(hz(76), 0.04, ciclo=0.25, sustenta=0.5, solta=0.01),
        tom(hz(69), 0.08, ciclo=0.25, sustenta=0.5, solta=0.05))), 0.7)


# cartão mudando de coluna: um sopro que desce e um toque no fim
def cartao():
    sopro = passa_baixa(ruido(0.14, queda=12, semente=3), lambda t: 3500 - 18000 * t)
    toque = tom(hz(79), 0.02, forma="triangulo", queda=0.02, sustenta=0.0, solta=0.03)
    return acabar(misturar(ganho(sopro, 1.6), toque, inicio=0.11, ganho=0.6), 5000)


# cartão que continua parado: duas notas graves e curtas
def parado():
    return acabar(juntar(
        tom(hz(55), 0.08, forma="triangulo", sustenta=0.7, solta=0.04),
        silencio(0.03),
        tom(hz(50), 0.16, forma="triangulo", sustenta=0.7, solta=0.12)), 1800)


# imprevisto no calendário: dois toques, como um aviso de mensagem
def imprevisto():
    nota = lambda m: tom(hz(m), 0.07, forma="triangulo", sustenta=0.6, solta=0.05)
    return acabar(juntar(nota(79), silencio(0.02), nota(74), silencio(0.02), nota(79)), 3500)


# o dia avançou
def dia():
    return acabar(misturar(sino(hz(84), 1.2), sino(hz(79), 1.2), inicio=0.12, ganho=0.7), 6000)


# alguém no escritório ganhou o "!"
def aviso():
    return acabar(sino(hz(88), 0.5, parciais=((1.0, 1.0, 7.0), (2.0, 0.3, 10.0))), 6000)


# Review, síntese e fim
def vinheta():
    som = silencio(1.3)
    for k, m in enumerate((72, 76, 79)):
        misturar(som, tom(hz(m), 0.1, forma="triangulo", sustenta=0.6, solta=0.08), inicio=k * 0.12)
        misturar(som, tom(hz(m), 0.1, ciclo=0.25, sustenta=0.4, solta=0.08), inicio=k * 0.12, ganho=0.25)
    misturar(som, tom(hz(84), 0.45, forma="triangulo", sustenta=0.5, solta=0.4, vibrato=0.004), inicio=0.36)
    misturar(som, tom(hz(48), 0.6, forma="triangulo", sustenta=0.6, solta=0.3), inicio=0.36, ganho=0.6)
    return acabar(som, 4500)


# conquista desbloqueada
def conquista():
    som = silencio(1.1)
    for k, m in enumerate((79, 84, 88, 91)):
        misturar(som, tom(hz(m), 0.07, ciclo=0.25, sustenta=0.5, solta=0.1), inicio=k * 0.07)
    misturar(som, sino(hz(96), 0.7, parciais=((1.0, 1.0, 6.0), (2.0, 0.3, 9.0))), inicio=0.3, ganho=0.5)
    return acabar(som, 7000)


EFEITOS = {
    "cursor": cursor,
    "confirmar": confirmar,
    "voltar": voltar,
    "cartao": cartao,
    "parado": parado,
    "imprevisto": imprevisto,
    "dia": dia,
    "aviso": aviso,
    "vinheta": vinheta,
    "conquista": conquista,
}
