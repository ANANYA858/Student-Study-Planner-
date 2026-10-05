import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { GoogleGenAI, GenerateVideosOperation } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Gemini Multi-Turn Chat with Search & Maps Grounding
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      systemInstruction,
      model = 'gemini-3.5-flash',
      useSearch = false,
      useMaps = false,
    } = req.body;

    const tools: Array<{ googleSearch?: Record<string, never>; googleMaps?: Record<string, never> }> = [];
    if (useSearch) {
      tools.push({ googleSearch: {} });
    } else if (useMaps) {
      tools.push({ googleMaps: {} });
    }

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model,
      contents: formattedContents,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are SyncLife AI, an empathetic and highly knowledgeable Circadian Academic & Wellness Mentor. You help students balance rigorous exam preparation (like civil services, engineering, medical) with circadian vitality, sleep, and anti-burnout pacing. Be concise, actionable, and encouraging.',
        ...(tools.length > 0 ? { tools } : {}),
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    const searchMetadata = response.candidates?.[0]?.groundingMetadata;

    res.json({
      reply,
      groundingMetadata: searchMetadata,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    console.error('Chat error:', message);
    res.status(500).json({ error: message });
  }
});

// 2. Audio Transcription with gemini-3.5-transcribe
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { base64Audio, mimeType = 'audio/webm' } = req.body;

    if (!base64Audio) {
      return res.status(400).json({ error: 'base64Audio is required' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64Audio,
              },
            },
            {
              text: 'Transcribe this voice recording into clear, clean study notes.',
            },
          ],
        },
      ],
    });

    res.json({ text: response.text || '' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Transcription failed';
    console.error('Transcribe error:', message);
    res.status(500).json({ error: message });
  }
});

// 3. Image Generation with gemini-3.1-flash-image
app.post('/api/gemini/image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: prompt || 'A calm, inspiring study desk at sunrise with circadian ambient light' }],
      },
      config: {
        imageConfig: {
          aspectRatio,
          imageSize: '1K',
        },
      },
    });

    let imageUrl: string | null = null;
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageUrl) {
      return res.status(500).json({ error: 'No image data returned from model' });
    }

    res.json({ imageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Image generation failed';
    console.error('Image error:', message);
    res.status(500).json({ error: message });
  }
});

// 4. Video Generation with Veo
app.post('/api/gemini/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '16:9', imageBytes } = req.body;

    const payload: Record<string, unknown> = {
      model: 'veo-3.1-lite-generate-preview',
      prompt: prompt || 'Cinematic timelapse of a student studying as morning light fills the room',
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio,
      },
    };

    if (imageBytes) {
      payload.image = {
        imageBytes,
        mimeType: 'image/png',
      };
    }

    const operation = await ai.models.generateVideos(payload as never);
    res.json({ operationName: operation.name });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Video generation failed';
    console.error('Video error:', message);
    res.status(500).json({ error: message });
  }
});

app.post('/api/gemini/video-status', async (req: Request, res: Response) => {
  try {
    const { operationName } = req.body;
    if (!operationName) {
      return res.status(400).json({ error: 'operationName required' });
    }

    const op = new GenerateVideosOperation();
    op.name = operationName;
    const updated = await ai.operations.getVideosOperation({ operation: op });
    res.json({ done: updated.done });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Status check failed';
    res.status(500).json({ error: message });
  }
});

// Setup Vite middlewares for dev or static serving for prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`SyncLife server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
