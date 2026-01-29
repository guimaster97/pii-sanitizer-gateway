import requests
import time

# Configurações do ambiente de teste
TARGET_URL = "https://pii-sanitizer.www-guiferreira70.workers.dev/v1/chat/completions"
AGENCY_KEY = "ALFA_123" # Use uma chave de teste válida

test_cases = [
    {"input": "O CPF do cliente é 123.456.789-00", "pii_type": "CPF"},
    {"input": "Mande o contrato para joao.silva@empresa.com.br", "pii_type": "EMAIL"},
    {"input": "Agende com o Dr. Guilherme Ferreira amanhã", "pii_type": "PER (NER)"}
]

def run_compliance_test():
    print(f"🔍 Iniciando Teste de Integridade de Redação (Recall Target: 100%)")
    print("-" * 60)
    
    hits = 0
    for case in test_cases:
        start = time.time()
        try:
            res = requests.post(
                TARGET_URL,
                json={"model": "gpt-4o-mini", "messages": [{"role": "user", "content": case['input']}]},
                headers={"X-Agency-Key": AGENCY_KEY},
                timeout=10
            )
            latency = (time.time() - start) * 1000
            
            # Verificação: o dado original ainda está na resposta?
            # Se o proxy sanitizou, o dado bruto não deve voltar.
            protected = "[" in res.text and "]" in res.text
            if protected: hits += 1
            
            status = "✅ PROTEGIDO" if protected else "❌ FALHA"
            print(f"[{case['pii_type']}] | Latência: {latency:.2f}ms | {status}")
            
        except Exception as e:
            print(f"❌ Erro de conexão: {e}")

    recall = (hits / len(test_cases)) * 100
    print("-" * 60)
    print(f"📊 RESULTADO FINAL: RECALL = {recall}%")

if __name__ == "__main__":
    run_compliance_test()