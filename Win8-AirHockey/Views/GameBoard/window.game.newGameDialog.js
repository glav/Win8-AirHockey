/// <reference path="../../js/worldConstants.js" />

window.game.newGameDialog = function () {
    "use strict";
    var _buttonContainer;
    var _optionYesCallback, _optionNoCallback;

    function initialise(optionYesCallback, optionNoCallback) {
        //_buttonContainer = document.getElementById("option-play-again");
        
        if (typeof optionYesCallback !== 'undefined') {
            _optionYesCallback = optionYesCallback;
        }
        if (typeof optionNoCallback !== 'undefined') {
            _optionNoCallback = optionNoCallback;
        }
    }
    
    function show(message, yesCallback, noCallback) {
        if (typeof yesCallback !== 'undefined') {
            _optionYesCallback = yesCallback;
        }
        if (typeof noCallback !== 'undefined') {
            _optionNoCallback = noCallback;
        }

        var displayMessage = "Want to play again?";
        if (typeof message !== 'undefined' && message !== '') {
            displayMessage = message + " - " + displayMessage;
        }
        var msgPopup = new Windows.UI.Popups.MessageDialog(displayMessage);
        msgPopup.commands.push(new Windows.UI.Popups.UICommand("Yes",_optionYesCallback));
        msgPopup.commands.push(new Windows.UI.Popups.UICommand("No",_optionNoCallback));
        var promise = msgPopup.showAsync();
    }
    

    return {
        initialise: initialise,
        show: show
    };

}();