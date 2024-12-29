import { BaseComponent, Component } from "@flamework/components";
import { OnInit, Reflect } from "@flamework/core";
import { Janitor } from "@rbxts/janitor";
import { HttpService } from "@rbxts/services";
import { AtomClass } from "@rbxts/sweet-charm";
import { AtomLink } from "atom-link";
import { IS_CLIENT, IS_SERVER } from "constants";
import { CharmedComponents } from "service";
import { getIdentifier } from "utils";

interface SubscribeMetadata<T, Y> {
	subscriber: (state: Y) => void;
	selector: (state: T) => Y;
}

@Component()
export abstract class CharmedComponent<
		State = any, // eslint-disable-line
		Attributes extends object = {},
		GameObject extends Instance = Instance,
	>
	extends BaseComponent<Attributes & { __ID: string | undefined }, GameObject>
	implements OnInit
{
	private janitor = new Janitor();

	private atom!: AtomClass<State>;
	private atomLink!: AtomLink<State>;

	protected abstract defaultState: State;

	constructor(private charmedComponents: CharmedComponents) {
		super();
	}

	/** @hidden */
	public onInit() {
		if (IS_SERVER) {
			this.onInitServer();
		}

		if (IS_CLIENT) {
			this.onInitClient();
		}

		this.setupSubscribers();
	}

	/** @hidden */
	public destroy() {
		const id = this.getId();

		super.destroy();
		this.janitor.Cleanup();

		if (IS_SERVER && id !== undefined) this.charmedComponents.componentAtoms.remove(id);
		if (this.atomLink) this.atomLink.unlink();
	}

	private onInitServer() {
		if (this.attributes.__ID === undefined) {
			this.attributes.__ID = HttpService.GenerateGUID(false) as never;
		}

		const id = this.getId();
		assert(id, "Failed to create id for component.");

		this.atom = new AtomClass(this.defaultState);
		this.charmedComponents.componentAtoms.define({
			[id]: this.atom,
		});
	}

	private onInitClient() {
		this.atomLink = new AtomLink(this.defaultState);

		const atomDefinedSubscription = this.charmedComponents.componentAtomsView.syncer.atomDefined.Connect(
			(name: string, atom: AtomClass<State>) => {
				const id = this.getId();

				if (id === undefined) {
					return;
				}

				if (id !== name) {
					return;
				}

				this.atomLink.linkTo(atom);
			},
		);

		const atomRemovedSubscription = this.charmedComponents.componentAtomsView.syncer.atomRemoved.Connect(
			(name: string) => {
				const id = this.getId();

				if (id === name) {
					this.atomLink.unlink();
				}
			},
		);

		const attributeSubscription = this.onAttributeChanged("__ID", () => {
			const id = this.getId();

			if (id === undefined) return;

			const newAtom = this.charmedComponents.componentAtomsView.tryGetAtom(id) as AtomClass<State> | undefined;

			if (newAtom === undefined) return;

			this.atomLink.linkTo(newAtom);
		});

		this.janitor.Add(attributeSubscription);
		this.janitor.Add(atomDefinedSubscription);
		this.janitor.Add(atomRemovedSubscription);

		const id = this.getId();

		if (id === undefined) {
			return;
		}

		const atom = this.charmedComponents.componentAtomsView.tryGetAtom(id) as AtomClass<State> | undefined;

		if (atom !== undefined) {
			this.atomLink.linkTo(atom);
		}
	}

	private setupSubscribers() {
		Reflect.getProperties(this).forEach((property) => {
			const subscriber = Reflect.getMetadata<SubscribeMetadata<State, unknown>>(this, "subscribe", property);

			if (!subscriber) return;

			this.janitor.Add(this.subscribe(subscriber.selector, subscriber.subscriber));
		});
	}

	private getId() {
		const instanceId = this.attributes.__ID;

		if (instanceId === undefined) {
			return undefined;
		}

		const componentId = getIdentifier(this);
		return `${this.attributes.__ID}[${componentId}]`;
	}

	public getState(): State {
		return IS_CLIENT ? this.atomLink.getData() : this.atom.getData();
	}

	public setState(stateUpdate: State | ((previous: State) => State)) {
		assert(IS_SERVER, "CharmedComponent state can be updated only on server");
		this.atom!.update(stateUpdate as State);
	}

	public subscribe<Y>(selector: (state: State) => Y, callback: (state: Y, previousState: Y) => void): () => void;
	public subscribe(callback: (state: State, previousState: State) => void): () => void;
	public subscribe(...args: unknown[]) {
		if (IS_SERVER) {
			return this.atom.subscribe(...(args as [never, never]));
		}

		return this.atomLink.subscribe(...(args as [never, never]));
	}

	public isSynced() {
		if (IS_SERVER) {
			return true;
		}

		return this.atomLink.isLinked();
	}
}
