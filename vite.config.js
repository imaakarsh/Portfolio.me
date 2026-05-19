import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolveApiModule(apiPath) {
  const cleanPath = apiPath.split('?')[0].replace(/\/$/, '');
  if (!cleanPath) return null;

  const topLevel = cleanPath.split('/')[0];
  const candidates = [
    path.resolve(__dirname, 'api', `${cleanPath}.js`),
    path.resolve(__dirname, 'api/routes', `${topLevel}.js`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }

  return null;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [
      tailwindcss(),
      {
        name: 'vercel-api-emulator',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const apiPath = url.pathname.replace(/^\/api\//, '');
              const filePath = resolveApiModule(apiPath);

              if (filePath) {
                try {
                  const { default: handler } = await server.ssrLoadModule(filePath);

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
                  };

                  await handler(req, vercelRes);
                  return;
                } catch (error) {
                  console.error(`[API Error] ${apiPath}:`, error);
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
