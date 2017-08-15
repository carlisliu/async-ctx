function create(proto) {
    function A() {}
    A.prototype = proto;
    return new A();
}

function AysncContext() {
    this.active = null;
    this._set = [];
}

AysncContext.prototype = {
    createContext: function() {
        return Object.create ? Object.create(this.active) : create(this.active);
    },
    get: function(key) {
        if (this.active) {
            return this.active[key];
        }
        throw new Error('no context is available!');
    },
    set: function(key, value) {
        if (this.active) {
            return (this.active[key] = value);
        }
    },
    enter: function(context) {
        if (!context) {
            throw new Error('context required!');
        }
        this._set.push(this.active);
        this.active = context;
    },
    exit: function(context) {
        if (!context) {
            throw new Error('context required!');
        }
        if (context === this.active) {
            this.active = this._set.pop();
            return;
        }

        var index = this._set.lastIndexOf(context);
        if (index < 0) {
            throw new Error('context not currently entered!');
        }
        this._set.splice(index, 1);
    },
    bind: function(fn, context) {
        if (!context) {
            context = this.active ? this.active : this.createContext();
        }
        var self = this;
        return function() {
            self.enter(context);
            try {
                return fn.apply(this, arguments);
            } catch (exception) {
                throw exception;
            } finally {
                self.exit(context);
            }
        }
    }
};

module.exports = AysncContext;