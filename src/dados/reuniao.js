// Sala de reunião
//
// Posições em volta da mesa redonda. Os assentos são ocupados na ordem em que
// o evento declara seus participantes, e o jogador senta sempre de frente para
// a mesa, na base da tela.

export const ESCALA = 2;

export const MESA = {x: 480, y: 240};

export const ASSENTOS = [
    {x: 418, y: 186},
    {x: 542, y: 186, espelhado: true},
    {x: 318, y: 240},
    {x: 642, y: 240, espelhado: true},
    {x: 392, y: 296},
    {x: 568, y: 296, espelhado: true}
];

export const ASSENTO_DO_JOGADOR = {x: 480, y: 306};
