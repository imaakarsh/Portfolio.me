import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  console.log('[Vite Config] Mode:', mode);
  console.log('[Vite Config] CWD:', process.cwd());
  
  const envFile = path.resolve(process.cwd(), '.env.development');
  if (fs.existsSync(envFile)) {
    console.log('[Vite Config] Found .env.development');
    const content = fs.readFileSync(envFile, 'utf-8');
    content.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        process.env[key.trim()] = value;
      }
    });
  }
  
  console.log('[Vite Config] WAKATIME_API_KEY loaded:', !!process.env.WAKATIME_API_KEY);

  return {
    plugins: [
      tailwindcss(),
      {
        name: 'vercel-api-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const apiName = url.pathname.split('/api/')[1];
              const filePath = path.resolve(__dirname, `api/${apiName}.js`);

              if (fs.existsSync(filePath)) {
                try {
                  const { default: handler } = await server.ssrLoadModule(filePath);
                  
                  // Simple Vercel-like Response object mock
                  const vercelRes = {
                    status(code) {
                      res.statusCode = code;
                      return this;
                    },
                    json(data) {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return this;
                    },
                    setHeader(name, value) {
                      res.setHeader(name, value);
                      return this;
                    },
                    // Add other mocks if needed
                  };

                  await handler(req, vercelRes);
                  return;
                } catch (error) {
                  console.error(`[API Error] ${apiName}:`, error);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal Server Error', message: error.message }));
                  return;
                }
              }
            }
            next();
          });
        },
      },
    ],
  };
});
