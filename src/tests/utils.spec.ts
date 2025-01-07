/// <reference types="@rbxts/testez/globals" />

import { findFirstChildOf, getIdentifier } from "utils";
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

	it("findFirstChildOf", () => {
		class A {}
		class B extends A {}
		class C extends B {}

		expect(findFirstChildOf(A, B)).to.equal(B);
		expect(findFirstChildOf(A, C)).to.equal(B);

		expect(findFirstChildOf(A, new B())).to.equal(B);
		expect(findFirstChildOf(A, A)).never.to.be.ok();
	});
};
