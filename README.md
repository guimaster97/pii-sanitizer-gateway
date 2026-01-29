# 🚀 Sanitiza.AI | High-Performance AI Gateway

> 💸 **Está perdendo dinheiro com a OpenAI?** > [**Clique aqui para usar nossa Calculadora de ROI Interativa**](https://pii-sanitizer.www-guiferreira70.workers.dev/calculator) e veja quanto você economizaria hoje.

> **Reduza sua fatura da OpenAI em até 30% e automatize sua conformidade LGPD em uma única camada de infraestrutura.**

---

## 💰 Por que usar este Gateway?

A maioria das agências de IA queima dinheiro enviando prompts repetidos e dados sensíveis para as LLMs. O **Sanitiza.AI** resolve isso atuando como um Proxy Inteligente no Edge (Cloudflare Workers).

1. **Economia Real (Smart Cache):** Nosso sistema de hash SHA-256 detecta requisições idênticas e entrega a resposta do cache instantaneamente (50ms), **sem cobrar tokens da OpenAI**.
    
2. **Blindagem de Dados (Compliance):** Interceptamos e mascaramos CPFs, E-mails e Nomes _antes_ que eles saiam do seu servidor. Seu cliente fica seguro, sua agência fica livre de multas.
    
3. **ROI em Tempo Real:** Um dashboard administrativo que prova, em Reais (R$), quanto você economizou no mês.
    

---

## 🛠️ Arquitetura de Eficiência

|**Módulo**|**Função**|**Impacto no Negócio**|
|---|---|---|
|**💰 Smart Cache Engine**|Armazena respostas frequentes por 24h.|**Redução direta de custo** e latência zero para perguntas repetidas.|
|**🛡️ Hybrid PII Shield**|NER (AI) + Regex de alta precisão para sanitização.|**Risco Zero** de vazamento de dados sensíveis.|
|**📊 Revenue Dashboard**|Monitoramento financeiro de uso por agência.|Visibilidade total do **Retorno sobre Investimento (ROI)**.|
|**⚡ Edge Execution**|Roda na rede global da Cloudflare.|Latência mínima, sem overhead de servidor.|

---

## ⚡ Integração em 30 Segundos

Não mude sua lógica de negócios. Apenas aponte seu cliente OpenAI para o nosso Gateway.

### Python (Exemplo)

Python

```
from openai import OpenAI

# Aponte para o Sanitiza.AI em vez da API direta da OpenAI
client = OpenAI(
    api_key="SUA_KEY_OPENAI",
    base_url="https://pii-sanitizer.www-guiferreira70.workers.dev/v1"
)

# Adicione sua chave de agência para ativar o Cache e o ROI
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Analise este contrato para o CPF 123.456.789-00"}],
    extra_headers={"X-Agency-Key": "CLIENTE_BETA_01"}
)

print(response.choices[0].message.content)
```

---

## 🧪 Performance & Segurança (Comprovadas)

Rodamos testes de estresse contínuos para garantir que economia não significa falha de segurança.

- **Recall de Proteção:** 100% (20/20 PIIs bloqueados em testes de carga).
    
- **Latência de Cache:** < 50ms.
    
- **Auditabilidade:** Logs de auditoria disponíveis via API para fins jurídicos.

---

## 📈 Dashboard de ROI

Acesse o painel de controle para ver sua economia em tempo real:

`https://pii-sanitizer.www-guiferreira70.workers.dev/admin/dashboard?key=SUA_ADMIN_KEY`

O sistema calcula automaticamente:

$$Economia = (CacheHits \times CustoToken) - Mensalidade$$

---

## 📄 Licença


Distribuído sob a licença MIT. Projetado para escalar com sua agência.
