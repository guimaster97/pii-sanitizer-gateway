const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: 'SUA_CHAVE_OPENAI',
  baseURL: 'https://pii-sanitizer.www-guiferreira70.workers.dev/v1'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Dados do cliente: Guilherme, guilherme@email.com' }],
    model: 'gpt-4o-mini',
  }, {
    headers: { 'X-Agency-Key': 'ALFA_123' }
  });

  console.log(completion.choices[0].message.content);
}

main();