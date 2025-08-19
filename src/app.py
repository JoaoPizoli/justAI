import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from utils.url import compose_url, filtro_url, relevancia_recente
from utils.scrape import scrape
from agents.agentes import Agente_analisador, Agente_organizador, Agente_geradorTopico, Agente_selecionador

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="gui", html=True), name="gui")

@app.get("/")
async def read_index():
    return FileResponse("gui/index.html")

async def gerar_consultaAi(descricao: str, topico: str, tribunais: str, ordenar: str):
    try:
        topico = await Agente_geradorTopico(descricao, topico) 
        url = compose_url(topico)
        url_pesquisa = filtro_url(url, tribunais)
        url_final = relevancia_recente(url_pesquisa, ordenar)
        print(url_final)
        return url_final
    except Exception as e:
        print(f"Erro em gerar_consultaAi: {str(e)}")
        raise
    
async def gerar_consultaUser( topico: str, tribunais: str, ordenar: str):
    try:
        url = compose_url(topico)
        url_pesquisa = filtro_url(url, tribunais)
        url_final = relevancia_recente(url_pesquisa, ordenar)
        print(url_final)
        return url_final
    except Exception as e:
        print(f"Erro em : {str(e)}")
        raise
    
@app.post("/api/data")
async def main(request: Request):
    try:
        data = await request.json()
        topico = data.get("topico")
        descricao = data.get("descricao")
        tribunais = data.get("tribunais")
        ordenar = data.get("ordenar")

        if not topico:
            return JSONResponse(
                status_code=400, 
                content={"error": "O campo 'topico' é obrigatório."}
            )

        url_AI= await gerar_consultaAi(descricao, topico, tribunais, ordenar)
        url_User= await gerar_consultaUser(topico,tribunais,ordenar)
        resposta_scrape_ai = await scrape(url_AI)
        resposta_scrape_user = await scrape(url_User)
        print('Iniciando a Estruturação da IA')
        scrape_formatado_ai = await Agente_organizador(resposta_scrape_ai)
        scrape_formatado_user = await Agente_organizador(resposta_scrape_user)
        print('Iniciando a Análise da IA')
        jsonfinal =await Agente_selecionador(scrape_formatado_ai,scrape_formatado_user, descricao)
        print(jsonfinal)
        peticao = await Agente_analisador(jsonfinal, descricao, topico)
        return {"peticao": peticao, "url": url_AI, "url2": url_User}
    except Exception as e:
        print(f"Erro na API: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": f"Ocorreu um erro interno: {str(e)}"}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=False)
