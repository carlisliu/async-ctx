import {
    isFunction,
    isObject
} from 'js-is-type';

var HAS_CREATE_CALLBACK = 1 << 0;
var HAS_BEFORE_CALLBACK = 1 << 1;
var HAS_AFTER_CALLBACK = 1 << 2;
var HAS_ERROR_CALLBACK = 1 << 3;

function AsyncListener(callbacks, data) {
    this.flags = 0;
    if (isFunction(callbacks.create)) {
        this.create = callbacks.create;
        this.flags |= HAS_CREATE_CALLBACK;
    }
    if (isFunction(callbacks.before)) {
        this.before = callbacks.before;
        this.flags |= HAS_BEFORE_CALLBACK;
    }
    if (isFunction(callbacks.after)) {
        this.after = callbacks.after;
        this.flags |= HAS_AFTER_CALLBACK;
    }
    if (isFunction(callbacks.error)) {
        this.error = callbacks.error;
        this.flags |= HAS_ERROR_CALLBACK;
    }
    this.data = data;
}

var prototype = AsyncListener.prototype;
prototype.create = prototype.before = prototype.after = prototype.error = null;

var listener;

export function createAsyncListener(callbacks, data) {
    if (listener) {
        return;
    }
    if (!isObject(callbacks) || !callbacks) {
        throw new TypeError('callbacks arguments must be an object');
    }
    listener = new AsyncListener(callbacks, data);
    return listener;
}

function aysncWrap(original) {
    var value = listener.data;
    if ((listener.flags & HAS_CREATE_CALLBACK) !== 0) {
        var data = listener.create(listener.data);
        if (data !== undefined) {
            value = data;
        }
    }
    return function() {
        if ((listener.flags & HAS_BEFORE_CALLBACK) !== 0) {
            listener.before(this, value);
        }
        try {
            var result = original.apply(this, arguments);
        } catch (error) {
            if ((listener.flags & HAS_ERROR_CALLBACK) !== 0) {
                listener.error(value, error);
            }
            throw error;
        }
        if ((listener.flags & HAS_AFTER_CALLBACK) !== 0) {
            listener.after(this, value);
        }
        return result;
    }
}

export function wrapCallback(original) {
    if (!interceptor || interceptor.flags <= 0) {
        return original;
    }
    return aysncWrap(original);
};