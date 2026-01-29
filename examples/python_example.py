from openai import OpenAI

# Configuração do Proxy Seguro
client = OpenAI(
    api_key="SUA_CHAVE_OPENAI", # Opcional se gerido pelo Worker
    base_url="https://pii-sanitizer.www-guiferreira70.workers.dev/v1"
)

def send_secure_message(text):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": text}],
        extra_headers={"X-Agency-Key": "ALFA_123"} # Sua chave de agência
    )
    return response.choices[0].message.content

print(send_secure_message("Meu CPF é 123.456.789-00 e meu e-mail é teste@gmail.com"))