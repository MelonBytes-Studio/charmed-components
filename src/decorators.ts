import { Reflect } from "@flamework/core";
import { CharmedComponent } from "component";

type StateAction<T> = TypedPropertyDescriptor<(this: CharmedComponent<T>, ...args: unknown[]) => T>;
type CallbackAction<T> = TypedPropertyDescriptor<(this: CharmedComponent<T>, ...args: unknown[]) => (previous: T) => T>;
type UndefinedAction<T> = TypedPropertyDescriptor<(this: CharmedComponent<T>, ...args: unknown[]) => undefined>;

export function Action<T>(_: CharmedComponent<T>, __: string, descriptor: StateAction<T>): StateAction<T>;
export function Action<T>(_: CharmedComponent<T>, __: string, descriptor: CallbackAction<T>): CallbackAction<T>;
export function Action<T>(_: CharmedComponent<T>, __: string, descriptor: UndefinedAction<T>): UndefinedAction<T>;
export function Action<T>(
	_: CharmedComponent<T>,
	__: string,
	descriptor: TypedPropertyDescriptor<(this: CharmedComponent<T>, ...args: unknown[]) => unknown>,
) {
	const previousMethod = descriptor.value;

	descriptor.value = function (this: CharmedComponent<T>, ...args: unknown[]) {
		const result = previousMethod(this, ...args) as T | undefined;

		if (result === undefined) return;

		this.setState(result);
		return result;
	};

	return descriptor;
}

export function Subscribe<T, Y>(selector: (state: T) => Y) {
	return (
		target: CharmedComponent<T>,
		propertyName: string,
		descriptor: TypedPropertyDescriptor<(this: CharmedComponent<T>, state: Y, previousState: Y) => void>,
	) => {
		const previousMethod = descriptor.value;
		const subscriber = function (this: CharmedComponent<T>, state: Y, previousState: Y) {
			previousMethod(this, state, previousState);
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
