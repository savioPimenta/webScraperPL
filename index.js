const puppeteer = require('puppeteer')
const fs = require('fs')

let scrape = async () => {

    // Realiza a conexão com a página desejada
    const browser = await puppeteer.launch({ headless: true }) // <- define a exibição do browser da raspagem
    const page = await browser.newPage()
    await page.goto('https://www.premierleague.com/stats/top/players/goals?se=-1&cl=-1&iso=-1&po=-1?se=-1')

    // Cria o array de dados brutos
    let dados = []

    // Espera 3 segundos antes de começar a raspagem (tempo médio para a página ser carregada completamente)
    await page.waitFor(3000)

    // Loop de quantas vezes o botão deve ser clicado
    for (let i = 0; i < 119; i++) {

        // Clica no botão "next"
        await page.evaluate(() => document.querySelector('.paginationNextContainer').click())

        // Espera antes de pegar os dados (para garantir a raspagem correta)
        // Obs.: Diminuir o tempo entre um clique e outro pode afetar os dados recuperados
        await page.waitFor(300)

        // Realiza a raspagem 
        const result = await page.evaluate(async () => {

            let jogadores = []

            // Função que retorna os dados da tabela
            function listarItens(element, index, array) {
                let jogador = {}
                jogador.rank = array[index].cells[0].innerText;
                jogador.playerName = array[index].cells[1].innerText;
                jogador.nationality = array[index].cells[3].innerText;
                jogador.goals = array[index].cells[4].innerText
                jogadores.push(jogador)
            }

            // Seleciona o elemento da tabela e chama a função que retorna os dados da tabela
            document.querySelectorAll('tbody.statsTableContainer > tr')
                .forEach(listarItens)

            return jogadores
        })
        // Incrementa o array de dados brutos
        dados.push(result)
    }

    // Cria um array limpo
    arrayJogadores = []

    // Transforma o array de dados brutos em um array único
    for (let i = 0; i < dados.length; i++) { for (let x = 0; x < 20; x++) { arrayJogadores.push(dados[i][x]) } }

    // Cria um array de nacionalidades
    let natios = []

    // Limpa o array pela primeira vez retirando os valores nulos
    let arrayNotNull = arrayJogadores.filter(function (element) {
        return element != null
    })

    // Função que isola as nacionalidades e salva no array natios[]
    let arrayNatios = arrayNotNull.reduce(function (object, item) {
        natio = item.nationality
        natios.push(natio)
        return natio;
    }, {})

    // Reduz o array natios eliminando os dados repetidos  
    let nacionalidades = natios.reduce(function (object, item) {
        if (!object[item]) {
            object[item] = 1;
        } else {
            object[item]++;
        }
        return object;
    }, {})

    // Incrementa o array principal com as nacionalidades (estão incorporadas no final)  
    arrayJogadores.push(nacionalidades)

    // Cria um array sem elementos nulos
    let arrayFinal = arrayJogadores.filter(function (element) {
        return element != null
    })

    // Fecha o browser da raspagem
    browser.close()

    // Salva o arquivo txt
    fs.writeFile("output.txt", JSON.stringify(arrayFinal, null, ' '), (err) => {

        if (err) throw err;

        console.log('The file has been saved!');
    })

    // Retorna o array final
    return arrayFinal
};
scrape().then((value) => {
    //console.log(value)
})