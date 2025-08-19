from dotenv import load_dotenv # type: ignore
import os
import asyncio
from google import genai
from .prompts import prompt_analisador, prompt_organizador, prompt_geradorTopico, prompt_selecionador


load_dotenv()

async def Agente_organizador(dadosScrape):
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    prompt = prompt_organizador(dadosScrape)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-pro",
        contents=prompt
    )
    return response.text

async def Agente_analisador(jsondoagente, descricao, topico):
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    prompt = prompt_analisador(jsondoagente, descricao, topico)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-pro",
        contents=prompt
    )
    return response.text

async def Agente_geradorTopico(descricao, topico):
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    prompt = prompt_geradorTopico(descricao, topico)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5",
        contents=prompt
    )
    return response.text

async def Agente_selecionador(json_ai, jsondoagente, descricao):
    client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
    prompt = prompt_selecionador(json_ai, jsondoagente, descricao)
    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-pro",
        contents=prompt
    )
    return response.text
