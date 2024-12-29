/// <reference types="@rbxts/testez/globals" />

import { AtomClass } from "@rbxts/sweet-charm";
import { AtomLink } from "atom-link";

export = function () {
	it("not linked", () => {
		const atomLink = new AtomLink(0);

		expect(atomLink.getData()).to.equal(0);
		expect(atomLink.isLinked()).to.equal(false);

		expect(() => {
			atomLink.update(1);
		}).to.throw();
	});

	it("linked", () => {
		const atom = new AtomClass(1);
		const atomLink = new AtomLink(0);

		atomLink.linkTo(atom);

		expect(atomLink.isLinked()).to.equal(true);
		expect(atomLink.getData()).to.equal(1);

		atom.update(2);

		expect(atomLink.getData()).to.equal(2);

		atomLink.unlink();

		expect(atomLink.isLinked()).to.equal(false);

		atom.update(3);

		expect(atomLink.getData()).to.equal(2);
	});
};
