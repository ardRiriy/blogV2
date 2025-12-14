import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import decodeJpeg, { init as initJpeg } from '@jsquash/jpeg/decode';
import decodePng, { init as initPng } from '@jsquash/png/decode';
import encodeWebp, { init as initWebp } from '@jsquash/webp/encode';
// @ts-ignore
import jpegDecWasm from '@jsquash/jpeg/codec/dec/mozjpeg_dec.wasm';
// @ts-ignore
import pngDecWasm from '@jsquash/png/codec/pkg/squoosh_png_bg.wasm';
// @ts-ignore
import webpEncWasm from '@jsquash/webp/codec/enc/webp_enc_simd.wasm';

export interface Env {
	NOTION_API_KEY: string;
	RUST_BACKEND_URL: string;
	MY_BUCKET: R2Bucket;
	RUST: Service;
	PUBLIC_IMAGE_BASE_URL: string;
	ADRY_TOKEN: string;
}
let isWasmInitialized = false;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (!isWasmInitialized) {
			await Promise.all([
				initJpeg(jpegDecWasm), // JPEGデコード用Wasm
				initPng(pngDecWasm), // PNGデコード用Wasm
				initWebp(webpEncWasm), // WebPエンコード用Wasm
			]);
			isWasmInitialized = true;
		}

		if (request.method !== 'POST') {
			return new Response('Method Not Allowed', { status: 405 });
		}

		try {
			const payload: any = await request.json();
			const isPublish = payload?.data?.properties['公開']?.checkbox;
			const urlSuffixArray = payload?.data?.properties?.url_suffix?.rich_text;
			const urlSuffix = urlSuffixArray.map((obj: any) => obj?.plain_text).join('');

			if (!isPublish) {
				const path = `${env.RUST_BACKEND_URL}/articles`;
				console.log(`Sending to: [${path}]`);

				const rustResponse = await env.RUST.fetch(path, {
					method: 'DELETE',
					headers: { Authorization: 'Bearer ' + env.ADRY_TOKEN },
				});
				const body = await rustResponse.text();
				console.log(body);
				return new Response('Success: Sent to Rust backend', { status: 200 });
			} else {
				const pageId = payload?.data?.id;

				const notion = new Client({
					auth: env.NOTION_API_KEY,
					fetch: (url, init) => {
						return fetch(url, init);
					},
				});

				const tags = payload?.data?.properties['タグ']?.multi_select?.map((obj: any) => obj?.name);
				const title = payload?.data?.properties['タイトル']?.title?.map((obj: any) => obj?.plain_text).join('');

				if (!pageId) {
					return new Response("Error: Missing 'data.id' in payload", { status: 400 });
				}

				console.log(`Processing Page ID: ${pageId}`);

				const n2m = new NotionToMarkdown({ notionClient: notion });

				const mdBlocks = await n2m.pageToMarkdown(pageId);

				const replacedMdBlocks = await Promise.all(
					mdBlocks.map(async (block) => {
						if (block.type === 'image') {
							const match = block.parent.match(/\!\[(.*?)\]\((.*?)\)/);

							if (match && match[2]) {
								const originalUrl = match[2];
								const blockId = block.blockId; // これをファイル名にする

								const newUrl = await uploadImageToR2(env, originalUrl, blockId);

								if (newUrl) {
									block.parent = `![${match[1] || 'image'}](${newUrl})`;
									console.log(`Uploaded & Replaced: ${blockId}`);
								}
							}
						}
						return block;
					}),
				);

				const mdString = n2m.toMarkdownString(replacedMdBlocks);
				const rustPayload = {
					title: title,
					content: mdString.parent,
					url_suffix: urlSuffix,
					tags: tags,
				};
				const path = `${env.RUST_BACKEND_URL}/articles`;
				console.log(`Sending to: [${path}]`);

				const rustResponse = await env.RUST.fetch(path, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.ADRY_TOKEN },
					body: JSON.stringify(rustPayload),
				});
				const body = await rustResponse.text();
				console.log(body);

				return new Response('Success: Sent to Rust backend', { status: 200 });
			}
		} catch (e: any) {
			console.error(e);
			return new Response(`Server Error: ${e.message}`, { status: 500 });
		}
	},
};

async function uploadImageToR2(env: Env, url: string, blockId: string): Promise<string | null> {
	try {
		const imageRes = await fetch(url);
		if (!imageRes.ok) throw new Error('Failed to fetch image from Notion');

		const contentType = imageRes.headers.get('content-type') || 'image/png';
		const ext = getExtensionFromMime(contentType);

		let imageBuffer = await imageRes.arrayBuffer();
		let finalExt = getExtensionFromMime(contentType);
		let finalContentType = contentType;

		if (contentType === 'image/jpeg' || contentType === 'image/png') {
			try {
				console.log(`Optimizing image: ${blockId}`);
				let rawImageData;
				if (contentType === 'image/jpeg') {
					rawImageData = await decodeJpeg(imageBuffer);
				} else {
					rawImageData = await decodePng(imageBuffer);
				}

				const webpBuffer = await encodeWebp(rawImageData, { quality: 80 });

				imageBuffer = webpBuffer;
				finalExt = 'webp';
				finalContentType = 'image/webp';
				console.log(`Optimization success: ${blockId}.webp`);
			} catch (optError) {
				console.error(`Optimization failed for ${blockId}, using original image.`, optError);
			}
		}

		const filename = `${blockId}.${finalExt}`;
		await env.MY_BUCKET.put(filename, imageBuffer, {
			httpMetadata: { contentType: finalContentType },
		});
		return `${env.PUBLIC_IMAGE_BASE_URL}/${filename}`;
	} catch (e) {
		console.error(`Failed to upload image ${blockId}:`, e);
		return null;
	}
}

function getExtensionFromMime(mime: string): string {
	switch (mime) {
		case 'image/jpeg':
			return 'jpg';
		case 'image/png':
			return 'png';
		case 'image/gif':
			return 'gif';
		case 'image/webp':
			return 'webp';
		default:
			return 'png'; // fallback
	}
}
