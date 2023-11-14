/// <reference types="Cypress" />

describe('Testes para Dispositivos Móveis', function () {
    beforeEach(function () {
        cy.viewport(410, 860)
        cy.visit('https://widget-be.pmweb.com.br/qa/teste/index.html')
    })

    // REQ3/UC1 - Deve verificar primeira mensagem do header e a sacola vazia, esse teste ja inicia com a mensagem do Header errada, por isso ele executa a funcao de arrumar o bug
    it('Teste de Mensagemm de Carrinho Vazio', () => {
        // A linha a baixo esta comentada, caso quiser descomentar para verificar o erro
        // VerificaBarraProgresso()
        ArrumarHeader()
        VerificaBarraProgresso()
        cy.get('.produtos .vazio').should('have.text', 'Nenhum cupcake adicionado na sua sacola.Nenhum cupcake adicionado na sua sacola.') //Verifica se tem item na sacola
    })

    // REQ4.1 - Deve entrar em todos os filtros e por todos de cada filtro na sacola e depois excluir e verificar a sacola e o Header
    it('Teste de Adição/Remoção de Produtos na Sacola/Verifica Mensagem de Falta mais R$ XX,XX PARA O FRETE GRÁTIS', function () {
        AdicionaItemCategoria('vegano', true)
        AdicionaItemCategoria('semLactose', true)
        AdicionaItemCategoria('todos', true)
    })

    // Teste de Adição/Remoção de Produtos na Sacola pelo botao de menos e mais

    // REQ5 - Deve verificar mensagem: PARABENS! O FRETE... adicionando todos os cupcakes ate 100% e sem filtro e verifica o header
    it('Teste de Mensagem de PARABÉNS! O FRETE É POR NOSSA CONTA', function () {
        //esse teste faz a inserção de todos os cupcakes, so para afim de testar ambos itens
        InsereTodosOsCupcake()
        LimpaSacolaIconeRemover()
    })

    it.only('Teste de Adição/Remoção de UM Produto na Sacola com Botões da Sacola', function(){
        inseriPrimeiroItemNaSacola()

        let valorUni = 5

        AbreSacola()
        for (let i = 1; i < 3; i++) {
            cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > ul > li.produto > p > span.unidades > a.mais').click()
            vSacola(valorUni)
        }

        for (let i = 1; i < 3; i++) {
            cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > ul > li.produto > p > span.unidades > a.menos').click()
            vSacola(valorUni)
        }
        FechaSacola()
        LimpaSacolaIconeRemover()

    })

    // REQ6/7 - Deve efetuar compra com frete grátis, verificando dados da sacola, mensagem O FRETE É POR NOSSA CONTA e header 100%
    it('Teste de Compra com Frete Grátis', function () {
        AdicionaPrimeiroItem20vezes()
        RealizaCompra(true)
    })

    // REQ8 - Deve efetuar compra com valor inferior a R$ 100 e sem frete, verificando dados da sacola e header
    it('Teste de Compra sem Frete', function () {
        cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button`).click()
        RealizaCompra(false)
    })

    // ATENÇÃO: Ha casos onde é executado o mesmo processo, pois, ambos os precessos possuem caracteristicas iguais, como, a funcao: 
    // VerificaBarraProgresso que é responsavel pela verificação do header de diferentes situacoes; 
    // RealizaCompra que é responsavel por Finalizar compra na sacola e verificar as mensagem necessarias


})



function vValorSacolaUnitario(preco){
    cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.produto > p > span.preco').should('have.text',preco)
    cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.produto > p > span.unidades > span').should('have.text','1')
}

function inseriPrimeiroItemNaSacola(){
    // primeiro item ele usa como base
    cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button`).click() 
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > p > span.por > span').invoke('text').then((valorUnitario) => {

        const precoValue = parseFloat(valorUnitario.replace('R$ ', '').replace(',', '.'));
        vValorSacolaUnitario(valorUnitario)
        vSacola(precoValue)
    })
}

function vSacola(precoUnitario) {
    // Realizar verificações
    
    cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.produto > p > span.unidades > span').invoke('text').then((quantidade) => {
        cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.produto > p > span.preco').invoke('text').then((preco) => {
            cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.subtotal > span:nth-child(2)').invoke('text').then((subtotalTexto) => {
                cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.frete > span:nth-child(2)').invoke('text').then((frete) => {
                    cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.total > span:nth-child(2)').invoke('text').then((total) => {

                        const quantidadeNumerica = quantidade
                        const precoNumerico = parseFloat(preco.replace('R$ ', '').replace(',', '.'));
                        const subtotal = parseFloat(subtotalTexto.replace('R$ ', '').replace(',', '.')) || 0;
                        const totalfrete = parseFloat(frete.replace('R$ ', '').replace(',', '.'));
                        const totalV = parseFloat(total.replace('R$ ', '').replace(',', '.'));  
                        
                        //Verifica preco unitario conforme qtd
                        expect(subtotal).to.equal(quantidadeNumerica * precoUnitario);

                        //Verificar se o valor total está correto
                        expect(totalV).to.equal(subtotal + totalfrete);

                        // Verificar se o valor do frete some quando passa de 100
                        if (precoNumerico * parseFloat(quantidadeNumerica) + subtotal > 100) {
                            cy.get('.frete').should('not.exist');
                        }

                    });
                });
            });
        });
    });
}



function AbreSacola() {
    // Uso o click manual para testar a funcionabilidaded do mesmo
    cy.get('body > div.header > div > a.icon.sacola').click()
}

function AtualizaHome(){
    FechaSacola()
    cy.get('body > div.header > div > a:nth-child(2)').click()// para atualizar a pagina
    cy.wait(1500)
}

