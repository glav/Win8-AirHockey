window.game.ui.settings = function () {

    "use strict";

    function onChangeRange(e) {
        var labelId = e.target.getAttribute('data-update-label');
        if (labelId && labelId !== null && labelId !== '') {
            var label = document.getElementById(labelId);
            //Some special handling if its a difficulty level label. We need to call the converter\
            //to get the actual description
            if (labelId.indexOf('difficulty') >= 0) {
                label.innerText = window.game.settings.getDifficultyLevelDescription(e.target.value);
            } else {
                label.innerText = e.target.value;
            }
        }
    }

    function manageInputRangeEvents(subscribeToEvents) {
        var allRangeControls = document.getElementsByClassName('slider');
        var numControls = allRangeControls.length;
        for (var cnt = 0; cnt < numControls; cnt++) {
            var el = allRangeControls[cnt];
            if (subscribeToEvents === true) {
                el.addEventListener("change", onChangeRange);
            } else {
                el.removeEventListener("change", onChangeRange);
            }
        }

    }

    return {
        manageInputRangeEvents: manageInputRangeEvents
    };
    
}();