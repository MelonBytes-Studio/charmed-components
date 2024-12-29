import { Flamework } from "@flamework/core";

export let isIgnited = false;

export function ignite() {
	if (isIgnited) return;

	isIgnited = true;

	Flamework.addPaths("src/./");
	Flamework.ignite();
}
