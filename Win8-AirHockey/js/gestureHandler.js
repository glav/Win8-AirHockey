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
    }
};


