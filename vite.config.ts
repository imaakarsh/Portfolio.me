import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

function resolveApiModule(apiName: string) {
  const tsPath = path.resolve(__dirname, `api/${apiName}.ts`);
  const jsPath = path.resolve(__dirname, `api/${apiName}.js`);

  if (fs.existsSync(tsPath)) return tsPath;
  if (fs.existsSync(jsPath)) return jsPath;
  return null;
}

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
  console.log('[Vite Config] Mode:', mode);
  console.log('[Vite Config] CWD:', process.cwd());
  
  const env = loadEnv(mode, process.cwd(), '');
  // Merge loaded env into process.env so serverless functions can access them
  Object.assign(process.env, env);
  
  console.log('[Vite Config] CODETIME_API_KEY loaded:', !!process.env.CODETIME_API_KEY);
  console.log('[Vite Config] WAKATIME_API_KEY present (fallback):', !!process.env.WAKATIME_API_KEY);

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
              const filePath = resolveApiModule(apiName);

              if (filePath) {
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