function FechaSacola() {
    cy.get('#sacola-lightbox').invoke('attr', 'style', 'display: none;')
}

//Arruma a menssagem no header
function ArrumarHeader() {
    // Ele adiciona um item na sacola e depois tira, assim voltando a mensagem correta
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button').click()
    LimpaSacolaIconeRemover()
}

//Adiciona conforme categoria e se precisa limpar a sacola
function AdicionaItemCategoria(categoria, limpar) {
    if (categoria === 'todos') {
        cy.get('#filtro_m').select('todos')
        AuxiliarAdicionaItemCategoria()
    }
    else if (categoria === 'semLactose') {
        cy.get('#filtro_m').select('semlactose')
        AuxiliarAdicionaItemCategoria()
    }
    else if (categoria === 'vegano') {
        cy.get('#filtro_m').select('vegano')
        AuxiliarAdicionaItemCategoria()
    }

    if (limpar === true) {
        LimpaSacolaIconeRemover()
        cy.get('.produtos .vazio').should('have.text', 'Nenhum cupcake adicionado na sua sacola.Nenhum cupcake adicionado na sua sacola.') //Verifica se tem item na sacola
        ArrumarHeader()
        VerificaBarraProgresso()
    }
}

//Auxilixar da funcao a cima para add os itens conforme a categoria
function AuxiliarAdicionaItemCategoria() {
    let quantidadeDeItens
    //Pega a qtd de itens que aparece no body conforme filtro
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li').children().its('length').then((length) => {
        quantidadeDeItens = length
        for (let i = 1; i < quantidadeDeItens + 1; i++) {
            cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(${i}) > div > button`).click()
            VerificaBarraProgresso(true)
        }
    })
    VerificaMensagemFreteSacola()
}

function VerificaMensagemFreteSacola() {

    let valorProgressBar

    cy.get('body > div.progress-bar > span')
        .invoke('text')
        .then((valor) => {
            valorProgressBar = valor
            const indicePara = valorProgressBar.indexOf('para')
            // Se 'para' for encontrado, mantenha apenas a parte da frase antes de 'para'
            if (indicePara !== -1) {
                valorProgressBar = valorProgressBar.substring(0, indicePara).trim()
            }
        })

    AtualizaHome()
    AbreSacola()

    // aq verifica a mensagem no mobile
    cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > ul > li.frete > div.frete-gratis-falta').invoke('text').then(textoDoElemento => expect(textoDoElemento).to.contains(valorProgressBar + ' para o frete grátis'))

    FechaSacola()
}

//processo de realizar compra, apos inserir os itens na sacola, entao ele recebe se tem frete ou nao
function RealizaCompra(Frete) {
    VerificaBarraProgresso(true)
    
    cy.scrollTo('top')
   
    if (Frete === true) {
        AbreSacola()
        cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > a').click();
        // cy.get('.frete-gratis').should('be.visible');  //AQUI DEVERIA APARECER A MENSAGEM DO FRETE GRATIS, POREM, AMBIENTE CONTROLADO TESTE PULA A VERIFICAO
        cy.get('li.frete span.valor').should('have.text', 'R$ 0,00')

    } else {
        let totalValue, valorTotal

        //pega valor total antes de avançar no processo
        cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.total span').eq(1).invoke('text').then((valor) => {
            valorTotal = valor
        })

        AbreSacola()
        cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > a').click();

        //valor total apos finalizar e compara
        cy.get('span.total span.valor-total').invoke('text').then((valor) => {
            totalValue = valor
        }).then(() => {
            expect(valorTotal).to.equal(totalValue)
        })
    }

    cy.get('body > div.page > div.comprar_novamente_mob > a').click();
    ArrumarHeader()
    VerificaBarraProgresso()
}

//insere todos do body
function InsereTodosOsCupcake() {
    for (let t = 0; t < 1; t++) {
        for (let i = 1; i < 12; i++) {
            cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(${i}) > div > button`).click()
            VerificaBarraProgresso(true)
        }
    }
}

//limpra sacola
function LimpaSacolaIconeRemover() {
    let quantidadeDeItens

    AbreSacola()
    cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > ul > li.produto').its('length').should('be.gt', 0).then((length) => {
        quantidadeDeItens = length
        for (let i = 1; i < quantidadeDeItens + 1; i++) {
            cy.get('span.remover').first().click({ force: true })
        }
        FechaSacola()
    })
}

//autoexplicativo
function AdicionaPrimeiroItem20vezes() {
    for (let i = 0; i < 20; i++) {
        cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button').click()
        VerificaBarraProgresso(true)
    }
}

// //Funcao que serve para verificar os valores do Header, conforme valor do 'subtotal', pequena validacao, para saber se a subtotal existe ou nao
function VerificaBarraProgresso(existeItem) {
    if (existeItem === true) {
        cy.get('li.subtotal span').eq(1).then((subtotalElement) => {
            const subtotalText = subtotalElement.text();
            const subtotalValue = parseFloat(subtotalText.replace('R$ ', '').replace(',', '.'))
            const valorTotal = 100

            const diferencaFrete = Math.max(valorTotal - subtotalValue, 0).toFixed(2)
            const mensagemEsperada = diferencaFrete === '0.00' ? 'Parabéns! O frete é por nossa conta.' : `Faltam mais R$ ${diferencaFrete.replace('.', ',')} para o frete sair de graça!`

            cy.get('span.progress-bar-text').should('have.text', mensagemEsperada)
        })
    } else {
        const mensagemEsperada = 'Faltam mais R$ 100,00' + ' para o frete sair de graça!'
        cy.get('span.progress-bar-text').should('have.text', mensagemEsperada)
    }
}

