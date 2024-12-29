import { Reflect } from "@flamework/core";
import { CharmedComponent } from "component";

export function Action<T>(
	_: CharmedComponent<T>,
	__: string,
	descriptor: TypedPropertyDescriptor<(this: CharmedComponent<T>, ...args: unknown[]) => T>,
) {
	const previousMethod = descriptor.value;

	descriptor.value = function (this: CharmedComponent<T>, ...args: unknown[]) {
		const result = previousMethod(this, ...args);
		this.setState(result);
		return result;
	};

	return descriptor;
}

export function Subscribe<T, Y>(selector: (state: T) => Y) {
	return (
		target: CharmedComponent<T>,
		propertyName: string,
		descriptor: TypedPropertyDescriptor<(this: CharmedComponent<T>, state: Y) => void>,
	) => {
		const previousMethod = descriptor.value;
		const subscriber = (state: Y) => {
			previousMethod(target, state);
		};

		descriptor.value = (...args: unknown[]) => {
			error(`Method "${propertyName}" can't be called, because it's state subscriber.`);
		};

		Reflect.defineMetadata(
			target,
			"subscribe",
			{
				selector: selector,
				subscriber: subscriber,
			},
			propertyName,
		);

		return descriptor;
	};
}
