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

export function glue(window) {
    wrap(window, 'addEventListener', function(addEventListener) {
        return function(event, listener, captured) {
            if (isFunction(listener)) {
                arguments[1] = wrapCallback(listener);
            }
            return addEventListener.apply(this, arguments);
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