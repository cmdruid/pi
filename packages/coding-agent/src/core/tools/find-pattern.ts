/** Basename foo and star-star/foo become a basename glob. Path globs keep --full-path. */
export function normalizeFindPattern(raw: string): { glob: string; fullPath: boolean } {
	const p = raw.trim();
	if (!p) return { glob: "*", fullPath: false };
	const starStar = p.match(/^\*\*\/([^/]+)$/);
	if (starStar) return { glob: starStar[1], fullPath: false };
	if (!p.includes("/")) return { glob: p, fullPath: false };
	let glob = p;
	if (!p.startsWith("/") && !p.startsWith("**/") && p !== "**") glob = `**/${p}`;
	return { glob, fullPath: true };
}

export function formatFindListing(paths: string[]): string {
	const groups = new Map<string, string[]>();
	for (const p of paths) {
		const i = p.lastIndexOf("/");
		const dir = i === -1 ? "." : p.slice(0, i);
		const name = i === -1 ? p : p.slice(i + 1);
		const arr = groups.get(dir) ?? [];
		arr.push(name);
		groups.set(dir, arr);
	}
	const lines: string[] = [];
	for (const [dir, names] of groups) {
		lines.push(`${dir}/`);
		for (const n of names) lines.push(`  ${n}`);
	}
	return lines.join("\n");
}

export function findZeroHitMessage(pattern: string): string {
	return `No files matching ${pattern}. Basenames match anywhere (gitignore-aware). Content search is grep.`;
}
