# Sistema de Controle de Materiais - Almoxarifado

## Sobre o projeto

Este projeto consiste em um sistema simples para auxiliar no controle de materiais de um almoxarifado. Ele permite cadastrar novos itens, consultar os materiais existentes, retirar quantidades do estoque e excluir registros quando necessário.

A proposta surgiu a partir da necessidade de melhorar um controle que antes era feito de forma manual, usando planilhas e anotações. Com o sistema, o processo fica mais organizado e mais fácil de acompanhar.

O desenvolvimento foi realizado durante as etapas da Sprint 1, Sprint 2 e Sprint 3, utilizando a MockAPI como base para armazenar e consultar os dados.

## Funcionalidades

O sistema conta com as seguintes funções:

* Cadastro de materiais no estoque;
* Exibição dos materiais cadastrados;
* Pesquisa de materiais pelo nome;
* Contagem do total de itens registrados;
* Baixa de quantidade no estoque;
* Validação para impedir retirada inválida;
* Exclusão de materiais;
* Destaque visual para itens com quantidade abaixo de 10 unidades.

## Tecnologias utilizadas

As tecnologias usadas no projeto foram:

* HTML;
* CSS;
* JavaScript;
* MockAPI.

## API utilizada

Para simular o armazenamento dos dados, foi utilizado um recurso chamado `estoque` na plataforma MockAPI.

Endpoint utilizado:

```text
https://6a31bda67bc5e1c61266204a.mockapi.io/av1/estoque
```

Exemplo da estrutura dos dados:

```json
{
  "id": "1",
  "nome": "nome do material",
  "quantidade": 20
}
```

## Como executar o projeto

Para rodar o projeto, siga os passos abaixo:

1. Baixe ou clone o repositório;
2. Abra a pasta do projeto no Visual Studio Code;
3. Execute o arquivo `index.html` no navegador;
4. Utilize o sistema para cadastrar, listar, pesquisar, baixar e excluir materiais.

O projeto não precisa de instalação de pacotes ou dependências, pois foi desenvolvido com HTML, CSS e JavaScript puro.

## Contrato técnico da atividade

Foram utilizados os IDs e classes solicitados nas instruções da atividade:

```text
input-nome
input-quantidade
btn-cadastrar
lista-materiais
input-retirada
btn-baixar
btn-excluir
input-busca
total-itens
estoque-critico
```

Esses nomes foram mantidos para que a validação automática da atividade consiga identificar os elementos corretamente.

## Observação

Para que as funcionalidades funcionem corretamente, é necessário acesso à internet, pois o sistema se comunica com a MockAPI para buscar, cadastrar, atualizar e excluir os dados.

## Autor

Danilo Ribeiro
