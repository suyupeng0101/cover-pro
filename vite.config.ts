import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const layoutCssPath = path.resolve(rootDir, 'src/styles/template-layouts.css');
const textElements = ['label', 'title', 'subtitle', 'author', 'badge', 'graphic'] as const;
const customLayoutStart = '/* Cover Pro saved template defaults: start */';
const customLayoutEnd = '/* Cover Pro saved template defaults: end */';

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [
    react(),
    {
      name: 'cover-pro-layout-writer',
      configureServer(server) {
        server.middlewares.use('/api/template-layout-defaults', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ ok: false, error: 'Method not allowed' }));
            return;
          }

          try {
            const payload = await readJsonBody(req);
            const written = await upsertTemplateDefaults(payload);
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: true, written }));
          } catch (error) {
            res.statusCode = 400;
            res.setHeader('content-type', 'application/json');
            res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' }));
          }
        });
      },
    },
  ],
});

type LayoutPayload = {
  templateId: string;
  platformId: string;
  positions: Record<(typeof textElements)[number], { x: number; y: number }>;
};

function readJsonBody(req: import('node:http').IncomingMessage) {
  return new Promise<LayoutPayload>((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        reject(new Error('Request body is too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body) as LayoutPayload);
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

async function upsertTemplateDefaults(payload: LayoutPayload) {
  validateLayoutPayload(payload);
  const css = await fs.readFile(layoutCssPath, 'utf8');
  const selector = `.template-platform-${payload.platformId} .${payload.templateId}`;
  const blockPattern = new RegExp(`${escapeRegExp(customLayoutStart)}[\\s\\S]*?${escapeRegExp(customLayoutEnd)}`);
  const currentBlockMatch = css.match(blockPattern);
  const currentRules = currentBlockMatch ? currentBlockMatch[0] : `${customLayoutStart}\n${customLayoutEnd}`;
  const nextPositions = payload.positions;
  const rule = buildTemplateDefaultRule(selector, nextPositions);
  const selectorPattern = new RegExp(`${escapeRegExp(selector)}\\s*\\{[\\s\\S]*?\\}\\n?`, 'm');
  const nextRules = selectorPattern.test(currentRules)
    ? currentRules.replace(selectorPattern, rule)
    : currentRules.replace(customLayoutEnd, `${rule}\n${customLayoutEnd}`);
  const nextCss = currentBlockMatch
    ? css.replace(blockPattern, nextRules)
    : `${css.trimEnd()}\n\n${nextRules}\n`;
  await fs.writeFile(layoutCssPath, nextCss);
  return nextPositions;
}

function validateLayoutPayload(payload: LayoutPayload) {
  if (!/^[a-z0-9-]+$/.test(payload.templateId)) throw new Error('Invalid templateId');
  if (!/^[a-z0-9-]+$/.test(payload.platformId)) throw new Error('Invalid platformId');
  for (const key of textElements) {
    const position = payload.positions?.[key];
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) {
      throw new Error(`Invalid position for ${key}`);
    }
  }
}

function buildTemplateDefaultRule(selector: string, positions: LayoutPayload['positions']) {
  const lines = [`${selector} {`];
  for (const key of textElements) {
    lines.push(`  --base-${key}-x: ${formatCssNumber(positions[key].x)}cqw;`);
    lines.push(`  --base-${key}-y: ${formatCssNumber(positions[key].y)}cqh;`);
  }
  lines.push('}');
  return `${lines.join('\n')}\n`;
}

function createZeroPositions(): LayoutPayload['positions'] {
  return {
    label: { x: 0, y: 0 },
    title: { x: 0, y: 0 },
    subtitle: { x: 0, y: 0 },
    author: { x: 0, y: 0 },
    badge: { x: 0, y: 0 },
    graphic: { x: 0, y: 0 },
  };
}

function formatCssNumber(value: number) {
  return String(Math.round(value * 100) / 100);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
