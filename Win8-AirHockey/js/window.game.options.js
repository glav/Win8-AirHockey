/// <reference path="//Microsoft.WinJS.1.0/js/base.js" />
(function () {
	"use strict";

	WinJS.Application.onsettings = function (e) {
		e.detail.applicationcommands = {
		    singlePlayerFlyout: { title: 'Single Player', href: '/Views/Options/SinglePlayerOptions.html' },
		    twoPlayerFlyout: { title: 'Two Player', href: '/Views/Options/TwoPlayerOptions.html' },
		    scoringOptionsFlyout: { title: 'Scoring', href: '/Views/Options/ScoringOptions.html' }

		};

		WinJS.UI.SettingsFlyout.populateSettings(e);

	};

    // Setup the difficulty level options converter
	window.game.settings.difficultyLevelConverter = WinJS.Binding.converter(function (value) {
	    return window.game.settings.getDifficultyLevelDescription(value);
	});

})();