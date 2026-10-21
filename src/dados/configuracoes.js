// Configurações
//
// São da máquina, não da partida: ficam guardadas à parte e não somem com
// "Nova partida". Se o navegador bloquear o armazenamento, valem até a página
// ser recarregada.

const CHAVE_NO_NAVEGADOR = "jogo-scrum:configuracoes";

const PADRAO = {
    mostrarFps: false
};

let atuais = null;

export function lerConfiguracoes() {
    if (atuais) {
        return atuais;
    }

    atuais = Object.assign({}, PADRAO);

    try {
        const texto = window.localStorage.getItem(CHAVE_NO_NAVEGADOR);
        Object.assign(atuais, texto ? JSON.parse(texto) : {});
    } catch (erro) {
        return atuais;
    }

    return atuais;
}

export function salvarConfiguracao(chave, valor) {
    const configuracoes = lerConfiguracoes();
    configuracoes[chave] = valor;

    try {
        window.localStorage.setItem(CHAVE_NO_NAVEGADOR, JSON.stringify(configuracoes));
    } catch (erro) {
        return configuracoes;
    }

    return configuracoes;
}
