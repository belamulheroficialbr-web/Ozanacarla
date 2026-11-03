import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não configurada.');
  }
  return new GoogleGenAI({
    apiKey,
  });
}

// AI Beauty Consultant API Endpoint
app.post('/api/ai/consultant', async (req, res) => {
  try {
    const { message, history, imageBase64, productsCatalog, servicesCatalog } = req.body;

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'Mensagem ou imagem necessária.' });
    }

    let ai: GoogleGenAI;
    try {
      ai = getGeminiClient();
    } catch (keyErr: any) {
      return res.status(500).json({ error: 'API key not configured.' });
    }

    // Use a known stable model
    const modelName = 'gemini-1.5-flash';
    console.log(`Using model: ${modelName}`);

    // Format catalogs
    const productsListStr = (productsCatalog || [])
      .map((p: any) => `ID:"${p.id}"|Nome:"${p.name}"|Cat:"${p.category}"|Preço:R$${((p.promotionalPriceBRL ?? p.salePriceBRL) || 0).toFixed(2)}`)
      .join('\n');

    const servicesListStr = (servicesCatalog || [])
      .map((s: any) => `ID:"${s.id}"|Nome:"${s.name}"|Cat:"${s.category}"|Preço:R$${((s.promotionalPriceBRL ?? s.priceBRL) || 0).toFixed(2)}|Dur:${s.durationMinutes}min`)
      .join('\n');

    const systemInstruction = `Você é a Consultora Virtual de Beleza do "Sra. Bela Mulher Atelier". Use EXCLUSIVAMENTE o catálogo abaixo. NUNCA invente itens.

PRODUTOS:
${productsListStr || 'Nenhum'}

SERVIÇOS:
${servicesListStr || 'Nenhum'}`;

    // Format history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-10)) {
        if (!h || !h.text) continue;
        const role = (h.senderRole === 'client' || h.senderRole === 'visitor' || h.senderId !== 'consultora-ia') ? 'user' : 'model';
        const parts: any[] = [{ text: h.text }];
        if (contents.length > 0 && contents[contents.length - 1].role === role) {
          contents[contents.length - 1].parts.push(...parts);
        } else {
          contents.push({ role, parts });
        }
      }
    }
    if (contents.length > 0 && contents[0].role !== 'user') contents.shift();

    const latestParts: any[] = [];
    if (imageBase64) {
      latestParts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64.replace(/^data:image\/\w+;base64,/, '') } });
    }
    if (message) latestParts.push({ text: message });
    else if (latestParts.length === 0) latestParts.push({ text: 'Olá!' });

    if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
      contents[contents.length - 1].parts.push(...latestParts);
    } else {
      contents.push({ role: 'user', parts: latestParts });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING },
            recommendedProductIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedServiceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['replyText', 'recommendedProductIds', 'recommendedServiceIds'],
        },
      },
    });

    const parsed = JSON.parse(response.text() || '{}');

    return res.json({
      replyText: parsed.replyText || 'Estamos à sua total disposição!',
      recommendedProductIds: parsed.recommendedProductIds || [],
      recommendedServiceIds: parsed.recommendedServiceIds || [],
    });
  } catch (err: any) {
    console.error('Erro na Consultora Gemini AI:', err);
    return res.status(500).json({
      error: 'Erro no servidor da consultora de IA',
      details: err?.message || 'Falha no processamento.',
    });
  }
});

// Diagnostic API Endpoint (Secure & Restricted)
app.get('/api/health/gemini', async (req, res) => {
  // Restriction: Only accessible in development environment
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ status: 'FORBIDDEN' });
  }

  // 1. Check existence
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ status: 'MISSING_API_KEY' });
  }

  try {
    // 2. Initialize and perform a minimal real request
    const ai = getGeminiClient();
    await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'ping' }] }],
    });
    
    return res.json({ status: 'SUCCESS' });
  } catch (err: any) {
    console.error('Gemini Diagnostic Error:', err);
    
    // 3. Map errors to specific statuses
    const status = err.status === 401 || err.status === 403 
      ? 'INVALID_API_KEY' 
      : err.code === 'MODEL_NOT_FOUND' 
      ? 'MODEL_ERROR' 
      : 'CONNECTION_ERROR';
      
    return res.status(500).json({ 
      status, 
      details: 'Check server logs for details (no secrets exposed).'
    });
  }
});

// Vite Middleware and HTML Route Handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Sra. Bela Mulher rodando na porta ${PORT}`);
  });
}

startServer();
