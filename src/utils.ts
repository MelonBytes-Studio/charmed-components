import { Reflect } from "@flamework/core";

export function getIdentifier(obj: object): string | undefined {
	return Reflect.getMetadata(obj, "identifier");
}
