/// <reference types="@rbxts/testez/globals" />

import { getIdentifier } from "utils";
import { ignite } from "./flamework-test-utils";
import { Dependency } from "@flamework/core";
import { CharmedComponents } from "service";

export = function () {
	beforeAll(() => {
		ignite();
	});

	it("getIdentifier", () => {
		expect(getIdentifier({})).to.equal(undefined);
		expect(getIdentifier(Dependency<CharmedComponents>())).to.be.ok();
	});
};
