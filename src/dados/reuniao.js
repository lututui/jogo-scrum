// Sala de reunião
//
// Posições em volta da mesa redonda. Os assentos são ocupados na ordem em que
// o evento declara seus participantes, e o jogador senta sempre de frente para
// a mesa, na base da tela.

export const MESA = {x: 480, y: 236};

export const ASSENTOS = [
    {x: 388, y: 182},
    {x: 572, y: 182, espelhado: true},
    {x: 300, y: 236},
    {x: 660, y: 236, espelhado: true},
    {x: 388, y: 292},
    {x: 572, y: 292, espelhado: true}
];

export const ASSENTO_DO_JOGADOR = {x: 480, y: 316};
