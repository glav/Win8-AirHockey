var gestureHandler = {

    addMovementEventListeners: function (options) {
        var msGesture = new MSGesture();
        msGesture.target = options.element;
        options.element.gesture = msGesture;
        options.element.gesture.pointerType = null;

        options.element.pointers = [];

        options.element.addEventListener("MSPointerDown", options.onMSPointerDown, false);
        options.element.addEventListener("MSPointerUp", options.onMSPointerUp, false);
        options.element.addEventListener("MSPointerCancel", options.onMSPointerCancel, false);
        options.element.addEventListener("MSLostPointerCapture", options.onMSLostPointerCapture, false);
        options.element.addEventListener("MSPointerMove", options.onMSPointerMove, false);

        options.element.addEventListener("MSGestureChange", options.onMSGestureChange, false);
        options.element.addEventListener("MSGestureTap", options.onMSGestureTap, false);
        options.element.addEventListener("MSGestureEnd", options.onMSGestureEnd, false);
        options.element.addEventListener("MSGestureHold", options.onMSGestureHold, false);
        options.element.addEventListener("MSInertiaStart", options.onMSInertiaStart, false);
        options.element.addEventListener("MSGestureStart", options.onMSGestureStart, false);

    },
    clearMovementEventListeners: function (options) {
        if (options.element.gesture) {
            options.element.gesture.stop();
            options.element.gesture = null;
        }

        options.element.pointers = null;

        options.element.removeEventListener("MSPointerDown", options.onMSPointerDown, false);
        options.element.removeEventListener("MSPointerUp", options.onMSPointerUp, false);
        options.element.removeEventListener("MSPointerCancel", options.onMSPointerCancel, false);
        options.element.removeEventListener("MSLostPointerCapture", options.onMSLostPointerCapture, false);
        options.element.removeEventListener("MSPointerMove", options.onMSPointerMove, false);

        options.element.removeEventListener("MSGestureChange", options.onMSGestureChange, false);
        options.element.removeEventListener("MSGestureTap", options.onMSGestureTap, false);
        options.element.removeEventListener("MSGestureEnd", options.onMSGestureEnd, false);
        options.element.removeEventListener("MSGestureHold", options.onMSGestureHold, false);
        options.element.removeEventListener("MSInertiaStart", options.onMSInertiaStart, false);
        options.element.removeEventListener("MSGestureStart", options.onMSGestureStart, false);

    }

};


