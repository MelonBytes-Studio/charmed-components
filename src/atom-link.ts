import { AtomClass } from "@rbxts/sweet-charm";

export class AtomLink<T> extends AtomClass<T> {
	private root?: AtomClass<T>;
	private subscription?: () => void;

	public update(...args: unknown[]): T {
		error("AtomLink can't be updated, you need to update root atom.");
	}

	public linkTo(newRoot: AtomClass<T>) {
		if (newRoot === this.root) return;

		this.subscription?.();
		this.root = newRoot;

		super.update(this.root.getData());

		this.subscription = this.root.subscribe((newState) => {
			super.update(newState);
		});
	}

	public unlink() {
		this.subscription?.();
		this.root = undefined;
	}

	public isLinked() {
		return this.root !== undefined;
	}
}
