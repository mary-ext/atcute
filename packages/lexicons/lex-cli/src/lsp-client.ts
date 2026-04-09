import { spawn } from 'node:child_process';
import * as url from 'node:url';

import { getUtf8Length } from '@atcute/uint8array';

// #region types

interface Position {
	line: number;
	character: number;
}

interface Range {
	start: Position;
	end: Position;
}

interface TextEdit {
	range: Range;
	newText: string;
}

interface JsonRpcMessage {
	jsonrpc: '2.0';
	id?: number;
	method?: string;
	params?: unknown;
	result?: unknown;
	error?: { code: number; message: string; data?: unknown };
}

// #endregion

// #region text edits

const applyTextEdits = (code: string, edits: TextEdit[]): string => {
	if (edits.length === 0) {
		return code;
	}

	// build line start offsets
	const lineStarts = [0];
	for (let i = 0; i < code.length; i++) {
		if (code[i] === '\n') {
			lineStarts.push(i + 1);
		}
	}

	const positionToOffset = (pos: Position): number => {
		return (lineStarts[pos.line] ?? code.length) + pos.character;
	};

	// sort edits in reverse document order so earlier positions stay valid
	const sorted = edits.toSorted((a, b) => {
		const lineDiff = b.range.start.line - a.range.start.line;
		if (lineDiff !== 0) {
			return lineDiff;
		}
		return b.range.start.character - a.range.start.character;
	});

	let result = code;
	for (const edit of sorted) {
		const start = positionToOffset(edit.range.start);
		const end = positionToOffset(edit.range.end);
		result = result.slice(0, start) + edit.newText + result.slice(end);
	}

	return result;
};

// #endregion

const inferLanguageId = (filepath: string): string => {
	if (filepath.endsWith('.ts') || filepath.endsWith('.tsx')) {
		return 'typescript';
	}
	if (filepath.endsWith('.json')) {
		return 'json';
	}
	if (filepath.endsWith('.md') || filepath.endsWith('.markdown')) {
		return 'markdown';
	}
	return 'typescript';
};

/** LSP client for formatting documents */
export interface LspClient {
	/**
	 * formats a document via LSP textDocument/formatting
	 * @param code source code to format
	 * @param filepath filepath for language detection and URI
	 * @returns formatted code
	 */
	formatDocument(code: string, filepath: string): Promise<string>;
	/** shuts down the LSP server */
	dispose(): Promise<void>;
}

/**
 * creates an LSP client that communicates with a formatter over stdio
 * @param command shell command to spawn the LSP server
 * @param root project root for LSP rootUri
 * @returns an initialized LSP client ready for formatting
 */
export const createLspClient = async (command: string, root: string): Promise<LspClient> => {
	const child = spawn('sh', ['-c', command], {
		stdio: ['pipe', 'pipe', 'pipe'],
	});

	// prevent EPIPE crash when child exits mid-write; actual errors
	// are handled by the close/error handlers below
	child.stdin.on('error', () => {});

	// drain stderr so a chatty server doesn't block on a full pipe buffer
	child.stderr.resume();

	// #region JSON-RPC framing

	const pending = new Map<number, PromiseWithResolvers<unknown>>();
	let nextId = 1;
	let exited = false;

	const sendMessage = (message: Record<string, unknown>): void => {
		if (exited) {
			return;
		}

		const json = JSON.stringify(message);
		const byteLength = getUtf8Length(json);

		child.stdin.write(`Content-Length: ${byteLength}\r\n\r\n${json}`);
	};

	const sendRequest = (method: string, params?: unknown): Promise<unknown> => {
		if (exited) {
			return Promise.reject(new Error(`LSP server has already exited`));
		}

		const id = nextId++;
		const deferred = Promise.withResolvers<unknown>();

		pending.set(id, deferred);
		sendMessage({ jsonrpc: '2.0', id, method, params });

		return deferred.promise;
	};

	const sendNotification = (method: string, params?: unknown): void => {
		sendMessage({ jsonrpc: '2.0', method, params });
	};

	// incremental message parser
	const HEADER_SEPARATOR = Buffer.from('\r\n\r\n');

	let buffer: Buffer = Buffer.alloc(0);
	let contentLength = -1;

	const processBuffer = (): void => {
		while (true) {
			if (contentLength === -1) {
				const separatorIndex = buffer.indexOf(HEADER_SEPARATOR);
				if (separatorIndex === -1) {
					break;
				}

				const header = buffer.toString('utf8', 0, separatorIndex);
				const match = header.match(/Content-Length:\s*(\d+)/i);

				buffer = buffer.subarray(separatorIndex + 4);

				if (!match) {
					continue;
				}

				contentLength = parseInt(match[1], 10);
			}

			if (buffer.length < contentLength) {
				break;
			}

			const body = buffer.toString('utf8', 0, contentLength);
			buffer = buffer.subarray(contentLength);
			contentLength = -1;

			let message: JsonRpcMessage;
			try {
				message = JSON.parse(body);
			} catch {
				continue;
			}

			if (message.id != null) {
				const entry = pending.get(message.id);
				if (entry) {
					pending.delete(message.id);

					if (message.error) {
						entry.reject(new Error(`LSP error ${message.error.code}: ${message.error.message}`));
					} else {
						entry.resolve(message.result);
					}
				} else if (message.method != null) {
					// server-initiated request — reply with MethodNotFound so it doesn't hang
					sendMessage({
						jsonrpc: '2.0',
						id: message.id,
						error: { code: -32601, message: `method not found` },
					});
				}
			}
		}
	};

	child.stdout.on('data', (chunk: Buffer) => {
		buffer = buffer.length > 0 ? Buffer.concat([buffer, chunk]) : chunk;
		processBuffer();
	});

	const rejectPending = (error: Error): void => {
		for (const [, entry] of pending) {
			entry.reject(error);
		}
		pending.clear();
	};

	child.on('error', (err) => {
		exited = true;
		rejectPending(err);
	});

	child.on('close', (exitCode) => {
		exited = true;
		rejectPending(new Error(`LSP server exited unexpectedly with code ${exitCode}`));
	});

	// #endregion

	// #region initialize handshake

	const rootUri = url.pathToFileURL(root).href;

	await sendRequest('initialize', {
		processId: process.pid,
		clientInfo: { name: 'lex-cli' },
		rootUri,
		capabilities: {},
	});

	sendNotification('initialized');

	// #endregion

	return {
		async formatDocument(code, filepath) {
			const uri = url.pathToFileURL(filepath).href;
			const languageId = inferLanguageId(filepath);

			sendNotification('textDocument/didOpen', {
				textDocument: { uri, languageId, version: 1, text: code },
			});

			const edits = (await sendRequest('textDocument/formatting', {
				textDocument: { uri },
				options: { tabSize: 2, insertSpaces: false },
			})) as TextEdit[] | null;

			sendNotification('textDocument/didClose', {
				textDocument: { uri },
			});

			if (!edits || edits.length === 0) {
				return code;
			}

			return applyTextEdits(code, edits);
		},

		async dispose() {
			if (!exited) {
				await sendRequest('shutdown', null);
				sendNotification('exit');
			}

			if (!exited) {
				child.kill();
				await new Promise<void>((resolve) => child.on('close', resolve));
			}
		},
	};
};
