/*global QUnit*/

sap.ui.define([
	"com/bgl/app/vendorageing2/controller/VendorAgeingReport.controller"
], function (Controller) {
	"use strict";

	QUnit.module("VendorAgeingReport Controller");

	QUnit.test("I should test the VendorAgeingReport controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
