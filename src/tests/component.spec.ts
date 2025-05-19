/// <reference types="@rbxts/testez/globals" />

import { CharmedComponent } from "component";
import { ignite } from "./flamework-test-utils";
import { Component, Components } from "@flamework/components";
import { Dependency, OnStart } from "@flamework/core";
import { CharmedComponents } from "service";
import { getIdentifier } from "utils";
import { Action, Subscribe } from "decorators";

@Component()
class MyCharmedComponent extends CharmedComponent<{ i: number }> {
	protected defaultState = {
		i: 1,
	};
	protected useMostClosestComponentForId = false;

	@Action
	public add(value: number) {
		return (previous: { i: number }) => {
			return {
				i: previous.i + value,
			};
		};
	}

	@Subscribe((state) => state.i)
	public onUpdate(i: number) {
		print("new i is", i);
	}
}

@Component()
class ParentCharmedComponent extends CharmedComponent<number> {
	protected defaultState: number = 0;
}

@Component()
class ChildCharmedComponent extends ParentCharmedComponent {}

const getIdOfCharmedComponent = (component: CharmedComponent) =>
	(CharmedComponent as never as { getId: (self: CharmedComponent) => string }).getId(component);

export = function () {
	let components: Components;
	let charmedComponents: CharmedComponents;

	beforeAll(() => {
		ignite();

		components = Dependency<Components>();
		charmedComponents = Dependency<CharmedComponents>();
	});

	it("should initialize", () => {
		const part = new Instance("Part");
		const component = components.addComponent<MyCharmedComponent>(part);

		expect(component.attributes.__ID).to.be.ok();
		expect(component.getState().i).to.equal(1);

		const componentId = getIdOfCharmedComponent(component);
		expect(charmedComponents.componentAtoms.tryGetAtom(componentId)).to.be.ok();

		components.removeComponent<MyCharmedComponent>(part);
		part.Destroy();
	});

	it("should destroy", () => {
		const part = new Instance("Part");
		const component = components.addComponent<MyCharmedComponent>(part);
		const componentId = getIdOfCharmedComponent(component);

		components.removeComponent<MyCharmedComponent>(part);
		part.Destroy();

		expect(charmedComponents.componentAtoms.tryGetAtom(componentId)).never.to.be.ok();
	});

	it("action & subscribe", () => {
		const part = new Instance("Part");
		const component = components.addComponent<MyCharmedComponent>(part);

		component.add(10);

		const componentId = getIdOfCharmedComponent(component);
		expect((charmedComponents.componentAtoms.get(componentId).getData() as { i: number }).i).to.equal(11);

		components.removeComponent<MyCharmedComponent>(part);
		part.Destroy();
	});

	it("sync", () => {
		const part = new Instance("Part");
		const component = components.addComponent<MyCharmedComponent>(part);

		const componentId = getIdOfCharmedComponent(component);
		const syncConnection = charmedComponents.watchDispatch((_, payload) => {
			charmedComponents.sync(payload);
		});

		expect(charmedComponents.componentAtomsView.tryGetAtom(componentId)).never.to.be.ok();

		charmedComponents.hydrate({} as Player);
		task.wait(0.1);

		expect(charmedComponents.componentAtomsView.tryGetAtom(componentId)).to.be.ok();

		syncConnection();
		components.removeComponent<MyCharmedComponent>(part);
		part.Destroy();
	});

	it("should correctly initialize childs of charmed components", () => {
		const part = new Instance("Part");
		const child = components.addComponent<ChildCharmedComponent>(part);

		const componentId = getIdOfCharmedComponent(child);
		expect(componentId).to.equal(`${child.attributes.__ID}[$mb:tests/component.spec@ParentCharmedComponent]`);
	});
};
