import { Reflect } from "@flamework/core";
import { Constructor } from "@flamework/core/out/utility";

type MetatableWithMaybeIndex = {
	__index: Constructor | undefined;
};

export function getParentConstructor(child: object): Constructor | undefined {
	const parent = getmetatable(child) as MetatableWithMaybeIndex | undefined;

	if (parent === undefined) {
		return;
	}

	if (typeOf(parent.__index) !== "table") {
		return;
	}

	return parent.__index;
}

export function findFirstChildOf(target: Constructor, child: object) {
	if (target === child) return;

	let currentNode: object | undefined = child;

	while (currentNode !== undefined) {
		const parent = getParentConstructor(currentNode);

		if (parent === target) {
			return currentNode;
		}

		currentNode = parent;
	}

	return;
}

export function getIdentifier(obj: object): string | undefined {
	return Reflect.getMetadata(obj, "identifier");
}
