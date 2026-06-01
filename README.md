# CompraColetiva - Plataforma de Descontos em Grupo

O **CompraColetiva** é uma aplicação web desenvolvida para conectar consumidores interessados em adquirir produtos a preços reduzidos. A plataforma viabiliza descontos exclusivos através de compras em grupo: a oferta só é validada e processada se um número mínimo preestabelecido de compradores aderir à campanha dentro do prazo estipulado.

---

## Protótipo do Projeto
Você pode visualizar o design da interface e o fluxo do usuário através do link abaixo:
> 🔗 **[Link para o Protótipo no Figma](https://www.figma.com/make/9DBZVzESVT8CvsAX2A3G55/Alta-fidelidade-Compras-Coletivas?fullscreen=1&t=hEOnIklDQX2lKyOm-1)**

---

## Sobre o Projeto
Este projeto foi concebido com foco em entregar um Mínimo Produto Viável (MVP) funcional para gerenciar grupos de compra. A arquitetura foi dividida entre um Front-end reativo e um Back-end leve para processamento das adesões.

### Principais Funcionalidades
* **Vitrine de Ofertas:** Listagem de produtos disponíveis com indicadores visuais de progresso (quantos compradores faltam).
* **Adesão Simplificada:** Sistema rápido de entrada no grupo de compra com apenas um clique.
* **Validação de Metas:** Bloqueio automático de ofertas expiradas ou que já bateram a meta estipulada.

---

## Tecnologias Utilizadas
* **HTML5**
* **CSS3**
* **JavaScript**
* **MySQL**

---

## Backlog do Produto (Sprints)

O desenvolvimento está dividido em 3 Sprints focadas em garantir as entregas graduais (Mockup Front-end -> Integração Fullstack):

### Sprint 1: Interface e Mockup
*Foco: Criação visual e roteamento estático.*

| ID | História de Usuário (User Story) | Prioridade |
| :--- | :--- | :---: |
| **US01** | Como usuário, quero visualizar uma lista de ofertas ativas na página inicial. | Alta |
| **US02** | Como usuário, quero ver os detalhes de um produto, incluindo preço com desconto e meta de compradores. | Alta |
| **US03** | Como usuário, quero filtrar as ofertas na tela inicial pelo nome do produto. | Média |

### Sprint 2: Estado e Lógica Front-end
*Foco: Fazer a interface reagir às ações do usuário usando dados locais.*

| ID | História de Usuário (User Story) | Prioridade |
| :--- | :--- | :---: |
| **US04** | Como usuário, quero clicar em "Participar" e ver a barra de progresso da meta aumentar em tempo real. | Alta |
| **US05** | Como sistema, quero impedir que o usuário participe mais de uma vez da mesma oferta na mesma sessão. | Alta |
| **US06** | Como sistema, quero alterar o status visual da oferta para "Concluída" assim que a meta for atingida. | Alta |

### Sprint 3: API e Integração
*Foco: Substituir dados falsos por requisições HTTP reais para o servidor Node.*

| ID | História de Usuário (User Story) | Prioridade |
| :--- | :--- | :---: |
| **US07** | Como front-end, quero buscar a lista de ofertas dinamicamente do servidor Node (GET). | Alta |
| **US08** | Como usuário, quero que minha adesão à oferta seja enviada e processada pelo servidor (POST). | Alta |
| **US09** | Como servidor (Node), quero validar se a oferta ainda está no prazo antes de aceitar um novo participante. | Média |

---

## Lógicas JavaScript Principais (Lista de JavaScript)

Para sustentar as funcionalidades acima, os seguintes blocos de lógica em JavaScript serão implementados:

1.  **Cadastro e Login de usuário (com validações e sessão persistente)**: `register()`, `login()`.
2.  **Criação de grupos de compra com preço, meta e categoria**: `createGroup()`.
3.  **Participar / Sair de grupos com contador em tempo real**: `joinGroup()`, `leaveGroup()`.
4.  **Listagem e busca de ofertas com filtro e progresso visual**: `renderOffers()`, `filterOffers()`.
`
## Configurar o banco MySQL
 
---
 
### Usuários
 
| Método | Rota | Body (JSON) | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/users` | — | Lista todos os usuários |
| `POST` | `/users/register` | `{ "name": "João Silva", "email": "joao@email.com", "password": "123456" }` | Cadastra usuário |
| `POST` | `/users/login` | `{ "email": "joao@email.com", "password": "123456" }` | Login |
 
---
 
### Grupos de Compra
 
| Método | Rota | Body (JSON) | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/groups` | — | Lista todas as ofertas |
| `POST` | `/groups` | `{ "creator_id": 1, "name": "Tênis Nike", "description": "Tamanhos 38-44", "category": "Moda", "original_price": 699, "price": 459, "goal": 15 }` | Cria grupo |
 
---
 
### Participar / Sair de Grupos
 
| Método | Rota | Body (JSON) | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/groups/1/members` | — | Lista membros do grupo |
| `POST` | `/groups/1/members` | `{ "user_id": 2 }` | Entrar no grupo |
| `DELETE` | `/groups/1/members/2` | — | Sair do grupo |
