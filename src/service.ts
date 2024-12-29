import { Controller, OnInit, Service } from "@flamework/core";
import { AtomClass, AtomRepository, AtomRepositoryView, Payload } from "@rbxts/sweet-charm";
import { IS_CLIENT, IS_SERVER } from "constants";

export type AtomComponents = {
	[componentId in string]: AtomClass<any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

@Controller({ loadOrder: 0 })
@Service({ loadOrder: 0 })
export class CharmedComponents implements OnInit {
	public componentAtoms!: AtomRepository<AtomComponents>;
	public componentAtomsView!: AtomRepositoryView<AtomComponents>;

	constructor() {
		if (IS_CLIENT) {
			this.componentAtoms = new AtomRepository();
		}

		if (IS_SERVER) {
			this.componentAtomsView = new AtomRepositoryView();
		}
	}

	/** @hidden */
	public onInit() {
		this.componentAtoms?.syncer.start(0);
	}

	public hydrate(player: Player) {
		assert(IS_CLIENT, "Method hydrate in CharmedComponents can only be called on server");
		this.componentAtoms!.syncer.hydrate(player);
	}

	public watchDispatch(watcher: (player: Player, payload: Payload) => void) {
		assert(IS_CLIENT, "Method watchDispatch in CharmedComponents can only be called on server");
		return this.componentAtoms!.syncer.watchDispatch(watcher);
	}

	public sync(payload: Payload) {
		assert(IS_CLIENT, "Method sync in CharmedComponents can only be called on client");
		this.componentAtomsView!.syncer.sync(payload);
	}
}
