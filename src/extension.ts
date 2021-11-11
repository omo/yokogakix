import internal = require('stream');
import { TextDecoder, TextEncoder } from 'util';
import * as vscode from 'vscode';

function toZeroPaddedString(num: number, digit: number) : string {
	let numAsStr = num.toString();
	while (numAsStr.length < digit) {
		numAsStr = "0" + numAsStr;
	}

	return numAsStr;
}

async function exists(uri: vscode.Uri) : Promise<boolean> {
	try {
		await vscode.workspace.fs.stat(uri);
		return true;
	} catch (e) {
		return false;
	}
}

function createFrontMatter(y: string, m: string, d: string) : Uint8Array {
	let text = `---
title: "Untitled"
date: "${y}-${m}-${d}"
draft: true
tags: []
---
`;

	return new TextEncoder().encode(text);
}

async function createUntitled(dir: vscode.Uri, content: Uint8Array) : Promise<vscode.Uri | null> {
	for (let i = 0; i < 20; i++) {
		let base = i == 0 ? 'untitled.md' : `untitled_${i}.md`;
		let file = vscode.Uri.joinPath(dir, base);
		if (!await exists(file)) {
			await vscode.workspace.fs.writeFile(file, content);
			return file;
		}
	}

	return null;
}

async function createPostStub() : Promise<any> {
	let root = vscode.workspace.workspaceFolders![0].uri;
	let now = new Date();
	let y = toZeroPaddedString(now.getFullYear(), 4);
	let m = toZeroPaddedString(now.getMonth() + 1, 2);
	let d = toZeroPaddedString(now.getDate(), 2);
	let dir = vscode.Uri.joinPath(root, `post/${y}/${m}`);
	let file = await createUntitled(dir, createFrontMatter(y, m, d)); 
	if (!file) {
		vscode.window.showInformationMessage('Cannot create new post :-(');
		return;
	}

	let doc = await vscode.workspace.openTextDocument(file);
	await vscode.window.showTextDocument(doc);
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.commands.registerCommand('yokogakix.createPostStub', createPostStub));
}

export function deactivate() {}
