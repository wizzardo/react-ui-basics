var OBJECT = Object;

function _typeof(obj) {
    return typeof obj;
}

function throwTypeError(message) {
    throw new TypeError(message);
}

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throwTypeError("Cannot call a class as a function");
    }
}

function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;

        OBJECT.defineProperty(target, descriptor.key, descriptor);
    }
}

function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}

function _defineProperty(obj, key, value) {
    obj[key] = value;
    return obj;
}

function _extends() {
    _extends = OBJECT.assign || function (target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
                if (OBJECT.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }

        return target;
    };

    return _extends.apply(this, arguments);
}

function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i] != null ? arguments[i] : {};

        if (i % 2) {
            OBJECT.keys(source).forEach(function (key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (OBJECT.getOwnPropertyDescriptors) {
            OBJECT.defineProperties(target, OBJECT.getOwnPropertyDescriptors(source));
        } else {
            OBJECT.keys(source).forEach(function (key) {
                OBJECT.defineProperty(target, key, OBJECT.getOwnPropertyDescriptor(source, key));
            });
        }
    }

    return target;
}

function _inherits(subClass, superClass) {
    if (_typeof(superClass) !== "function" && superClass !== null) {
        throwTypeError("Super expression must either be null or a function");
    }

    subClass.prototype = OBJECT.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
    _getPrototypeOf = OBJECT.setPrototypeOf ? OBJECT.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || OBJECT.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
    _setPrototypeOf = OBJECT.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };

    return _setPrototypeOf(o, p);
}

function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = OBJECT.keys(source);
    var key, i;

    for (i = 0; i < sourceKeys.length; i++) {
        key = sourceKeys[i];
        excluded.indexOf(key) < 0 && (target[key] = source[key]);
    }

    return target;
}

function _assertThisInitialized(self) {
    if (self !== void 0) {
        return self;
    }
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
}

function _possibleConstructorReturn(self, call) {
    return call && (_typeof(call) === "object" || _typeof(call) === "function") ? call : _assertThisInitialized(self);
}

function _slicedToArray(arr) {
    return Array.isArray(arr) ? arr : throwTypeError("Invalid attempt to destructure non-iterable instance");
}


export {
    _assertThisInitialized as assertThisInitialized,
    _classCallCheck as classCallCheck,
    _createClass as createClass,
    _defineProperty as defineProperty,
    _extends as extends,
    _getPrototypeOf as getPrototypeOf,
    _inherits as inherits,
    _objectSpread2 as objectSpread2,
    _objectWithoutProperties as objectWithoutProperties,
    _possibleConstructorReturn as possibleConstructorReturn,
    _setPrototypeOf as setPrototypeOf,
    _slicedToArray as slicedToArray,
    _typeof as typeof
};
