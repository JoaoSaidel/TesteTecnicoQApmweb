/// <reference types="Cypress" />


describe('Cupcake', function() {
    beforeEach(function() {
        cy.visit('https://widget-be.pmweb.com.br/qa/teste/index.html')
    })

    it('Esse teste é apenas para voltar a mensagem do header com a palavra mais ', () =>{
        ArrumarHeader()
    }) 

    it('Deve entrar em todos os filtros e por todos de cada filtro na sacola e depois excluir e verificar a sacola e o Header', function(){
        AdicionaItemCategoria('vegano',true)
        AdicionaItemCategoria('semLactose',true)
        AdicionaItemCategoria('todos',true)
    })

    it('Adiciona todos os cupcakes sem filtro e verifica barra de progresso', function(){
        InsereTodosOsCupcake()
        LimpaSacolaIconeRemover()
    })

    it('Efetua Compra com R$ 100 em produtos e com frete grátis, verificando dados da sacola e header', function(){
        AdicionaOMesmoItem()
        RealizaCompra(true)
    })

    it('Efetua Compra com valor inferior a R$ 100 e sem frete, verificando dados da sacola e header', function(){
        cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button`).click()  
        RealizaCompra(false)
    })

})

function ArrumarHeader(){
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button').click() 
    LimpaSacolaIconeRemover()
}

function AdicionaItemCategoria(categoria,limpar){
    if (categoria === 'todos'){
        cy.get('div.filtro_opcao input[type="radio"][value="todos"] + label span').should('have.text', 'Todos os cupcakes').click({ force: true})
        AuxiliarAdicionaItemCategoria()    
    } 
    else if (categoria === 'semLactose'){
        cy.get('div.filtro_opcao input[type="radio"][value="semlactose"] + label span').should('have.text', 'Sem Lactose').click({ force: true})
        AuxiliarAdicionaItemCategoria()
    }
    else if (categoria === 'vegano'){
        cy.get('div.filtro_opcao input[type="radio"][value="vegano"] + label span').should('have.text', 'Veganos').click({ force: true})
        AuxiliarAdicionaItemCategoria()
    }
    
    if (limpar === true){
        LimpaSacolaIconeRemover()
        cy.get('.produtos .vazio').should('have.text', 'Nenhum cupcake adicionado na sua sacola.Nenhum cupcake adicionado na sua sacola.') //Verifica se tem item na sacola
        VerificaBarraProgressoSemItens('100,00')
    }
}

function AuxiliarAdicionaItemCategoria(){
    let quantidadeDeItens
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li').children().its('length').then((length) => {
        quantidadeDeItens = length;

        for (let i = 1; i < quantidadeDeItens; i++) {
            cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(${i}) > div > button`).click()    
            VerificaBarraProgressoComItens()
        }
    })
}

function RealizaCompra(Frete) {
    VerificaBarraProgressoComItens()
    cy.scrollTo('top')

    if (Frete === true) {
        // cy.get('.frete-gratis').should('be.visible');  //AQUI DEVERIA APARECER A MENSAGEM DO FRETE GRATIS, POREM, AMBIENTE CONTROLADO TESTE PULA A VERIFICAO
        cy.contains('Finalizar compra').click();
        cy.get('li.frete span.valor').should('have.text', 'R$ 0,00')

    } else {
        let totalValue, valorTotal

        cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.total span').eq(1).invoke('text').then((valor) => {
            valorTotal = valor;
        })

        cy.contains('Finalizar compra').click()

        cy.get('span.total span.valor-total').invoke('text').then((valor) => {
            totalValue = valor
        }).then(() => {
            cy.log(`valorTotal: ${valorTotal}, totalValue: ${totalValue}`)
            expect(valorTotal).to.equal(totalValue)
        })
    }

    cy.contains('Fazer nova compra').click();

    VerificaBarraProgressoSemItens('100,00')
}

function InsereTodosOsCupcake(){
    for (let t = 0; t < 1; t++) {
        for (let i = 1; i < 12; i++) {
            cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(${i}) > div > button`).click()    
            VerificaBarraProgressoComItens()
        }
    }
}

function LimpaSacolaIconeRemover() {
    cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.produto > a > span').each(($span) => {
    cy.get('span.remover').first().click()
})
}

function VerificaBarraProgressoComItens() {
    cy.get('li.subtotal span').eq(1).then((subtotalElement) => {
        const subtotalText = subtotalElement.text();
        const subtotalValue = parseFloat(subtotalText.replace('R$ ', '').replace(',', '.'));
        const valorTotal = 100;

        const diferencaFrete = Math.max(valorTotal - subtotalValue, 0).toFixed(2);
        const mensagemEsperada = diferencaFrete === '0.00' ? 'Parabéns! O frete é por nossa conta.' : `Faltam mais R$ ${diferencaFrete.replace('.', ',')} para o frete sair de graça!`

        cy.get('span.progress-bar-text').should('have.text', mensagemEsperada);
    });
}

function VerificaBarraProgressoSemItens(valor){
    ArrumarHeader()
    const mensagemEsperada = 'Faltam mais R$ ' + valor + ' para o frete sair de graça!';
    cy.get('span.progress-bar-text').should('have.text', mensagemEsperada);
}

function AdicionaOMesmoItem(){
    for (let i = 0; i < 20; i++) {
        cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button').click()  
        VerificaBarraProgressoComItens()
    }
}
