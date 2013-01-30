/// <reference path="../../js/worldConstants.js" />

window.game.newGameDialog = function () {
    "use strict";
    var _buttonContainer;
    var _optionYesCallback, _optionNoCallback;

    function initialise(optionYesCallback, optionNoCallback) {
        _buttonContainer = document.getElementById("option-play-again");
        
        if (typeof optionYesCallback !== 'undefined') {
            _optionYesCallback = optionYesCallback;
            document.getElementById("option-play-yes").addEventListener('click', handleYesOption, false);
        }
        if (typeof optionNoCallback !== 'undefined') {
            document.getElementById("option-play-no").addEventListener('click', handleNoOption, false);
            _optionNoCallback = optionNoCallback;
        }
    }
    
    function handleYesOption() {
        hide();
        _optionYesCallback();
    }
    
    function handleNoOption() {
        hide();
        _optionNoCallback();
    }
    function show() {
        // Show the options to restart the game or end it when in single player mode
        _buttonContainer.style.display = "block";
    }
    
    function hide() {
        // Show the options to restart the game or end it when in single player mode
        _buttonContainer.style.display = "none";
    }

    return {
        initialise: initialise,
        show: show,
        hide:hide
    };

}();