/// <reference path="../../js/worldConstants.js" />

window.game.dialog = function () {
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

        var msgPopup = new Windows.UI.Popups.MessageDialog(message);
        msgPopup.commands.push(new Windows.UI.Popups.UICommand("Yes",_optionYesCallback));
        msgPopup.commands.push(new Windows.UI.Popups.UICommand("No", _optionNoCallback));
        try {
            var promise = msgPopup.showAsync();
        } catch (e) {

        }
    }
    

    return {
        initialise: initialise,
        show: show
    };

}();