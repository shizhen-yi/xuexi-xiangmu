import { createWriteStream } from 'node:fs';
import { mkdir, stat, unlink, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';

type AssetSpec = {
  readonly id: string;
  readonly target: string;
  readonly resolve: () => Promise<string>;
  readonly allowEmptyFallback?: boolean;
};

type AssetStatus = 'OK' | 'FAILED' | 'WARNING';

type AssetResult = {
  readonly asset: AssetSpec;
  readonly status: AssetStatus;
  readonly sizeBytes: number;
  readonly downloadedBytes: number;
  readonly message: string;
};

type PolyhavenFile = {
  readonly url?: unknown;
  readonly size?: unknown;
};

type PolyhavenFormatMap = Readonly<Record<string, PolyhavenFile | undefined>>;
type PolyhavenResolutionMap = Readonly<Record<string, PolyhavenFormatMap | undefined>>;
type PolyhavenFiles = Readonly<Record<string, PolyhavenResolutionMap | undefined>>;
type TextureKind = 'nor_gl' | 'rough';

const PROJECT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEXTURE_CANDIDATES = [
  'brick_wall_03',
  'weathered_brown_planks',
  'brick_wall_001',
  'rock_pitted_mossy',
] as const;

const AUDIO_URLS = [
  'https://cdn.pixabay.com/audio/2024/05/04/audio_92e3a4c14d.mp3',
  'https://cdn.pixabay.com/audio/2023/06/15/audio_e7a3e16ec1.mp3',
] as const;

const ASSETS: readonly AssetSpec[] = [
  {
    id: 'hdri/studio_small_09',
    target: 'public/hdri/studio_small_09_1k.hdr',
    resolve: resolvePolyhavenHdri('studio_small_09'),
  },
  {
    id: 'textures/wall_normal',
    target: 'public/textures/wall_normal_1k.jpg',
    resolve: resolvePolyhavenTexture(TEXTURE_CANDIDATES, 'nor_gl'),
  },
  {
    id: 'textures/wall_roughness',
    target: 'public/textures/wall_roughness_1k.jpg',
    resolve: resolvePolyhavenTexture(TEXTURE_CANDIDATES, 'rough'),
  },
  {
    id: 'videos/hero',
    target: 'public/videos/hero.mp4',
    resolve: async () =>
      'https://videos.pexels.com/video-files/3018669/3018669-uhd_2560_1440_30fps.mp4',
  },
  {
    id: 'videos/work',
    target: 'public/videos/work.mp4',
    resolve: async () =>
      'https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_24fps.mp4',
  },
  {
    id: 'audio/ambient',
    target: 'public/audio/ambient.mp3',
    resolve: resolveFirstAvailableUrl(AUDIO_URLS),
    allowEmptyFallback: true,
  },
];

async function main(): Promise<void> {
  const results: AssetResult[] = [];

  for (const [index, asset] of ASSETS.entries()) {
    results.push(await fetchAsset(asset, index + 1, ASSETS.length));
  }

  printSummary(results);
}

async function fetchAsset(asset: AssetSpec, index: number, total: number): Promise<AssetResult> {
  const targetPath = resolve(PROJECT_ROOT, asset.target);
  await mkdir(dirname(targetPath), { recursive: true });

  const cachedSize = await getFileSize(targetPath);
  if (cachedSize > 0) {
    console.log(
      `[${index}/${total}] ${asset.id} -> ${asset.target} ... skipped (cached, ${formatBytes(cachedSize)})`,
    );

    return {
      asset,
      status: 'OK',
      sizeBytes: cachedSize,
      downloadedBytes: 0,
      message: 'cached',
    };
  }

  try {
    const url = await asset.resolve();
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    const contentLength = parseContentLength(response.headers.get('content-length'));
    console.log(
      `[${index}/${total}] ${asset.id} -> ${asset.target} ... downloading ${
        contentLength === undefined ? 'unknown size' : formatBytes(contentLength)
      }`,
    );

    const body = response.body as unknown as Parameters<typeof Readable.fromWeb>[0];
    const stream = Readable.fromWeb(body);
    const file = createWriteStream(targetPath);
    stream.pipe(file);
    await finished(file);

    const sizeBytes = await getFileSize(targetPath);

    return {
      asset,
      status: 'OK',
      sizeBytes,
      downloadedBytes: sizeBytes,
      message: 'downloaded',
    };
  } catch (error) {
    await removePartialFile(targetPath);

    const message = error instanceof Error ? error.message : String(error);

    if (asset.allowEmptyFallback) {
      await writeFile(targetPath, '');
      console.warn(
        `[${index}/${total}] ${asset.id} -> ${asset.target} ... WARNING: ${message}; wrote 0-byte placeholder`,
      );

      return {
        asset,
        status: 'WARNING',
        sizeBytes: 0,
        downloadedBytes: 0,
        message,
      };
    }

    console.warn(`[${index}/${total}] ${asset.id} -> ${asset.target} ... FAILED: ${message}`);

    return {
      asset,
      status: 'FAILED',
      sizeBytes: 0,
      downloadedBytes: 0,
      message,
    };
  }
}

function resolvePolyhavenHdri(assetId: string): () => Promise<string> {
  return async () => {
    const files = await fetchPolyhavenFiles(assetId);
    const url = files.hdri?.['1k']?.hdr?.url;

    if (typeof url !== 'string') {
      throw new Error(`Polyhaven HDRI URL missing for ${assetId}`);
    }

    return url;
  };
}

function resolvePolyhavenTexture(
  assetIds: readonly string[],
  kind: TextureKind,
): () => Promise<string> {
  return async () => {
    const failures: string[] = [];

    for (const assetId of assetIds) {
      try {
        const files = await fetchPolyhavenFiles(assetId);
        const resolution = getPolyhavenMap(files, kind)?.['1k'];
        const jpgUrl = resolution?.jpg?.url;
        const webpUrl = resolution?.webp?.url;

        if (typeof jpgUrl === 'string') {
          return jpgUrl;
        }

        if (typeof webpUrl === 'string') {
          return webpUrl;
        }

        failures.push(`${assetId}: ${kind} 1k jpg/webp URL missing`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${assetId}: ${message}`);
      }
    }

    throw new Error(`Polyhaven texture URL missing (${failures.join('; ')})`);
  };
}

function resolveFirstAvailableUrl(urls: readonly string[]): () => Promise<string> {
  return async () => {
    const failures: string[] = [];

    for (const url of urls) {
      try {
        const response = await fetch(url, { method: 'HEAD' });

        if (response.ok) {
          return url;
        }

        failures.push(`${url}: HTTP ${response.status}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        failures.push(`${url}: ${message}`);
      }
    }

    throw new Error(`No audio URL available (${failures.join('; ')})`);
  };
}

async function fetchPolyhavenFiles(assetId: string): Promise<PolyhavenFiles> {
  const response = await fetch(`https://api.polyhaven.com/files/${assetId}`);

  if (!response.ok) {
    throw new Error(`Polyhaven ${assetId} HTTP ${response.status}`);
  }

  const data: unknown = await response.json();

  if (!isRecord(data)) {
    throw new Error(`Polyhaven ${assetId} response is not an object`);
  }

  return data as PolyhavenFiles;
}

function getPolyhavenMap(files: PolyhavenFiles, key: string): PolyhavenResolutionMap | undefined {
  const direct = files[key];

  if (direct !== undefined) {
    return direct;
  }

  const matchingKey = Object.keys(files).find(
    (candidate) => candidate.toLowerCase() === key.toLowerCase(),
  );

  return matchingKey === undefined ? undefined : files[matchingKey];
}

async function getFileSize(path: string): Promise<number> {
  try {
    const fileStat = await stat(path);
    return fileStat.size;
  } catch (error) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return 0;
    }

    throw error;
  }
}

