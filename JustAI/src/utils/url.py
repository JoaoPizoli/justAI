def compose_url(keywords):
    base_url = "https://www.jusbrasil.com.br/jurisprudencia/busca?"
    if isinstance(keywords, str):
        keywords = keywords.split()
    terms = "q=" + "+".join(keywords)
    return base_url + terms

def filtro_url(url, keysearch):
    keys_possiveis= ["stf","stj","tst","tse","stm","tcu","tnu","tru","cnj","carf","tj","tfr","trt","tre","tjm","tce"]
    valid_keys = [k.lower() for k in keysearch if k.lower() in keys_possiveis]
    if valid_keys:
        juncao_url_l = []
        for k in valid_keys:
            juncao_url_l.append("&tribunal=" + k) 
        url_parcial = "".join(juncao_url_l) 
        url = url + url_parcial
    else:
        url = url    
    return url


def relevancia_recente(url,relevancia):
    if(relevancia == 'relevant'):
        url = url
    elif(relevancia == 'recent'):
        terms = "&o=data"
        url = url  + terms
    else:
        url = url
    return url 

