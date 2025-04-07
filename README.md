# JustAI - Sistema de Consulta Jurídica Inteligente 🤖⚖️
### Metalúrgica Mococa S/A
**Autor:** João Pedro Pizoli Carvalho

## 📜 Sobre o Projeto
O JustAI é um sistema de consulta jurídica inteligente desenvolvido para auxiliar na pesquisa e análise de jurisprudência, combinando tecnologias de web scraping e inteligência artificial para gerar petições personalizadas com base nos resultados obtidos.

O sistema permite aos usuários realizar consultas por tópicos específicos, definir tribunais de interesse e receber uma petição gerada com base nas jurisprudências mais relevantes encontradas.

## 🔧 Estrutura do Projeto
```
JustAI/
├── src/
│   ├── agents/
│   │   ├── agentes.py     # Agentes de IA para processamento de dados
│   │   └── prompts.py     # Prompts utilizados pelos agentes de IA
│   ├── gui/
│   │   ├── assets/
│   │   │   └── image/     # Imagens utilizadas na interface
│   │   ├── css/
│   │   │   ├── index.css  # Estilos para a página inicial
│   │   │   └── result.css # Estilos para a página de resultados
│   │   ├── js/
│   │   │   ├── main.js    # Scripts para a página inicial
│   │   │   └── result.js  # Scripts para a página de resultados
│   │   ├── index.html     # Página inicial da aplicação
│   │   └── result.html    # Página de resultados da consulta
│   ├── utils/
│   │   ├── scrape.py      # Funções para web scraping
│   │   └── url.py         # Funções para manipulação de URLs
│   ├── .env               # Arquivo de variáveis de ambiente (não incluído no repositório)
│   ├── app.py             # Aplicação principal (FastAPI)
│   └── README.md          # Documentação do projeto
```

## ✨ Funcionalidades

- **Consulta Inteligente:** Pesquisa jurisprudências com base em tópicos definidos pelo usuário
- **Seleção de Tribunais:** Filtragem de resultados por tribunais específicos
- **Ordenação de Resultados:** Opção para ordenar por relevância ou data
- **Geração de Petições:** Criação automática de petições com base nas jurisprudências encontradas
- **Exportação de Documentos:** Download das petições geradas em formato PDF ou Word

## 🛠️ Tecnologias Utilizadas

- **Backend:** Python, FastAPI
- **Frontend:** HTML, CSS, JavaScript, Bootstrap
- **Web Scraping:** Crawl4AI
- **Inteligência Artificial:** Google Gemini API
- **Exportação de Documentos:** HTML2PDF, HTML-DOCX

## ⚙️ Requisitos

- Python 3.8+
- Ambiente Ubuntu (para produção)
- Google API Key para Gemini
- Pacotes Python descritos no arquivo requirements.txt

## 🚀 Instalação e Configuração

1. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

2. **Configure o arquivo .env:**
   Crie um arquivo .env na pasta src/ com o seguinte conteúdo:
```
GOOGLE_API_KEY=sua_chave_api_do_google_aqui
```

⚠️ **Importante:** O arquivo .env não está incluído no repositório por questões de segurança.

3. **Execute a aplicação:**
```bash
python app.py
```

4. **Acesse a aplicação:**
   Abra seu navegador e acesse http://localhost:5000

## 🖥️ Execução em Produção
O sistema em produção está hospedado em um servidor Ubuntu. Para iniciar o serviço em modo de produção:
```bash
uvicorn app:app --host 0.0.0.0 --port 5000
```
Para configurar o serviço para iniciar automaticamente com o sistema, consulte a documentação do systemd ou supervisor.

## 🔄 Fluxo de Trabalho

1. **Consulta:**
   - O usuário preenche o tópico desejado e descreve seu caso
   - Seleciona os tribunais de interesse
   - Define a ordem de relevância

2. **Processamento:**
   - A aplicação gera uma URL para consulta no JusBrasil
   - Realiza o scraping das jurisprudências
   - Processa e analisa os resultados usando IA

3. **Geração de Petição:**
   - A IA seleciona as jurisprudências mais relevantes
   - Gera uma petição personalizada com base no caso descrito
   - Apresenta o resultado formatado para o usuário

4. **Exportação:**
   - O usuário pode baixar a petição em formato PDF ou Word

## 📖 Documentação da API
A API está documentada usando Swagger, disponível em http://localhost:5000/docs quando a aplicação estiver em execução.

**Endpoints Principais:**
- `GET /`: Retorna a página inicial
- `POST /api/data`: Processa a consulta jurídica e retorna os resultados

## 📝 Desenvolvimento Futuro
Para contribuir com o projeto ou implementar novas funcionalidades:

1. Faça suas alterações em uma branch separada
2. Documente as mudanças realizadas
3. Solicite uma revisão antes de integrar ao código principal

## ⚠️ Observações Importantes

- O arquivo .env com a chave da API do Google Gemini deve ser configurado manualmente e não está incluído no repositório por questões de segurança.
- O sistema em produção está hospedado no servidor Ubuntu da empresa.
- Certifique-se de que todas as dependências estão instaladas antes de executar a aplicação.

## 📧 Contato
Para mais informações ou suporte, entre em contato com o departamento de TI da Metalúrgica Mococa S/A.

*Desenvolvido por João Pedro Pizoli Carvalho para a Metalúrgica Mococa S/A - 2025*