async function removePartialFile(path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (error) {
    if (!isNodeError(error) || error.code !== 'ENOENT') {
      throw error;
    }
  }
}

function parseContentLength(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function printSummary(results: readonly AssetResult[]): void {
  const rows = results.map((result) => [
    result.asset.id,
    result.status,
    result.status === 'WARNING' ? '0 B' : formatBytes(result.sizeBytes),
  ]);
  const headers = ['Asset', 'Status', 'Size'];
  const widths = headers.map((header, index) =>
    Math.max(header.length, ...rows.map((row) => row[index].length)),
  );

  console.log('');
  console.log(drawBorder('top', widths));
  console.log(drawRow(headers, widths));
  console.log(drawBorder('middle', widths));
  for (const row of rows) {
    console.log(drawRow(row, widths));
  }
  console.log(drawBorder('bottom', widths));

  const okCount = results.filter((result) => result.status === 'OK').length;
  const failedCount = results.filter((result) => result.status === 'FAILED').length;
  const warningCount = results.filter((result) => result.status === 'WARNING').length;
  const totalDownloaded = results.reduce((sum, result) => sum + result.downloadedBytes, 0);
  const warningText = warningCount > 0 ? `, ${warningCount} WARNING` : '';

  console.log(
    `Total: ${results.length} assets, ${okCount} OK, ${failedCount} FAILED${warningText}, ${formatBytes(
      totalDownloaded,
    )} downloaded`,
  );

  for (const result of results) {
    if (result.status === 'FAILED') {
      console.log(`FAILED ${result.asset.id}: ${result.message}`);
    }

    if (result.status === 'WARNING') {
      console.log(`\u001B[31mWARNING ${result.asset.id}: ${result.message}\u001B[0m`);
    }
  }
}

function drawBorder(position: 'top' | 'middle' | 'bottom', widths: readonly number[]): string {
  const chars = {
    top: ['┌', '┬', '┐'],
    middle: ['├', '┼', '┤'],
    bottom: ['└', '┴', '┘'],
  }[position];

  return `${chars[0]}${widths.map((width) => '─'.repeat(width + 2)).join(chars[1])}${chars[2]}`;
}

function drawRow(cells: readonly string[], widths: readonly number[]): string {
  return `│ ${cells.map((cell, index) => cell.padEnd(widths[index])).join(' │ ')} │`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const megabytes = bytes / 1024 / 1024;
  return `${megabytes.toFixed(2)} MB`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
