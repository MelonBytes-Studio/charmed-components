# 💫 Charmed Components

Library created to empower flamework components with [sweet-charm](https://github.com/MelonBytes-Studio/sweet-charm)!

# ⭐️ Credits

SUMER (sumer_real discord): creator of this library and sweet-charm!

Tesmi: the person who created [shared-component-flamework](https://github.com/Tesmi-Develop/shared-component-flamework/) that inspired me to create this library

# ☄️ Install

``npm install @rbxts/charmed-components``

# 📚 Documentation

## sync
first thing you need to wonder is about component synchronization, unlike shared-component-flamework this library gives full control over syncer to developer

```ts
const charmedComponents = Dependency<CharmedComponents>()


// server

charmedComponents.watchDispatch((player, payload) => {
	// send data here to player
});

charmedComponents.hydrate(player)  // you need to ask server to hydrate when player ready

// client

charmedComponents.sync(payload)  // use this to sync payload!
```

## create component

if you need to use onStart, you must call this.initialize() inside onStart before any operations this will initialize charmed component, without that you will get errors

```ts
interface State {
	someValue: number;
}

@Component()
class MyCharmedComponent extends CharmedComponent<State, {}, Instance> implements OnStart {
	protected defaultState = {
		someValue: 100,
	};

	public onStart() {
		this.initialize();
	}

	@Action
	public increment(by: number) {
		return (currentState: State) => {
			return {
				someValue: currentState.someValue + by
			};
		};
	}

	@Subscribe((state) => state.someValue)
	public someValueChanged(newValue: number) {
		print("someValue just changed to", newValue)
	}
}
```
