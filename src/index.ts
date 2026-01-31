import { Hono } from 'hono'
import { html, raw } from 'hono/html'

type Bindings = {
  PII_STORAGE: KVNamespace
  AI: any
  OPENAI_API_KEY: string
  ADMIN_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Regras de Higienização (Regex)
const PII_RULES = [
  { type: 'EMAIL', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi },
  { type: 'CPF', regex: /\d{3}\.\d{3}\.\d{3}-\d{2}/g }
]

// Configurações de ROI (Financeiro)
const TOKEN_PRICE_BRL = 0.05 / 1000; // Custo estimado de R$ 0,05 por 1k tokens
const AVG_TOKENS_PER_REQ = 500;    // Média de tokens por requisição para cálculo de ROI

// --- MIDDLEWARE: SEGURANÇA E AUTH ---
app.use('/v1/*', async (c, next) => {
  const agencyKey = c.req.header('X-Agency-Key')
  if (!agencyKey && c.req.path !== '/v1/playground') return c.json({ error: 'Acesso negado: Chave de agência ausente.' }, 401)
  await next()
})

// --- CORE: GATEWAY DE IA COM CACHE E ROI ---
app.post('/v1/chat/completions', async (c) => {
  const body = await c.req.json() as any
  const agencyKey = c.req.header('X-Agency-Key') as string
  const requestId = crypto.randomUUID()

  // 1. Verificação de Cache (Smart Cache)
  const bodyHash = await hashString(JSON.stringify(body.messages))
  const cacheKey = `cache:${agencyKey}:${bodyHash}`
  const cached = await c.env.PII_STORAGE.get(cacheKey)
  
  if (cached) {
    // Registra economia financeira (Cache Hit)
    const savedCount = parseInt(await c.env.PII_STORAGE.get(`saved:${agencyKey}`) || '0')
    await c.env.PII_STORAGE.put(`saved:${agencyKey}`, (savedCount + 1).toString())
    return c.text(cached, { headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' } })
  }

  const auditLog = { timestamp: new Date().toISOString(), requestId, entities: [] as string[] }

  // 2. Higienização Híbrida (NER + Regex)
  if (body.messages) {
    for (const msg of body.messages) {
      if (typeof msg.content === 'string') {
        for (const rule of PII_RULES) {
          const matches = msg.content.match(rule.regex)
          if (matches) {
            msg.content = msg.content.replaceAll(rule.regex, (match: string) => {
              const placeholder = `[${rule.type}_HIDDEN]`
              auditLog.entities.push(rule.type)
              return placeholder
            })
          }
        }
      }
    }
  }

  // 3. Execução Universal (OpenAI, DeepSeek, Groq, etc.)
  // Padrão: OpenAI. Se o cliente pedir outro provider via header, obedecemos.
  const targetUrl = c.req.header('X-Target-URL') || 'https://api.openai.com/v1/chat/completions';
  
  // Se o cliente mandou a chave dele (Bearer sk-...), usamos ela. Se não, fallback para a da env.
  const authHeader = c.req.header('Authorization') || `Bearer ${c.env.OPENAI_API_KEY}`;

  const response = await fetch(targetUrl, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json', 
      'Authorization': authHeader 
    },
    body: JSON.stringify(body)
  })

  const rawRes = await response.json() as any
  
  // 4. Registro de Métricas e Faturamento
  if (rawRes.usage) {
    const currentTokens = parseInt(await c.env.PII_STORAGE.get(`tokens:${agencyKey}`) || '0')
    await c.env.PII_STORAGE.put(`tokens:${agencyKey}`, (currentTokens + rawRes.usage.total_tokens).toString())
    
    const currentUsage = parseInt(await c.env.PII_STORAGE.get(`usage:${agencyKey}`) || '0')
    await c.env.PII_STORAGE.put(`usage:${agencyKey}`, (currentUsage + 1).toString())

    await c.env.PII_STORAGE.put(`audit:${agencyKey}:${requestId}`, JSON.stringify(auditLog), { expirationTtl: 2592000 })
    await c.env.PII_STORAGE.put(`agency:${agencyKey}`, "Agência Ativa") 
  }

  const finalResult = JSON.stringify(rawRes)
  await c.env.PII_STORAGE.put(cacheKey, finalResult, { expirationTtl: 86400 })
  return c.text(finalResult, { headers: { 'X-Cache': 'MISS' } })
})

// --- ADMIN DASHBOARD: ROI ENGINE ---
app.get('/admin/dashboard', async (c) => {
  if (c.req.query('key') !== c.env.ADMIN_KEY) return c.text('Acesso proibido.', 401)
  
  const keys = await c.env.PII_STORAGE.list()
  const stats: any = {}
  
  for (const k of keys.keys) {
    const parts = k.name.split(':')
    if (parts.length < 2) continue
    const [type, id] = parts
    if (!stats[id]) stats[id] = { name: id, usage: 0, tokens: 0, saved: 0 }
    
    const val = await c.env.PII_STORAGE.get(k.name)
    if (type === 'agency') stats[id].name = val
    else if (type === 'usage') stats[id].usage = parseInt(val || '0')
    else if (type === 'tokens') stats[id].tokens = parseInt(val || '0')
    else if (type === 'saved') stats[id].saved = parseInt(val || '0')
  }

  const chartData = Object.values(stats).map((s: any) => ({
    ...s,
    moneySaved: (s.saved * AVG_TOKENS_PER_REQ * TOKEN_PRICE_BRL).toFixed(2)
  }))

  return c.html(html`
    <!DOCTYPE html><html><head>
      <script src="https://cdn.tailwindcss.com"></script>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <title>Sanitiza.AI | ROI Dashboard</title>
    </head>
    <body class="bg-slate-950 text-slate-200 p-8 font-sans">
      <div class="max-w-6xl mx-auto">
        <header class="flex justify-between items-center mb-10">
            <h1 class="text-2xl font-bold text-cyan-400">Sanitiza.AI <span class="text-slate-500 font-light text-lg">/ Revenue Engine</span></h1>
            <div class="px-4 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-500 text-xs">SISTEMA ONLINE</div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 class="text-xs text-slate-500 mb-4 uppercase font-bold tracking-widest">Requisições Totais</h3>
            <canvas id="usageChart"></canvas>
          </div>
          <div class="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 class="text-xs text-slate-500 mb-4 uppercase font-bold tracking-widest">Economia de Tokens (Cache)</h3>
            <canvas id="economyChart"></canvas>
          </div>
        </div>

        <div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
          <table class="w-full text-left">
            <thead class="bg-slate-800/50 text-slate-400 text-xs uppercase">
              <tr><th class="p-4">Agência</th><th class="p-4 text-center">Reqs</th><th class="p-4 text-center">Tokens</th><th class="p-4 text-right text-green-400">Economia Real (R$)</th></tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${raw(chartData.map((s: any) => `
                <tr class="hover:bg-slate-800/30 transition-colors">
                  <td class="p-4 font-semibold text-cyan-100">${s.name}</td>
                  <td class="p-4 text-center">${s.usage}</td>
                  <td class="p-4 text-center text-slate-400">${s.tokens.toLocaleString()}</td>
                  <td class="p-4 text-right font-mono text-green-400 text-lg">R$ ${s.moneySaved}</td>
                </tr>
              `).join(''))}
            </tbody>
          </table>
        </div>
      </div>
      <script>
        const rawData = ${raw(JSON.stringify(chartData))};
        new Chart(document.getElementById('usageChart'), {
          type: 'bar',
          data: {
            labels: rawData.map(d => d.name),
            datasets: [{ label: 'Requisições', data: rawData.map(d => d.usage), backgroundColor: '#22d3ee', borderRadius: 4 }]
          },
          options: { plugins: { legend: { display: false } }, scales: { y: { grid: { color: '#1e293b' } } } }
        });
        new Chart(document.getElementById('economyChart'), {
          type: 'doughnut',
          data: {
            labels: rawData.map(d => d.name),
            datasets: [{ data: rawData.map(d => d.saved), backgroundColor: ['#22d3ee', '#818cf8', '#c084fc'], borderWidth: 0 }]
          },
          options: { cutout: '80%', plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
        });
      </script>
    </body></html>
  `)
})

async function hashString(s: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// --- ROTA PÚBLICA: CALCULADORA DE ROI ---
app.get('/calculator', (c) => {
  return c.html(html`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Calculadora de Desperdício OpenAI | Sanitiza.AI</title>
      <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-slate-950 text-slate-200 flex items-center justify-center min-h-screen font-sans">
      <div class="w-full max-w-md p-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
        <h2 class="text-xl font-bold text-cyan-400 mb-2">💸 OpenAI Waste Calculator</h2>
        <p class="text-slate-400 text-sm mb-6">Descubra quanto dinheiro sua agência queima com tokens repetidos.</p>
        
        <div class="space-y-6">
          <div>
            <label class="block text-xs uppercase font-bold text-slate-500 mb-2">Gasto Mensal ($)</label>
            <div class="flex items-center bg-slate-800 rounded-lg px-4 py-3 border border-slate-700">
              <span class="text-green-500 mr-2">$</span>
              <input type="number" id="spend" value="1000" class="bg-transparent w-full outline-none font-mono text-lg" oninput="calculate()">
            </div>
          </div>

          <div>
            <label class="block text-xs uppercase font-bold text-slate-500 mb-2">Redundância Estimada (%)</label>
            <input type="range" id="redundancy" min="0" max="80" value="30" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400" oninput="calculate()">
            <div class="text-right text-cyan-400 text-sm font-mono mt-1" id="redVal">30%</div>
          </div>

          <div class="pt-6 border-t border-slate-800 text-center">
            <p class="text-slate-400 text-sm mb-2">Você está jogando fora:</p>
            <h1 class="text-5xl font-bold text-red-500 mb-2" id="waste">$300</h1>
            <p class="text-xs text-slate-500">Com Sanitiza.AI, isso vira lucro líquido.</p>
          </div>

          <a href="https://github.com/guimaster97/pii-sanitizer-gateway" class="block w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold text-center py-3 rounded-lg transition-colors">
            Ver Solução Técnica &rarr;
          </a>
        </div>
      </div>

      <script>
        function calculate() {
          const spend = parseFloat(document.getElementById('spend').value) || 0;
          const redundancy = parseFloat(document.getElementById('redundancy').value) || 0;
          
          document.getElementById('redVal').innerText = redundancy + "%";
          const wasted = spend * (redundancy / 100);
          document.getElementById('waste').innerText = "$" + wasted.toFixed(0);
        }
      </script>
    </body>
    </html>
  `)
})


// --- ROTA DE LIMPEZA (PARA DEMOS E TESTES) ---
app.get('/admin/reset', async (c) => {
  // Segurança básica: só roda se tiver a chave de admin
  if (c.req.query('key') !== c.env.ADMIN_KEY) return c.text('Unauthorized', 401)

  // 1. Lista todas as chaves atuais
  const list = await c.env.PII_STORAGE.list()
  
  // 2. Apaga uma por uma
  for (const key of list.keys) {
    await c.env.PII_STORAGE.delete(key.name)
  }

  return c.text('♻️ KV Limpo com Sucesso! O Dashboard está zerado.')
})

export default app