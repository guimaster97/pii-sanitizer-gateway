import requests
import time
import random

# CONFIGURAÇÕES
URL = "https://pii-sanitizer.www-guiferreira70.workers.dev/v1/chat/completions"
AGENCY_KEY = "ALFA_123" # Deve ser uma chave válida no seu KV
TOTAL_REQUESTS = 20

def generate_pii_payload():
    names = ["Guilherme Ferreira", "Carlos Souza", "Ana Maria"]
    cpfs = ["123.456.789-00", "98765432100", "000.111.222-33"]
    emails = ["contato@empresa.com", "dev_teste@gmail.com", "suporte@servidor.net"]
    
    text = f"Olá, sou {random.choice(names)}. Meu CPF é {random.choice(cpfs)} e e-mail {random.choice(emails)}."
    return {"model": "gpt-4o-mini", "messages": [{"role": "user", "content": text}]}

def run_stress():
    print(f"🚀 Iniciando Stress Test: {TOTAL_REQUESTS} requisições...")
    for i in range(TOTAL_REQUESTS):
        start = time.time()
        res = requests.post(URL, json=generate_pii_payload(), headers={"X-Agency-Key": AGENCY_KEY})
        latency = (time.time() - start) * 1000
        
        status = "✅ OK" if res.status_code == 200 else f"❌ ERROR ({res.status_code})"
        sanitized = "🛡️ PROTEGIDO" if "[" in res.text else "⚠️ VAZOU"
        
        print(f"Req {i+1:02} | {status} | Latência: {latency:.2f}ms | {sanitized}")

if __name__ == "__main__":
    run_stress()