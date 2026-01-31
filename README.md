

Markdown

````
# 🚀 Sanitiza.AI | High-Performance AI Gateway

[![Dev.to](https://img.shields.io/badge/dev.to-Read%20the%20Story-0A0A0A?style=for-the-badge&logo=dev.to&logoColor=white)](https://dev.to/guilherme_ferreira_87ce22/i-built-a-serverless-openai-gateway-to-cut-costs-by-30-and-sanitize-pii-open-source-5g06)

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/guimaster97/pii-sanitizer-gateway)

> 💸 **Bleeding money with OpenAI?** > [**Click here to use our Interactive ROI Calculator**](https://pii-sanitizer.www-guiferreira70.workers.dev/calculator) and see how much you could save today.

> **Slash your OpenAI bill by up to 30% and automate GDPR/CCPA compliance in a single infrastructure layer.**

---

## 💰 Why use this Gateway?

Most AI agencies burn cash by sending repetitive prompts and sensitive data to LLMs. **Sanitiza.AI** solves this by acting as an Intelligent Proxy on the Edge (Cloudflare Workers).

1. **Real Savings (Smart Cache):** Our SHA-256 hash system detects identical requests and delivers the cached response instantly (50ms), **costing zero OpenAI tokens**.

2. **Data Shielding (Compliance):** We intercept and mask Emails, Names, and IDs (SSN/Tax IDs) *before* they leave your server. Your client stays safe; your agency stays compliant.

3. **Real-Time ROI:** An admin dashboard that proves, in Dollars ($), exactly how much you saved this month.

---

## 🛠️ Efficiency Architecture

|**Module**|**Function**|**Business Impact**|
|---|---|---|
|**💰 Smart Cache Engine**|Stores frequent responses for 24h.|**Direct cost reduction** and zero latency for repeated queries.|
|**🛡️ Hybrid PII Shield**|NER (AI) + High-precision Regex for sanitization.|**Zero Risk** of sensitive data leakage.|
|**📊 Revenue Dashboard**|Financial monitoring of usage per agency key.|Total visibility of **Return on Investment (ROI)**.|
|**⚡ Edge Execution**|Runs on Cloudflare's global network.|Minimal latency, no server overhead.|

---

## ⚡ Integration in 30 Seconds

Don't change your business logic. Just point your OpenAI client to our Gateway.

### Python (Example)

```python
from openai import OpenAI

# Point to Sanitiza.AI instead of the direct OpenAI API
client = OpenAI(
    api_key="YOUR_OPENAI_KEY",
    base_url="[https://pii-sanitizer.www-guiferreira70.workers.dev/v1](https://pii-sanitizer.www-guiferreira70.workers.dev/v1)"
)

# Add your agency key to activate Cache and ROI tracking
response = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[{"role": "user", "content": "Analyze this contract for user ID 123-456-789"}],
    extra_headers={"X-Agency-Key": "BETA_CLIENT_01"}
)

print(response.choices[0].message.content)
````

---

## 🧪 Performance & Security (Proven)

We run continuous stress tests to ensure savings don't come at the cost of security.

- **Protection Recall:** 100% (20/20 PIIs blocked in load tests).
    
- **Cache Latency:** < 50ms.
    
- **Auditability:** Audit logs available via API for legal compliance.
    

---

## 📈 ROI Dashboard

Access the control panel to view your savings in real-time:

`https://pii-sanitizer.www-guiferreira70.workers.dev/admin/dashboard?key=YOUR_ADMIN_KEY`

The system automatically calculates:

$$Savings = (CacheHits \times TokenCost) - MonthlyCost$$

---

## 📄 License

Distributed under the MIT License. Designed to scale with your agency.
