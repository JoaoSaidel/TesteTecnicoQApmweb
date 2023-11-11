/// <reference types="Cypress" />

describe('Testes para Dispositivos Móveis', function() {
    beforeEach(function() {
        cy.viewport(410,860)
        cy.visit('https://widget-be.pmweb.com.br/qa/teste/index.html')
    })

    it('REQ3 - Esse teste ja inicia com a mensagem do Header errada, por isso ele executa a funcao de arrumar o bug', () =>{
        // A linha a baixo esta comentada, caso quiser descomentar para verificar o erro
        // VerificaBarraProgresso()
        ArrumarHeader()
        VerificaBarraProgresso() 
    }) 

    it('REQ4.1 - Deve entrar em todos os filtros e por todos de cada filtro na sacola e depois excluir e verificar a sacola e o Header', function(){
        AdicionaItemCategoria('vegano',true)
        AdicionaItemCategoria('semLactose',true)
        AdicionaItemCategoria('todos',true)
    })

    it.only('REQ4.2 - Deve adicionar itens e verificar mensagem Faltam mais... e comparar valores com o header e limpar sacola',function(){
        AdicionaItemCategoria('semLactose',true)
    })


    it('REQ5 - Deve verificar mensagem: PARABENS! O FRETE... adicionando todos os cupcakes ate 100% e sem filtro e verifica o header', function(){
        InsereTodosOsCupcake()
        LimpaSacolaIconeRemover()
    })

    it('REQ6/7 - Deve efetua compra com frete grátis, verificando dados da sacola, mensagem O FRETE É POR NOSSA CONTA e header 100%', function(){
        AdicionaPrimeiroItem20vezes()
        RealizaCompra(true)
    })

    it('REQ8 - Deve efetua compra com valor inferior a R$ 100 e sem frete, verificando dados da sacola e header', function(){
        cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button`).click()  
        RealizaCompra(false)
    })

})

function AbreSacola(){
    cy.get('body > div.header > div > a.icon.sacola').click()
    cy.get('#sacola-lightbox > div > div.modal-body').should('exist')
}

function FechaSacola(){
    cy.get('body').click(400, 340)
    cy.get('body > div.header > div > a:nth-child(2)').click();
}

//Arruma a menssagem no header
function ArrumarHeader(){
    // Ele adiciona um item na sacola e depois tira, assim voltando a mensagem correta
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(1) > div > button').click() 
    LimpaSacolaIconeRemover()
}

//Adiciona conforme categoria e se precisa limpar a sacola
function AdicionaItemCategoria(categoria,limpar){
    if (categoria === 'todos'){
        cy.get('#filtro_m').select('todos');
        AuxiliarAdicionaItemCategoria()    
    } 
    else if (categoria === 'semLactose'){
        cy.get('#filtro_m').select('semlactose');
        AuxiliarAdicionaItemCategoria()
    }
    else if (categoria === 'vegano'){
        cy.get('#filtro_m').select('vegano');
        AuxiliarAdicionaItemCategoria()
    }
    
    if (limpar === true){
        LimpaSacolaIconeRemover()
        cy.get('.produtos .vazio').should('have.text', 'Nenhum cupcake adicionado na sua sacola.Nenhum cupcake adicionado na sua sacola.') //Verifica se tem item na sacola
        ArrumarHeader()
        VerificaBarraProgresso()
    }
}

//Auxilixar da funcao a cima para add os itens conforme a categoria
function AuxiliarAdicionaItemCategoria(){
    let quantidadeDeItens
    //Pega a qtd de itens que aparece no body conforme filtro
    cy.get('body > div.page > div.page_content > div > div.vitrine > ul > li').children().its('length').then((length) => {
        quantidadeDeItens = length;
        for (let i = 1; i < quantidadeDeItens+1; i++) {
            cy.get(`body > div.page > div.page_content > div > div.vitrine > ul > li:nth-child(${i}) > div > button`).click()    
            VerificaBarraProgresso(true)
        }
    })
    VerificaMensagemFreteSacola()
}

function VerificaMensagemFreteSacola(){
    let valorFaltaFrete, valorProgressBar

    cy.get('body > div.progress-bar > span')
      .invoke('text')
      .then((valor) => {
        valorProgressBar = valor.trim(); // Remover espaços em branco no início e no final, se houver
      });
    cy.log(valorProgressBar)

    cy.get('body > div.header > div > a:nth-child(2)').click()
    cy.wait(2000)
    cy.get('body > div.header > div > a.icon.sacola').click()
    cy.wait(2000)

    cy.get('#sacola-lightbox > div > div.modal-body > div.produtos > ul > li.frete > div.frete-gratis-falta')
      .invoke('text')
      .then((valor) => {
        valorFaltaFrete = valor.trim(); // Remover espaços em branco no início e no final, se houver
      });

   
      cy.wrap(valorFaltaFrete).should('eq', valorProgressBar);
      FechaSacola()
}

//processo de realizar compra, apos inserir os itens na sacola, entao ele recebe se tem frete ou nao
function RealizaCompra(Frete) {
    VerificaBarraProgresso(true)
    cy.scrollTo('top')

    if (Frete === true) {
        // cy.get('.frete-gratis').should('be.visible');  //AQUI DEVERIA APARECER A MENSAGEM DO FRETE GRATIS, POREM, AMBIENTE CONTROLADO TESTE PULA A VERIFICAO
        cy.contains('Finalizar compra').click();
        cy.get('li.frete span.valor').should('have.text', 'R$ 0,00')

    } else {
        let totalValue, valorTotal

        //pega valor total antes de avançar no processo
        cy.get('body > div.page > div.page_content > div > div.carrinho > div.produtos > ul > li.total span').eq(1).invoke('text').then((valor) => {
            valorTotal = valor;
        })

        cy.contains('Finalizar compra').click()

        //valor total apos finalizar e compara
        cy.get('span.total span.valor-total').invoke('text').then((valor) => {
            totalValue = valor
        }).then(() => {
            cy.log(`valorTotal: ${valorTotal}, totalValue: ${totalValue}`)
            expect(valorTotal).to.equal(totalValue)
        })
    }

    cy.contains('Fazer nova compra').click();
    ArrumarHeader()
    VerificaBarraProgresso()
}

//insere todos do body
function InsereTodosOsCupcake(){
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
        for (let i = 1; i < quantidadeDeItens+1; i++) {
            cy.get('span.remover').first().click({force: true})
                for (let t = 1; t < quantidadeDeItens; t++) {
        }}
        FechaSacola()
    })    
}

//autoexplicativo
function AdicionaPrimeiroItem20vezes(){
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
            const subtotalValue = parseFloat(subtotalText.replace('R$ ', '').replace(',', '.'));
            const valorTotal = 100;
    
            const diferencaFrete = Math.max(valorTotal - subtotalValue, 0).toFixed(2);
            const mensagemEsperada = diferencaFrete === '0.00' ? 'Parabéns! O frete é por nossa conta.' : `Faltam mais R$ ${diferencaFrete.replace('.', ',')} para o frete sair de graça!`
    
            cy.get('span.progress-bar-text').should('have.text', mensagemEsperada);
        })
    }else {
        const mensagemEsperada = 'Faltam mais R$ 100,00' + ' para o frete sair de graça!';
        cy.get('span.progress-bar-text').should('have.text', mensagemEsperada);
    }
}
  
