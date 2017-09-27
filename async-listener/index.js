import {
    wrapCallback
} from './listener';
import wrap from 'func-wrapper';
import {
    isFunction
} from 'js-is-type';
import {
    applyFunction
} from 'tingyun-browser-util';

export default function glue(window) {
    var proto = window.EventTarget && window.EventTarget.prototype;
    wrap(proto, 'addEventListener', function(addEventListener) {
        return function(event, listener, captured) {
            if (isFunction(listener)) {
                listener.__wrap = wrapCallback(listener);
                arguments[1] = listener.__wrap;
            }
            return addEventListener.apply(this, arguments);
        }
    });
    wrap(proto, 'removeEventListener', function(removeEventListener) {
        return function(event, listener, captured) {
            if (listener && listener.__wrap) {
                return removeEventListener.call(this, event, listener.__wrap, captured);
            }
            return removeEventListener.apply(this, arguments);
        }
    });

    wrap(window, 'setTimeout', wrapTimer);
    wrap(window, 'setInterval', wrapTimer);

    function wrapTimer(timer) {
        return function(func) {
            if (isFunction(func)) {
                arguments[0] = wrapCallback(func);
            }
            if (timer.apply) {
                return timer.apply(this, arguments);
            }
            var self = this;
            return applyFunction(timer, [self, arguments]);
        }
    }
}