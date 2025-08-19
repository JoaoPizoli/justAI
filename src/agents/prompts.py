def prompt_organizador(dadosScrape):
    return f"""Objetivo: Extrair dados de scraping de jurisprudência e formatar em JSON.

  Entrada: String bruta de scraping em {dadosScrape}.

  Saída: JSON com campos "idRecurso" (cabeçalho completo do acórdão) e "ementa" (descrição/ementa COMPLETA, sem abreviações ou resumos).

  Formato JSON:
  [
    {{
      "idRecurso": "...",
      "ementa": "..."
    }},
    ...
  ]

  Instruções:

  1. Analise {dadosScrape}.
  2. Identifique blocos de jurisprudência (ex: "TJ-XX...").
  3. Para cada bloco:
    - Extraia o idRecurso (cabeçalho completo).
    - Localize e extraia a ementa COMPLETA (dentro de "Inteiro teor:" ou similar).  NÃO RESUMA OU ABREVIE.
  4. Crie um objeto JSON para cada jurisprudência: {{"idRecurso": "...", "ementa": "..."}}.
  5. Combine os objetos em uma lista JSON.
  6. Retorne a lista JSON.
  7. Se nenhuma ementa ou idRecurso for encontrada, devolva um json vazio

  Importante: Ementa deve ser COMPLETA e FIEL ao original.  Formato JSON deve ser válido. Não adicione informações extras."""
    

def prompt_analisador(jsondoagente, descricao, topico):
    return f"""OBJETIVO: Escrever uma defesa para o cliente com base nas informações passadas. Tópico: {topico}. Descrição: {descricao}.


  -Uma defesa completa, dividida em seções que contemplem as necessidades do cliente e com citações do texto e do código das jurisprudências selecionadas.
  -A defesa deve ser redigida sob a forma de uma petição com vocabulário e forma adequados ao meio jurídico.
  -As informações de foro,vara,nome de juiz, nome do requerente,nome do requerido, nome do  advogado e qualquer outro ncampo que o usario tem que preencher nomes que não foram informados, números não informados, etc.. devem ser colocado &&&&, a serem editadas posteriormente. Datar a edição como na data que o usuário irá passar (&&&&/&&&&/&&&&).
  -A citação de quaisquer jurisprudências para sustentar a defesa tem de ter formatação adequada, incluindo citação do trecho desejado a ser utilizado das jurisprudências escolhidas.
  -Para escolher as melhores Jurisprudências, utilize os dados do seguinte JSON: {jsondoagente}. No JSON, o campo idRecurso = "cabeçalho completo do acórdão" e o campo ementa = "descrição/ementa completa"
  -Utilize apenas 1 * nos campos que forem de destaque, nunca utilize 2 **
  """
  
def prompt_geradorTopico(descricao, topico):
    return f"""
Você é um assistente jurídico especializado.
Leia atentamente o Tópico e a Descrição fornecidos.
Sua tarefa é compreender o caso e gerar um novo Tópico que seja genérico e aborde as necessidades apresentadas, sem utilizar nomes específicos ou informações pessoais. Por exemplo, se a Descrição incluir o nome de uma empresa, o novo Tópico não deve mencionar esse nome.
Esse Tópico reformulado será usado para pesquisar as jurisprudências mais relevantes e similares ao caso.
Retorne apenas o Tópico reformulado, sem explicações, justificativas ou pontuação.
Tópico original: {topico}
Descrição: {descricao}
"""

def prompt_selecionador(json_ai, jsondoagente, descricao):
    return f"""
OBJETIVO: Selecionar as 10 melhores jurisprudências para embasar o caso.

Descrição do Caso: {descricao}


Jurisprudências obtidas com o Tópico do Usuário: {jsondoagente}
Jurisprudências obtidas com o Tópico Refatorado: {json_ai}

Instruções:
1. Analise a descrição do caso.
2. Examine as jurisprudências contidas nos dois JSONs.
3. Selecione as 10 jurisprudências mais relevantes e adequadas para embasar a defesa do caso.
4. Para cada jurisprudência selecionada, mantenha a estrutura original, contendo os campos "idRecurso" (cabeçalho completo do acórdão) e "ementa" (descrição/ementa COMPLETA).
5. Se não houver 10 jurisprudências disponíveis, retorne o número máximo encontrado.
6. Retorne apenas o JSON contendo uma lista com as jurisprudências selecionadas, sem informações adicionais.

Responda apenas com o JSON final.
"""









    