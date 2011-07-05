/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @namespace The global gadgets namespace
 * @type {Object}
 */
var gadgets = gadgets || {};

/**
 * @namespace The global shindig namespace, used for shindig specific extensions and data
 * @type {Object}
 */
var shindig = shindig || {};

/**
 * @namespace The global osapi namespace, used for opensocial API specific extensions
 * @type {Object}
 */
var osapi = osapi || {};
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview Provides unified configuration for all features.
 *
 *
 * <p>This is a custom shindig library that has not yet been submitted for
 * standardization. It is designed to make developing of features for the
 * opensocial / gadgets platforms easier and is intended as a supplemental
 * tool to Shindig's standardized feature loading mechanism.
 *
 * <p>Usage:
 * First, you must register a component that needs configuration:
 * <pre>
 *   var config = {
 *     name : gadgets.config.NonEmptyStringValidator,
 *     url : new gadgets.config.RegExValidator(/.+%mySpecialValue%.+/)
 *   };
 *   gadgets.config.register("my-feature", config, myCallback);
 * </pre>
 *
 * <p>This will register a component named "my-feature" that expects input config
 * containing a "name" field with a value that is a non-empty string, and a
 * "url" field with a value that matches the given regular expression.
 *
 * <p>When gadgets.config.init is invoked by the container, it will automatically
 * validate your registered configuration and will throw an exception if
 * the provided configuration does not match what was required.
 *
 * <p>Your callback will be invoked by passing all configuration data passed to
 * gadgets.config.init, which allows you to optionally inspect configuration
 * from other features, if present.
 *
 * <p>Note that the container may optionally bypass configuration validation for
 * performance reasons. This does not mean that you should duplicate validation
 * code, it simply means that validation will likely only be performed in debug
 * builds, and you should assume that production builds always have valid
 * configuration.
 */

gadgets.config = function() {
  var components = {};
  var configuration;

  return {
    'register':
        /**
     * Registers a configurable component and its configuration parameters.
     * Multiple callbacks may be registered for a single component if needed.
     *
     * @param {string} component The name of the component to register. Should
     *     be the same as the fully qualified name of the <Require> feature or
     *     the name of a fully qualified javascript object reference
     *     (e.g. "gadgets.io").
     * @param {Object=} opt_validators Mapping of option name to validation
     *     functions that take the form function(data) {return isValid(data);}.
     * @param {function(Object)=} opt_callback A function to be invoked when a
     *     configuration is registered. If passed, this function will be invoked
     *     immediately after a call to init has been made. Do not assume that
     *     dependent libraries have been configured until after init is
     *     complete. If you rely on this, it is better to defer calling
     *     dependent libraries until you can be sure that configuration is
     *     complete. Takes the form function(config), where config will be
     *     all registered config data for all components. This allows your
     *     component to read configuration from other components.
     * @member gadgets.config
     * @name register
     * @function
     */
        function(component, opt_validators, opt_callback) {
          var registered = components[component];
          if (!registered) {
            registered = [];
            components[component] = registered;
          }

          registered.push({
            validators: opt_validators || {},
            callback: opt_callback
          });
        },

    'get':
        /**
     * Retrieves configuration data on demand.
     *
     * @param {string=} opt_component The component to fetch. If not provided
     *     all configuration will be returned.
     * @return {Object} The requested configuration, or an empty object if no
     *     configuration has been registered for that component.
     * @member gadgets.config
     * @name get
     * @function
     */
        function(opt_component) {
          if (opt_component) {
            return configuration[opt_component] || {};
          }
          return configuration;
        },

    /**
     * Initializes the configuration.
     *
     * @param {Object} config The full set of configuration data.
     * @param {boolean=} opt_noValidation True if you want to skip validation.
     * @throws {Error} If there is a configuration error.
     * @member gadgets.config
     * @name init
     * @function
     */
    'init': function(config, opt_noValidation) {
      configuration = config;
      for (var name in components) {
        if (components.hasOwnProperty(name)) {
          var componentList = components[name],
              conf = config[name];

          for (var i = 0, j = componentList.length; i < j; ++i) {
            var component = componentList[i];
            if (conf && !opt_noValidation) {
              var validators = component.validators;
              for (var v in validators) {
                if (validators.hasOwnProperty(v)) {
                  if (!validators[v](conf[v])) {
                    throw new Error('Invalid config value "' + conf[v] +
                        '" for parameter "' + v + '" in component "' +
                        name + '"');
                  }
                }
              }
            }

            if (component.callback) {
              component.callback(config);
            }
          }
        }
      }
    },

    // Standard validators go here.

    /**
     * Ensures that data is one of a fixed set of items.
     * Also supports argument sytax: EnumValidator("Dog", "Cat", "Fish");
     *
     * @param {Array.<string>} list The list of valid values.
     *
     * @member gadgets.config
     * @name  EnumValidator
     * @function
     */
    'EnumValidator': function(list) {
      var listItems = [];
      if (arguments.length > 1) {
        for (var i = 0, arg; (arg = arguments[i]); ++i) {
          listItems.push(arg);
        }
      } else {
        listItems = list;
      }
      return function(data) {
        for (var i = 0, test; (test = listItems[i]); ++i) {
          if (data === listItems[i]) {
            return true;
          }
        }
        return false;
      };
    },

    /**
     * Tests the value against a regular expression.
     * @member gadgets.config
     * @name RegexValidator
     * @function
     */
    'RegExValidator': function(re) {
      return function(data) {
        return re.test(data);
      };
    },

    /**
     * Validates that a value was provided.
     * @param {*} data
     * @member gadgets.config
     * @name ExistsValidator
     * @function
     */
    'ExistsValidator': function(data) {
      return typeof data !== 'undefined';
    },

    /**
     * Validates that a value is a non-empty string.
     * @param {*} data
     * @member gadgets.config
     * @name NonEmptyStringValidator
     * @function
     */
    'NonEmptyStringValidator': function(data) {
      return typeof data === 'string' && data.length > 0;
    },

    /**
     * Validates that the value is a boolean.
     * @param {*} data
     * @member gadgets.config
     * @name BooleanValidator
     * @function
     */
    'BooleanValidator': function(data) {
      return typeof data === 'boolean';
    },

    /**
     * Similar to the ECMAScript 4 virtual typing system, ensures that
     * whatever object was passed in is "like" the existing object.
     * Doesn't actually do type validation though, but instead relies
     * on other validators.
     *
     * This can be used recursively as well to validate sub-objects.
     *
     * @example
     *
     *  var validator = new gadgets.config.LikeValidator(
     *    "booleanField" : gadgets.config.BooleanValidator,
     *    "regexField" : new gadgets.config.RegExValidator(/foo.+/);
     *  );
     *
     *
     * @param {Object} test The object to test against.
     * @member gadgets.config
     * @name BooleanValidator
     * @function
     */
    'LikeValidator' : function(test) {
      return function(data) {
        for (var member in test) {
          if (test.hasOwnProperty(member)) {
            var t = test[member];
            if (!t(data[member])) {
              return false;
            }
          }
        }
        return true;
      };
    }
  };
}();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview Provides gadget/container configuration flags.
 */
/** @type {boolean} */
gadgets.config.isGadget = true;
/** @type {boolean} */
gadgets.config.isContainer = false;
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview General purpose utilities that gadgets can use.
 */

/**
 * @static
 * @class Provides general-purpose utility functions.
 * @name gadgets.util
 */

gadgets['util'] = function() {
  /**
   * Parses URL parameters into an object.
   * @param {string} url - the url parameters to parse.
   * @return {Array.<string>} The parameters as an array.
   */
  function parseUrlParams(url) {
    // Get settings from url, 'hash' takes precedence over 'search' component
    // don't use document.location.hash due to browser differences.
    var query;
    var queryIdx = url.indexOf('?');
    var hashIdx = url.indexOf('#');
    if (hashIdx === -1) {
      query = url.substr(queryIdx + 1);
    } else {
      // essentially replaces "#" with "&"
      query = [url.substr(queryIdx + 1, hashIdx - queryIdx - 1), '&',
               url.substr(hashIdx + 1)].join('');
    }
    return query.split('&');
  }

  var parameters = null;
  var features = {};
  var services = {};
  var onLoadHandlers = [];

  /**
   * @enum {boolean}
   * @const
   * @private
   * Maps code points to the value to replace them with.
   * If the value is "false", the character is removed entirely, otherwise
   * it will be replaced with an html entity.
   */

  var escapeCodePoints = {
    // nul; most browsers truncate because they use c strings under the covers.
    0 : false,
    // new line
    10 : true,
    // carriage return
    13 : true,
    // double quote
    34 : true,
    // single quote
    39 : true,
    // less than
    60 : true,
    // greater than
    62 : true,
    // Backslash
    92 : true,
    // line separator
    8232 : true,
    // paragraph separator
    8233 : true
  };

  /**
   * Regular expression callback that returns strings from unicode code points.
   *
   * @param {Array} match Ignored.
   * @param {number} value The codepoint value to convert.
   * @return {string} The character corresponding to value.
   */
  function unescapeEntity(match, value) {
    return String.fromCharCode(value);
  }

  /**
   * Initializes feature parameters.
   */
  function init(config) {
    features = config['core.util'] || {};
  }
  if (gadgets.config) {
    gadgets.config.register('core.util', null, init);
  }

  return /** @scope gadgets.util */ {

    /**
     * Gets the URL parameters.
     *
     * @param {string=} opt_url Optional URL whose parameters to parse.
     *                         Defaults to window's current URL.
     * @return {Object} Parameters passed into the query string.
     * @member gadgets.util
     * @private Implementation detail.
     */
    'getUrlParameters' : function(opt_url) {
      var no_opt_url = typeof opt_url === 'undefined';
      if (parameters !== null && no_opt_url) {
        // "parameters" is a cache of current window params only.
        return parameters;
      }
      var parsed = {};
      var pairs = parseUrlParams(opt_url || document.location.href);
      var unesc = window.decodeURIComponent ? decodeURIComponent : unescape;
      for (var i = 0, j = pairs.length; i < j; ++i) {
        var pos = pairs[i].indexOf('=');
        if (pos === -1) {
          continue;
        }
        var argName = pairs[i].substring(0, pos);
        var value = pairs[i].substring(pos + 1);
        // difference to IG_Prefs, is that args doesn't replace spaces in
        // argname. Unclear on if it should do:
        // argname = argname.replace(/\+/g, " ");
        value = value.replace(/\+/g, ' ');
        parsed[argName] = unesc(value);
      }
      if (no_opt_url) {
        // Cache current-window params in parameters var.
        parameters = parsed;
      }
      return parsed;
    },

    /**
     * Creates a closure that is suitable for passing as a callback.
     * Any number of arguments
     * may be passed to the callback;
     * they will be received in the order they are passed in.
     *
     * @param {Object} scope The execution scope; may be null if there is no
     *     need to associate a specific instance of an object with this
     *     callback.
     * @param {function(Object,Object)} callback The callback to invoke when this is run;
     *     any arguments passed in will be passed after your initial arguments.
     * @param {Object} var_args Initial arguments to be passed to the callback.
     *
     * @member gadgets.util
     * @private Implementation detail.
     */
    'makeClosure' : function(scope, callback, var_args) {
      // arguments isn't a real array, so we copy it into one.
      var baseArgs = [];
      for (var i = 2, j = arguments.length; i < j; ++i) {
        baseArgs.push(arguments[i]);
      }
      return function() {
        // append new arguments.
        var tmpArgs = baseArgs.slice();
        for (var i = 0, j = arguments.length; i < j; ++i) {
          tmpArgs.push(arguments[i]);
        }
        return callback.apply(scope, tmpArgs);
      };
    },

    /**
     * Utility function for generating an "enum" from an array.
     *
     * @param {Array.<string>} values The values to generate.
     * @return {Object.<string,string>} An object with member fields to handle
     *   the enum.
     *
     * @private Implementation detail.
     */
    'makeEnum' : function(values) {
      var i, v, obj = {};
      for (i = 0; (v = values[i]); ++i) {
        obj[v] = v;
      }
      return obj;
    },

    /**
     * Gets the feature parameters.
     *
     * @param {string} feature The feature to get parameters for.
     * @return {Object} The parameters for the given feature, or null.
     *
     * @member gadgets.util
     */
    'getFeatureParameters' : function(feature) {
      return typeof features[feature] === 'undefined' ? null : features[feature];
    },

    /**
     * Returns whether the current feature is supported.
     *
     * @param {string} feature The feature to test for.
     * @return {boolean} True if the feature is supported.
     *
     * @member gadgets.util
     */
    'hasFeature' : function(feature) {
      return typeof features[feature] !== 'undefined';
    },

    /**
     * Returns the list of services supported by the server
     * serving this gadget.
     *
     * @return {Object} List of Services that enumerate their methods.
     *
     * @member gadgets.util
     */
    'getServices' : function() {
      return services;
    },

    /**
     * Registers an onload handler.
     * @param {function()} callback The handler to run.
     *
     * @member gadgets.util
     */
    'registerOnLoadHandler' : function(callback) {
      onLoadHandlers.push(callback);
    },

    /**
     * Runs all functions registered via registerOnLoadHandler.
     * @private Only to be used by the container, not gadgets.
     */
    'runOnLoadHandlers' : function() {
      for (var i = 0, j = onLoadHandlers.length; i < j; ++i) {
        onLoadHandlers[i]();
      }
    },

    /**
     * Escapes the input using html entities to make it safer.
     *
     * If the input is a string, uses gadgets.util.escapeString.
     * If it is an array, calls escape on each of the array elements
     * if it is an object, will only escape all the mapped keys and values if
     * the opt_escapeObjects flag is set. This operation involves creating an
     * entirely new object so only set the flag when the input is a simple
     * string to string map.
     * Otherwise, does not attempt to modify the input.
     *
     * @param {Object} input The object to escape.
     * @param {boolean=} opt_escapeObjects Whether to escape objects.
     * @return {Object} The escaped object.
     * @private Only to be used by the container, not gadgets.
     */
    'escape' : function(input, opt_escapeObjects) {
      if (!input) {
        return input;
      } else if (typeof input === 'string') {
        return gadgets.util.escapeString(input);
      } else if (typeof input === 'array') {
        for (var i = 0, j = input.length; i < j; ++i) {
          input[i] = gadgets.util.escape(input[i]);
        }
      } else if (typeof input === 'object' && opt_escapeObjects) {
        var newObject = {};
        for (var field in input) {
          if (input.hasOwnProperty(field)) {
            newObject[gadgets.util.escapeString(field)] = gadgets.util.escape(input[field], true);
          }
        }
        return newObject;
      }
      return input;
    },

    /**
     * Escapes the input using html entities to make it safer.
     *
     * Currently not in the spec -- future proposals may change
     * how this is handled.
     *
     * TODO: Parsing the string would probably be more accurate and faster than
     * a bunch of regular expressions.
     *
     * @param {string} str The string to escape.
     * @return {string} The escaped string.
     */
    'escapeString' : function(str) {
      if (!str) return str;
      var out = [], ch, shouldEscape;
      for (var i = 0, j = str.length; i < j; ++i) {
        ch = str.charCodeAt(i);
        shouldEscape = escapeCodePoints[ch];
        if (shouldEscape === true) {
          out.push('&#', ch, ';');
        } else if (shouldEscape !== false) {
          // undefined or null are OK.
          out.push(str.charAt(i));
        }
      }
      return out.join('');
    },

    /**
     * Reverses escapeString
     *
     * @param {string} str The string to unescape.
     * @return {string}
     */
    'unescapeString' : function(str) {
      if (!str) return str;
      return str.replace(/&#([0-9]+);/g, unescapeEntity);
    },


    /**
     * Attach an event listener to given DOM element (Not a gadget standard)
     *
     * @param {Object} elem  DOM element on which to attach event.
     * @param {string} eventName  Event type to listen for.
     * @param {function()} callback  Invoked when specified event occurs.
     * @param {boolean} useCapture  If true, initiates capture.
     */
    'attachBrowserEvent': function(elem, eventName, callback, useCapture) {
      if (typeof elem.addEventListener != 'undefined') {
        elem.addEventListener(eventName, callback, useCapture);
      } else if (typeof elem.attachEvent != 'undefined') {
        elem.attachEvent('on' + eventName, callback);
      } else {
        gadgets.warn('cannot attachBrowserEvent: ' + eventName);
      }
    },

    /**
     * Remove event listener. (Shindig internal implementation only)
     *
     * @param {Object} elem  DOM element from which to remove event.
     * @param {string} eventName  Event type to remove.
     * @param {function()} callback  Listener to remove.
     * @param {boolean} useCapture  Specifies whether listener being removed was added with
     *                              capture enabled.
     */
    'removeBrowserEvent': function(elem, eventName, callback, useCapture) {
      if (elem.removeEventListener) {
        elem.removeEventListener(eventName, callback, useCapture);
      } else if (elem.detachEvent) {
        elem.detachEvent('on' + eventName, callback);
      } else {
        gadgets.warn('cannot removeBrowserEvent: ' + eventName);
      }
    }
  };
}();
// Initialize url parameters so that hash data is pulled in before it can be
// altered by a click.
gadgets['util'].getUrlParameters();

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistFuncs([
    [gadgets.util, 'escapeString'],
    [gadgets.util, 'getFeatureParameters'],
    [gadgets.util, 'getUrlParameters'],
    [gadgets.util, 'hasFeature'],
    [gadgets.util, 'registerOnLoadHandler'],
    [gadgets.util, 'unescapeString']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*global gadgets */

/**
 * @fileoverview
 *
 * Manages the gadget security token AKA the gadget auth token AKA the
 * social token.  Also provides an API for the container server to
 * efficiently pass authenticated data to the gadget at render time.
 *
 * The shindig.auth package is not part of the opensocial or gadgets spec,
 * and gadget authors should never use these functions or the security token
 * directly.  These APIs are an implementation detail and are for shindig
 * internal use only.
 *
 * Passing authenticated data into the gadget at render time:
 *
 * The gadget auth token is the only way for the container to allow the
 * gadget access to authenticated data.  gadgets.io.makeRequest for SIGNED
 * or OAUTH requests relies on the authentication token.  Access to social data
 * also relies on the authentication token.
 *
 * The authentication token is normally passed into the gadget on the URL
 * fragment (after the #), and so is not visible to the gadget rendering
 * server.  This keeps the token from being leaked in referer headers, but at
 * the same time limits the amount of authenticated data the gadget can view
 * quickly: fetching authenticated data requires an extra round trip.
 *
 * If the authentication token is passed to the gadget as a query parameter,
 * the gadget rendering server gets an opportunity to view the token during
 * the rendering process.  This allows the rendering server to quickly inject
 * authenticated data into the gadget, at the price of potentially leaking
 * the authentication token in referer headers.  That risk can be mitigated
 * by using a short-lived authentication token on the query string, which
 * the gadget server can swap for a longer lived token at render time.
 *
 * If the rendering server injects authenticated data into the gadget in the
 * form of a JSON string, the resulting javascript object can be accessed via
 * shindig.auth.getTrustedData.
 *
 * To access the security token:
 *   var st = shindig.auth.getSecurityToken();
 *
 * To update the security token with new data from the gadget server:
 *   shindig.auth.updateSecurityToken(newToken);
 *
 * To quickly access a javascript object that has been authenticated by the
 * container and the rendering server:
 *   var trusted = shindig.auth.getTrustedData();
 *   doSomething(trusted.foo.bar);
 */

/**
 * Class used to mange the gadget auth token.  Singleton initialized from
 * auth-init.js.
 *
 * @constructor
 */
shindig.Auth = function() {
  /**
   * The authentication token.
   */
  var authToken = null;

  /**
   * Trusted object from container.
   */
  var trusted = null;

  /**
   * Copy URL parameters into the auth token
   *
   * The initial auth token can look like this:
   *    t=abcd&url=$&foo=
   *
   * If any of the values in the token are '$', a matching parameter
   * from the URL will be inserted, for example:
   *    t=abcd&url=http%3A%2F%2Fsome.gadget.com&foo=
   *
   * Why do this at all?  The only currently known use case for this is
   * efficiently including the gadget URL in the auth token.  If you embed
   * the entire URL in the security token, you effectively double the size
   * of the URL passed on the gadget rendering request:
   *   /gadgets/ifr?url=<gadget-url>#st=<encrypted-gadget-url>
   *
   * This can push the gadget render URL beyond the max length supported
   * by browsers, and then things break.  To work around this, the
   * security token can include only a (much shorter) hash of the gadget-url:
   *  /gadgets/ifr?url=<gadget-url>#st=<xyz>
   *
   * However, we still want the proxy that handles gadgets.io.makeRequest
   * to be able to look up the gadget URL efficiently, without requring
   * a database hit.  To do that, we modify the auth token here to fill
   * in any blank values.  The auth token then becomes:
   *    t=<xyz>&url=<gadget-url>
   *
   * We send the expanded auth token in the body of post requests, so we
   * don't run into problems with length there.  (But people who put
   * several hundred characters in their gadget URLs are still lame.)
   * @param {Object} urlParams
   */
  function addParamsToToken(urlParams) {
    var args = authToken.split('&');
    for (var i = 0; i < args.length; i++) {
      var nameAndValue = args[i].split('=');
      if (nameAndValue.length === 2) {
        var name = nameAndValue[0];
        var value = nameAndValue[1];
        if (value === '$') {
          value = encodeURIComponent(urlParams[name]);
          args[i] = name + '=' + value;
        }
      }
    }
    authToken = args.join('&');
  }

  function init(configuration) {
    var urlParams = gadgets.util.getUrlParameters();
    var config = configuration['shindig.auth'] || {};

    // Auth token - might be injected into the gadget directly, or might
    // be on the URL (hopefully on the fragment).
    if (config.authToken) {
      authToken = config.authToken;
    } else if (urlParams.st) {
      authToken = urlParams.st;
    }
    if (authToken !== null) {
      addParamsToToken(urlParams);
    }

    // Trusted JSON.  We use eval directly because this was injected by the
    // container server and json parsing is slow in IE.
    if (config.trustedJson) {
      trusted = eval('(' + config.trustedJson + ')');
    }
  }

  gadgets.config.register('shindig.auth', null, init);

  return /** @scope shindig.auth */ {

    /**
     * Gets the auth token.
     *
     * @return {string} the gadget authentication token.
     *
     * @member shindig.auth
     */
    getSecurityToken: function() {
      return authToken;
    },

    /**
     * Updates the security token with new data from the gadget server.
     *
     * @param {string} newToken the new auth token data.
     *
     * @member shindig.auth
     */
    updateSecurityToken: function(newToken) {
      authToken = newToken;
    },

    /**
     * Quickly retrieves data that is known to have been injected by
     * a trusted container server.
     * @return {Object}
     */
    getTrustedData: function() {
      return trusted;
    }
  };
};
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview
 *
 * Bootstraps auth.js.
 */

shindig.auth = new shindig.Auth();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview
 * The global object gadgets.json contains two methods.
 *
 * gadgets.json.stringify(value) takes a JavaScript value and produces a JSON
 * text. The value must not be cyclical.
 *
 * gadgets.json.parse(text) takes a JSON text and produces a JavaScript value.
 * It will return false if there is an error.
 */

/**
 * @static
 * @class Provides operations for translating objects to and from JSON.
 * @name gadgets.json
 */

/**
 * Port of the public domain JSON library by Douglas Crockford.
 * See: http://www.json.org/json2.js
 */
if (window.JSON && window.JSON.parse && window.JSON.stringify) {
  // HTML5 implementation, or already defined.
  // Not a direct alias as the opensocial specification disagrees with the HTML5 JSON spec.
  // JSON says to throw on parse errors and to support filtering functions. OS does not.
  gadgets['json'] = (function() {
    var endsWith___ = /___$/;
    return {
      /* documented below */
      'parse': function(str) {
        try {
          return window.JSON.parse(str);
        } catch (e) {
          return false;
        }
      },
      /* documented below */
      'stringify': function(obj) {
        try {
          return window.JSON.stringify(obj, function(k,v) {
            return !endsWith___.test(k) ? v : null;
          });
        } catch (e) {
          return null;
        }
      }
    };
  })();
} else {
  /**
 * Port of the public domain JSON library by Douglas Crockford.
 * See: http://www.json.org/json2.js
 */
  gadgets['json'] = function() {

    /**
     * Formats integers to 2 digits.
     * @param {number} n
     * @private
     */
    function f(n) {
      return n < 10 ? '0' + n : n;
    }

    Date.prototype.toJSON = function() {
      return [this.getUTCFullYear(), '-',
        f(this.getUTCMonth() + 1), '-',
        f(this.getUTCDate()), 'T',
        f(this.getUTCHours()), ':',
        f(this.getUTCMinutes()), ':',
        f(this.getUTCSeconds()), 'Z'].join('');
    };

    // table of character substitutions
    /**
     * @const
     * @enum {string}
     */
    var m = {
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"' : '\\"',
      '\\': '\\\\'
    };

    /**
     * Converts a json object into a string.
     * @param {*} value
     * @return {string}
     * @member gadgets.json
     */
    function stringify(value) {
      var a,          // The array holding the partial texts.
          i,          // The loop counter.
          k,          // The member key.
          l,          // Length.
          r = /["\\\x00-\x1f\x7f-\x9f]/g,
          v;          // The member value.

      switch (typeof value) {
        case 'string':
          // If the string contains no control characters, no quote characters, and no
          // backslash characters, then we can safely slap some quotes around it.
          // Otherwise we must also replace the offending characters with safe ones.
          return r.test(value) ?
              '"' + value.replace(r, function(a) {
                var c = m[a];
                if (c) {
                  return c;
                }
                c = a.charCodeAt();
                return '\\u00' + Math.floor(c / 16).toString(16) +
                   (c % 16).toString(16);
              }) + '"' : '"' + value + '"';
        case 'number':
          // JSON numbers must be finite. Encode non-finite numbers as null.
          return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
          return String(value);
        case 'object':
          // Due to a specification blunder in ECMAScript,
          // typeof null is 'object', so watch out for that case.
          if (!value) {
            return 'null';
          }
          // toJSON check removed; re-implement when it doesn't break other libs.
          a = [];
          if (typeof value.length === 'number' &&
              !value.propertyIsEnumerable('length')) {
            // The object is an array. Stringify every element. Use null as a
            // placeholder for non-JSON values.
            l = value.length;
            for (i = 0; i < l; i += 1) {
              a.push(stringify(value[i]) || 'null');
            }
            // Join all of the elements together and wrap them in brackets.
            return '[' + a.join(',') + ']';
          }
          // Otherwise, iterate through all of the keys in the object.
          for (k in value) {
            if (k.match('___$'))
              continue;
            if (value.hasOwnProperty(k)) {
              if (typeof k === 'string') {
                v = stringify(value[k]);
                if (v) {
                  a.push(stringify(k) + ':' + v);
                }
              }
            }
          }
          // Join all of the member texts together and wrap them in braces.
          return '{' + a.join(',') + '}';
      }
      return '';
    }

    return {
      'stringify': stringify,
      'parse': function(text) {
        // Parsing happens in three stages. In the first stage, we run the text against
        // regular expressions that look for non-JSON patterns. We are especially
        // concerned with '()' and 'new' because they can cause invocation, and '='
        // because it can cause mutation. But just to be safe, we want to reject all
        // unexpected forms.

        // We split the first stage into 4 regexp operations in order to work around
        // crippling inefficiencies in IE's and Safari's regexp engines. First we
        // replace all backslash pairs with '@' (a non-JSON character). Second, we
        // replace all simple value tokens with ']' characters. Third, we delete all
        // open brackets that follow a colon or comma or that begin the text. Finally,
        // we look to see that the remaining characters are only whitespace or ']' or
        // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

        if (/^[\],:{}\s]*$/.test(text.replace(/\\["\\\/b-u]/g, '@').
            replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
            replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
          return eval('(' + text + ')');
        }
        // If the text is not JSON parseable, then return false.

        return false;
      }
    };
  }();
}
/**
 * Flatten an object to a stringified values. Useful for dealing with
 * json->querystring transformations. Note: not in official specification yet
 *
 * @param {Object} obj
 * @return {Object} object with only string values.
 */

gadgets['json'].flatten = function(obj) {
  var flat = {};

  if (obj === null || obj === undefined) return flat;

  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      var value = obj[k];
      if (null === value || undefined === value) {
        continue;
      }
      flat[k] = (typeof value === 'string') ? value : gadgets.json.stringify(value);
    }
  }
  return flat;
};
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  ___.tamesTo(gadgets.json.stringify, safeJSON.stringify);
  ___.tamesTo(gadgets.json.parse, safeJSON.parse);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*global ActiveXObject, DOMParser */
/*global shindig */

/**
 * @fileoverview Provides remote content retrieval facilities.
 *     Available to every gadget.
 */

/**
 * @static
 * @class Provides remote content retrieval functions.
 * @name gadgets.io
 */

gadgets.io = function() {
  /**
   * Holds configuration-related data such as proxy urls.
   */
  var config = {};

  /**
   * Holds state for OAuth.
   */
  var oauthState;

  /**
   * Internal facility to create an xhr request.
   */
  function makeXhr() {
    var x;
    if (typeof shindig != 'undefined' &&
        shindig.xhrwrapper &&
        shindig.xhrwrapper.createXHR) {
      return shindig.xhrwrapper.createXHR();
    } else if (typeof ActiveXObject != 'undefined') {
      x = new ActiveXObject('Msxml2.XMLHTTP');
      if (!x) {
        x = new ActiveXObject('Microsoft.XMLHTTP');
      }
      return x;
    }
    // The second construct is for the benefit of jsunit...
    else if (typeof XMLHttpRequest != 'undefined' || window.XMLHttpRequest) {
      return new window.XMLHttpRequest();
    }
    else throw ('no xhr available');
  }

  /**
   * Checks the xobj for errors, may call the callback with an error response
   * if the error is fatal.
   *
   * @param {Object} xobj The XHR object to check.
   * @param {function(Object)} callback The callback to call if the error is fatal.
   * @return {boolean} true if the xobj is not ready to be processed.
   */
  function hadError(xobj, callback) {
    if (xobj.readyState !== 4) {
      return true;
    }
    try {
      if (xobj.status !== 200) {
        var error = ('' + xobj.status);
        if (xobj.responseText) {
          error = error + ' ' + xobj.responseText;
        }
        callback({
          errors: [error],
          rc: xobj.status,
          text: xobj.responseText
        });
        return true;
      }
    } catch (e) {
      callback({
        errors: [e.number + ' Error not specified'],
        rc: e.number,
        text: e.description
      });
      return true;
    }
    return false;
  }

  /**
   * Handles non-proxied XHR callback processing.
   *
   * @param {string} url
   * @param {function(Object)} callback
   * @param {Object} params
   * @param {Object} xobj
   */
  function processNonProxiedResponse(url, callback, params, xobj) {
    if (hadError(xobj, callback)) {
      return;
    }
    var data = {
      body: xobj.responseText
    };
    callback(transformResponseData(params, data));
  }

  var UNPARSEABLE_CRUFT = "throw 1; < don't be evil' >";

  /**
   * Handles XHR callback processing.
   *
   * @param {string} url
   * @param {function(Object)} callback
   * @param {Object} params
   * @param {Object} xobj
   */
  function processResponse(url, callback, params, xobj) {
    if (hadError(xobj, callback)) {
      return;
    }
    var txt = xobj.responseText;

    // remove unparseable cruft used to prevent cross-site script inclusion
    var offset = txt.indexOf(UNPARSEABLE_CRUFT) + UNPARSEABLE_CRUFT.length;

    // If no cruft then just return without a callback - avoid JS errors
    // TODO craft an error response?
    if (offset < UNPARSEABLE_CRUFT.length) return;
    txt = txt.substr(offset);

    // We are using eval directly here  because the outer response comes from a
    // trusted source, and json parsing is slow in IE.
    var data = eval('(' + txt + ')');
    data = data[url];
    // Save off any transient OAuth state the server wants back later.
    if (data.oauthState) {
      oauthState = data.oauthState;
    }
    // Update the security token if the server sent us a new one
    if (data.st) {
      shindig.auth.updateSecurityToken(data.st);
    }
    callback(transformResponseData(params, data));
  }

  /**
   * @param {Object} params
   * @param {Object} data
   * @return {Object}
   */

  function transformResponseData(params, data) {
    // Sometimes rc is not present, generally when used
    // by jsonrpccontainer, so assume 200 in its absence.
    var resp = {
      text: data.body,
      rc: data.rc || 200,
      headers: data.headers,
      oauthApprovalUrl: data.oauthApprovalUrl,
      oauthError: data.oauthError,
      oauthErrorText: data.oauthErrorText,
      errors: []
    };

    if (resp.rc < 200 || resp.rc >= 400) {
      resp.errors = [resp.rc + ' Error'];
    } else if (resp.text) {
      if (resp.rc >= 300 && resp.rc < 400) {
        // Redirect pages will usually contain arbitrary
        // HTML which will fail during parsing, inadvertently
        // causing a 500 response. Thus we treat as text.
        params.CONTENT_TYPE = 'TEXT';
      }
      switch (params.CONTENT_TYPE) {
        case 'JSON':
        case 'FEED':
          resp.data = gadgets.json.parse(resp.text);
          if (!resp.data) {
            resp.errors.push('500 Failed to parse JSON');
            resp.rc = 500;
            resp.data = null;
          }
          break;
        case 'DOM':
          var dom;
          if (typeof ActiveXObject != 'undefined') {
            dom = new ActiveXObject('Microsoft.XMLDOM');
            dom.async = false;
            dom.validateOnParse = false;
            dom.resolveExternals = false;
            if (!dom.loadXML(resp.text)) {
              resp.errors.push('500 Failed to parse XML');
              resp.rc = 500;
            } else {
              resp.data = dom;
            }
          } else {
            var parser = new DOMParser();
            dom = parser.parseFromString(resp.text, 'text/xml');
            if ('parsererror' === dom.documentElement.nodeName) {
              resp.errors.push('500 Failed to parse XML');
              resp.rc = 500;
            } else {
              resp.data = dom;
            }
          }
          break;
        default:
          resp.data = resp.text;
          break;
      }
    }
    return resp;
  }

  /**
   * Sends an XHR post or get request
   *
   * @param {string} realUrl The url to fetch data from that was requested by the gadget.
   * @param {string} proxyUrl The url to proxy through.
   * @param {function()} callback The function to call once the data is fetched.
   * @param {Object} paramData The params to use when processing the response.
   * @param {string} method
   * @param {function(string,function(Object),Object,Object)}
   *     processResponseFunction The function that should process the
   *     response from the sever before calling the callback.
   * @param {string=} opt_contentType - Optional content type defaults to
   *     'application/x-www-form-urlencoded'.
   */
  function makeXhrRequest(realUrl, proxyUrl, callback, paramData, method,
      params, processResponseFunction, opt_contentType) {
    var xhr = makeXhr();

    if (proxyUrl.indexOf('//') == 0) {
      proxyUrl = document.location.protocol + proxyUrl;
    }

    xhr.open(method, proxyUrl, true);
    if (callback) {
      xhr.onreadystatechange = gadgets.util.makeClosure(
          null, processResponseFunction, realUrl, callback, params, xhr);
    }
    if (paramData !== null) {
      xhr.setRequestHeader('Content-Type', opt_contentType || 'application/x-www-form-urlencoded');
      xhr.send(paramData);
    } else {
      xhr.send(null);
    }
  }



  /**
   * Satisfy a request with data that is prefetched as per the gadget Preload
   * directive. The preloader will only satisfy a request for a specific piece
   * of content once.
   *
   * @param {Object} postData The definition of the request to be executed by the proxy.
   * @param {Object} params The params to use when processing the response.
   * @param {function(Object)} callback The function to call once the data is fetched.
   * @return {boolean} true if the request can be satisfied by the preloaded
   *         content false otherwise.
   */
  function respondWithPreload(postData, params, callback) {
    if (gadgets.io.preloaded_ && postData.httpMethod === 'GET') {
      for (var i = 0; i < gadgets.io.preloaded_.length; i++) {
        var preload = gadgets.io.preloaded_[i];
        if (preload && (preload.id === postData.url)) {
          // Only satisfy once
          delete gadgets.io.preloaded_[i];

          if (preload.rc !== 200) {
            callback({rc: preload.rc, errors: [preload.rc + ' Error']});
          } else {
            if (preload.oauthState) {
              oauthState = preload.oauthState;
            }
            var resp = {
              body: preload.body,
              rc: preload.rc,
              headers: preload.headers,
              oauthApprovalUrl: preload.oauthApprovalUrl,
              oauthError: preload.oauthError,
              oauthErrorText: preload.oauthErrorText,
              errors: []
            };
            callback(transformResponseData(params, resp));
          }
          return true;
        }
      }
    }
    return false;
  }

  /**
   * @param {Object} configuration Configuration settings.
   * @private
   */
  function init(configuration) {
    config = configuration['core.io'] || {};
  }

  var requiredConfig = {
    proxyUrl: new gadgets.config.RegExValidator(/.*%(raw)?url%.*/),
    jsonProxyUrl: gadgets.config.NonEmptyStringValidator
  };
  gadgets.config.register('core.io', requiredConfig, init);

  return /** @scope gadgets.io */ {
    /**
     * Fetches content from the provided URL and feeds that content into the
     * callback function.
     *
     * Example:
     * <pre>
     * gadgets.io.makeRequest(url, fn,
     *    {contentType: gadgets.io.ContentType.FEED});
     * </pre>
     *
     * @param {string} url The URL where the content is located.
     * @param {function(Object)} callback The function to call with the data from
     *     the URL once it is fetched.
     * @param {Object.<gadgets.io.RequestParameters, Object>=} opt_params
     *     Additional
     *     <a href="gadgets.io.RequestParameters.html">parameters</a>
     *     to pass to the request.
     *
     * @member gadgets.io
     */
    makeRequest: function(url, callback, opt_params) {
      // TODO: This method also needs to respect all members of
      // gadgets.io.RequestParameters, and validate them.

      var params = opt_params || {};

      var httpMethod = params.METHOD || 'GET';
      var refreshInterval = params.REFRESH_INTERVAL;

      // Check if authorization is requested
      var auth, st;
      if (params.AUTHORIZATION && params.AUTHORIZATION !== 'NONE') {
        auth = params.AUTHORIZATION.toLowerCase();
        st = shindig.auth.getSecurityToken();
      } else {
        // Unauthenticated GET requests are cacheable
        if (httpMethod === 'GET' && refreshInterval === undefined) {
          refreshInterval = 3600;
        }
      }

      // Include owner information?
      var signOwner = true;
      if (typeof params.OWNER_SIGNED !== 'undefined') {
        signOwner = params.OWNER_SIGNED;
      }

      // Include viewer information?
      var signViewer = true;
      if (typeof params.VIEWER_SIGNED !== 'undefined') {
        signViewer = params.VIEWER_SIGNED;
      }

      var headers = params.HEADERS || {};
      if (httpMethod === 'POST' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }

      var urlParams = gadgets.util.getUrlParameters();

      var paramData = {
        url: url,
        httpMethod: httpMethod,
        headers: gadgets.io.encodeValues(headers, false),
        postData: params.POST_DATA || '',
        authz: auth || '',
        st: st || '',
        contentType: params.CONTENT_TYPE || 'TEXT',
        numEntries: params.NUM_ENTRIES || '3',
        getSummaries: !!params.GET_SUMMARIES,
        signOwner: signOwner,
        signViewer: signViewer,
        gadget: urlParams.url,
        container: urlParams.container || urlParams.synd || 'default',
        // should we bypass gadget spec cache (e.g. to read OAuth provider URLs)
        bypassSpecCache: gadgets.util.getUrlParameters().nocache || '',
        getFullHeaders: !!params.GET_FULL_HEADERS
      };

      // OAuth goodies
      if (auth === 'oauth' || auth === 'signed') {
        if (gadgets.io.oauthReceivedCallbackUrl_) {
          paramData.OAUTH_RECEIVED_CALLBACK = gadgets.io.oauthReceivedCallbackUrl_;
          gadgets.io.oauthReceivedCallbackUrl_ = null;
        }
        paramData.oauthState = oauthState || '';
        // Just copy the OAuth parameters into the req to the server
        for (var opt in params) {
          if (params.hasOwnProperty(opt)) {
            if (opt.indexOf('OAUTH_') === 0) {
              paramData[opt] = params[opt];
            }
          }
        }
      }

      var proxyUrl = config.jsonProxyUrl.replace('%host%', document.location.host);

      // FIXME -- processResponse is not used in call
      if (!respondWithPreload(paramData, params, callback, processResponse)) {
        if (httpMethod === 'GET' && refreshInterval > 0) {
          // this content should be cached
          // Add paramData to the URL
          var extraparams = '?refresh=' + refreshInterval + '&'
              + gadgets.io.encodeValues(paramData);

          makeXhrRequest(url, proxyUrl + extraparams, callback,
              null, 'GET', params, processResponse);

        } else {
          makeXhrRequest(url, proxyUrl, callback,
              gadgets.io.encodeValues(paramData), 'POST', params,
              processResponse);
        }
      }
    },

    /**
     * @private
     */
    makeNonProxiedRequest: function(relativeUrl, callback, opt_params, opt_contentType) {
      var params = opt_params || {};
      makeXhrRequest(relativeUrl, relativeUrl, callback, params.POST_DATA,
          params.METHOD, params, processNonProxiedResponse, opt_contentType);
    },

    /**
     * Used to clear out the oauthState, for testing only.
     *
     * @private
     */
    clearOAuthState: function() {
      oauthState = undefined;
    },

    /**
     * Converts an input object into a URL-encoded data string.
     * (key=value&amp;...)
     *
     * @param {Object} fields The post fields you wish to encode.
     * @param {boolean=} opt_noEscaping An optional parameter specifying whether
     *     to turn off escaping of the parameters. Defaults to false.
     * @return {string} The processed post data in www-form-urlencoded format.
     *
     * @member gadgets.io
     */
    encodeValues: function(fields, opt_noEscaping) {
      var escape = !opt_noEscaping;

      var buf = [];
      var first = false;
      for (var i in fields) {
        if (fields.hasOwnProperty(i) && !/___$/.test(i)) {
          if (!first) {
            first = true;
          } else {
            buf.push('&');
          }
          buf.push(escape ? encodeURIComponent(i) : i);
          buf.push('=');
          buf.push(escape ? encodeURIComponent(fields[i]) : fields[i]);
        }
      }
      return buf.join('');
    },

    /**
     * Gets the proxy version of the passed-in URL.
     *
     * @param {string} url The URL to get the proxy URL for.
     * @param {Object.<gadgets.io.RequestParameters, Object>=} opt_params Optional Parameter Object.
     *     The following properties are supported:
     *       .REFRESH_INTERVAL The number of seconds that this
     *           content should be cached.  Defaults to 3600.
     *
     * @return {string} The proxied version of the URL.
     * @member gadgets.io
     */
    getProxyUrl: function(url, opt_params) {
      return url;
    }
  };
}();

gadgets.io.RequestParameters = gadgets.util.makeEnum([
  'METHOD',
  'CONTENT_TYPE',
  'POST_DATA',
  'HEADERS',
  'AUTHORIZATION',
  'NUM_ENTRIES',
  'GET_SUMMARIES',
  'GET_FULL_HEADERS',
  'REFRESH_INTERVAL',
  'OAUTH_SERVICE_NAME',
  'OAUTH_USE_TOKEN',
  'OAUTH_TOKEN_NAME',
  'OAUTH_REQUEST_TOKEN',
  'OAUTH_REQUEST_TOKEN_SECRET',
  'OAUTH_RECEIVED_CALLBACK'
]);

/**
 * @const
 */
gadgets.io.MethodType = gadgets.util.makeEnum([
  'GET', 'POST', 'PUT', 'DELETE', 'HEAD'
]);

/**
 * @const
 */
gadgets.io.ContentType = gadgets.util.makeEnum([
  'TEXT', 'DOM', 'JSON', 'FEED'
]);

/**
 * @const
 */
gadgets.io.AuthorizationType = gadgets.util.makeEnum([
  'NONE', 'SIGNED', 'OAUTH'
]);
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.io.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistFuncs([
    [gadgets.io, 'encodeValues'],
    [gadgets.io, 'getProxyUrl'],
    [gadgets.io, 'makeRequest']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview
 *
 * Provides access to user prefs, module dimensions, and messages.
 *
 * <p>Clients can access their preferences by constructing an instance of
 * gadgets.Prefs and passing in their module id.  Example:
 *
 * <pre>
 *   var prefs = new gadgets.Prefs();
 *   var name = prefs.getString("name");
 *   var lang = prefs.getLang();
 * </pre>
 *
 * <p>Modules with type=url can also use this library to parse arguments passed
 * by URL, but this is not the common case:
 *
 *   &lt;script src="http://apache.org/shindig/prefs.js"&gt;&lt;/script&gt;
 *   &lt;script&gt;
 *   gadgets.Prefs.parseUrl();
 *   var prefs = new gadgets.Prefs();
 *   var name = prefs.getString("name");
 *   &lt;/script&gt;
 */

(function() {

  var instance = null;
  var prefs = {};
  var esc = gadgets.util.escapeString;
  var messages = {};
  var defaultPrefs = {};
  var language = 'en';
  var country = 'US';
  var moduleId = 0;

  /**
 * Parses all parameters from the url and stores them
 * for later use when creating a new gadgets.Prefs object.
 */
  function parseUrl() {
    var params = gadgets.util.getUrlParameters();
    for (var i in params) {
      if (params.hasOwnProperty(i)) {
        if (i.indexOf('up_') === 0 && i.length > 3) {
          prefs[i.substr(3)] = String(params[i]);
        } else if (i === 'country') {
          country = params[i];
        } else if (i === 'lang') {
          language = params[i];
        } else if (i === 'mid') {
          moduleId = params[i];
        }
      }
    }
  }

  /**
 * Sets default pref values for values left unspecified in the
 * rendering call, but with default_value provided in the spec.
 */
  function mergeDefaults() {
    for (var name in defaultPrefs) {
      if (typeof prefs[name] === 'undefined') {
        prefs[name] = defaultPrefs[name];
      }
    }
  }

  /**
 * @class
 * Provides access to user preferences, module dimensions, and messages.
 *
 * Clients can access their preferences by constructing an instance of
 * gadgets.Prefs and passing in their module id.  Example:
 *
<pre>var prefs = new gadgets.Prefs();
var name = prefs.getString("name");
var lang = prefs.getLang();</pre>
 *
 * @description Creates a new Prefs object.
 *
 * Note: this is actually a singleton. All prefs are linked. If you're wondering
 * why this is a singleton and not just a collection of package functions, the
 * simple answer is that it's how the spec is written. The spec is written this
 * way for legacy compatibility with igoogle.
 */
  gadgets.Prefs = function() {
    if (!instance) {
      parseUrl();
      mergeDefaults();
      instance = this;
    }
    return instance;
  };

  /**
 * Sets internal values
 * @return {boolean} True if the prefs is modified.
 */
  gadgets.Prefs.setInternal_ = function(key, value) {
    var wasModified = false;
    if (typeof key === 'string') {
      if (!prefs.hasOwnProperty(key) || prefs[key] !== value) {
        wasModified = true;
      }
      prefs[key] = value;
    } else {
      for (var k in key) {
        if (key.hasOwnProperty(k)) {
          var v = key[k];
          if (!prefs.hasOwnProperty(k) || prefs[k] !== v) {
            wasModified = true;
          }
          prefs[k] = v;
        }
      }
    }
    return wasModified;
  };

  /**
 * Initializes message bundles.
 */
  gadgets.Prefs.setMessages_ = function(msgs) {
    messages = msgs;
  };

  /**
 * Initializes default user prefs values.
 */
  gadgets.Prefs.setDefaultPrefs_ = function(defprefs) {
    defaultPrefs = defprefs;
  };

  /**
 * Retrieves a preference as a string.
 * Returned value will be html entity escaped.
 *
 * @param {string} key The preference to fetch.
 * @return {string} The preference; if not set, an empty string.
 */
  gadgets.Prefs.prototype.getString = function(key) {
    if (key === '.lang') { key = 'lang'; }
    return prefs[key] ? esc(prefs[key]) : '';
  };

  /*
 * Indicates not to escape string values when retrieving them.
 * This is an internal detail used by _IG_Prefs for backward compatibility.
 */
  gadgets.Prefs.prototype.setDontEscape_ = function() {
    esc = function(k) { return k; };
  };

  /**
 * Retrieves a preference as an integer.
 * @param {string} key The preference to fetch.
 * @return {number} The preference; if not set, 0.
 */
  gadgets.Prefs.prototype.getInt = function(key) {
    var val = parseInt(prefs[key], 10);
    return isNaN(val) ? 0 : val;
  };

  /**
 * Retrieves a preference as a floating-point value.
 * @param {string} key The preference to fetch.
 * @return {number} The preference; if not set, 0.
 */
  gadgets.Prefs.prototype.getFloat = function(key) {
    var val = parseFloat(prefs[key]);
    return isNaN(val) ? 0 : val;
  };

  /**
 * Retrieves a preference as a boolean.
 * @param {string} key The preference to fetch.
 * @return {boolean} The preference; if not set, false.
 */
  gadgets.Prefs.prototype.getBool = function(key) {
    var val = prefs[key];
    if (val) {
      return val === 'true' || val === true || !!parseInt(val, 10);
    }
    return false;
  };

  /**
 * Stores a preference.
 * To use this call,
 * the gadget must require the feature setprefs.
 *
 * <p class="note">
 * <b>Note:</b>
 * If the gadget needs to store an Array it should use setArray instead of
 * this call.
 * </p>
 *
 * @param {string} key The pref to store.
 * @param {Object} val The values to store.
 */
  gadgets.Prefs.prototype.set = function(key, value) {
    throw new Error('setprefs feature required to make this call.');
  };

  /**
 * Retrieves a preference as an array.
 * UserPref values that were not declared as lists are treated as
 * one-element arrays.
 *
 * @param {string} key The preference to fetch.
 * @return {Array.<string>} The preference; if not set, an empty array.
 */
  gadgets.Prefs.prototype.getArray = function(key) {
    var val = prefs[key];
    if (val) {
      var arr = val.split('|');
      // Decode pipe characters.
      for (var i = 0, j = arr.length; i < j; ++i) {
        arr[i] = esc(arr[i].replace(/%7C/g, '|'));
      }
      return arr;
    }
    return [];
  };

  /**
 * Stores an array preference.
 * To use this call,
 * the gadget must require the feature setprefs.
 *
 * @param {string} key The pref to store.
 * @param {Array} val The values to store.
 */
  gadgets.Prefs.prototype.setArray = function(key, val) {
    throw new Error('setprefs feature required to make this call.');
  };

  /**
 * Fetches an unformatted message.
 * @param {string} key The message to fetch.
 * @return {string} The message.
 */
  gadgets.Prefs.prototype.getMsg = function(key) {
    return messages[key] || '';
  };

  /**
 * Gets the current country, returned as ISO 3166-1 alpha-2 code.
 *
 * @return {string} The country for this module instance.
 */
  gadgets.Prefs.prototype.getCountry = function() {
    return country;
  };

  /**
 * Gets the current language the gadget should use when rendering, returned as a
 * ISO 639-1 language code.
 *
 * @return {string} The language for this module instance.
 */
  gadgets.Prefs.prototype.getLang = function() {
    return language;
  };

  /**
 * Gets the module id for the current instance.
 *
 * @return {string | number} The module id for this module instance.
 */
  gadgets.Prefs.prototype.getModuleId = function() {
    return moduleId;
  };

})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistCtors([
    [gadgets, 'Prefs', Object]
  ]);
  caja___.whitelistMeths([
    [gadgets.Prefs, 'getArray'],
    [gadgets.Prefs, 'getBool'],
    [gadgets.Prefs, 'getCountry'],
    [gadgets.Prefs, 'getFloat'],
    [gadgets.Prefs, 'getInt'],
    [gadgets.Prefs, 'getLang'],
    [gadgets.Prefs, 'getMsg'],
    [gadgets.Prefs, 'getString'],
    [gadgets.Prefs, 'set'],
    [gadgets.Prefs, 'setArray']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*global gadgets */
var gadgets;

/**
 * @fileoverview All functions in this file should be treated as deprecated legacy routines.
 * Gadget authors are explicitly discouraged from using any of them.
 */

var JSON = window.JSON || gadgets.json;

/**
 * @deprecated
 */
var _IG_Prefs = (function() {
  var instance = null;

  var _IG_Prefs = function() {
    if (!instance) {
      instance = new gadgets.Prefs();
      instance.setDontEscape_();
    }
    return instance;
  };

  _IG_Prefs._parseURL = gadgets.Prefs.parseUrl;

  return _IG_Prefs;
})();

function _IG_Fetch_wrapper(callback, obj) {
  callback(obj.data ? obj.data : '');
}

/**
 * @deprecated
 */
function _IG_FetchContent(url, callback, opt_params) {
  var params = opt_params || {};
  // This is really the only legacy parameter documented
  // at http://code.google.com/apis/gadgets/docs/remote-content.html#Params
  if (params.refreshInterval) {
    params['REFRESH_INTERVAL'] = params.refreshInterval;
  } else {
    params['REFRESH_INTERVAL'] = 3600;
  }
  // Other params, such as POST_DATA, were supported in lower case.
  // Upper-case all param keys as a convenience, since all valid values
  // are uppercased.
  for (var param in params) {
    var pvalue = params[param];
    delete params[param];
    params[param.toUpperCase()] = pvalue;
  }
  var cb = gadgets.util.makeClosure(null, _IG_Fetch_wrapper, callback);
  gadgets.io.makeRequest(url, cb, params);
}

/**
 * @deprecated
 */
function _IG_FetchXmlContent(url, callback, opt_params) {
  var params = opt_params || {};
  if (params.refreshInterval) {
    params['REFRESH_INTERVAL'] = params.refreshInterval;
  } else {
    params['REFRESH_INTERVAL'] = 3600;
  }
  params.CONTENT_TYPE = 'DOM';
  var cb = gadgets.util.makeClosure(null, _IG_Fetch_wrapper, callback);
  gadgets.io.makeRequest(url, cb, params);
}


/**
 * @deprecated
 */
function _IG_FetchFeedAsJSON(url, callback, numItems, getDescriptions,
                             opt_params) {
  var params = opt_params || {};
  params.CONTENT_TYPE = 'FEED';
  params.NUM_ENTRIES = numItems;
  params.GET_SUMMARIES = getDescriptions;
  gadgets.io.makeRequest(url,
      function(resp) {
        // special case error reporting for back-compatibility
        // see http://code.google.com/apis/gadgets/docs/legacy/remote-content.html#Fetch_JSON
        resp.data = resp.data || {};
        if (resp.errors && resp.errors.length > 0) {
          resp.data.ErrorMsg = resp.errors[0];
        }
        if (resp.data.link) {
          resp.data.URL = url;
        }
        if (resp.data.title) {
          resp.data.Title = resp.data.title;
        }
        if (resp.data.description) {
          resp.data.Description = resp.data.description;
        }
        if (resp.data.link) {
          resp.data.Link = resp.data.link;
        }
        if (resp.data.items && resp.data.items.length > 0) {
          resp.data.Entry = resp.data.items;
          for (var index = 0; index < resp.data.Entry.length; ++index) {
            var entry = resp.data.Entry[index];
            entry.Title = entry.title;
            entry.Link = entry.link;
            entry.Summary = entry.summary || entry.description;
            entry.Date = entry.pubDate;
          }
        }
        for (var ix = 0; ix < resp.data.Entry.length; ++ix) {
          var entry = resp.data.Entry[ix];
          entry.Date = (entry.Date / 1000);  // response in sec, not ms
        }
        // for Gadgets back-compatibility, return the feed obj directly
        callback(resp.data);
      }, params);
}

/**
 * @param {string} url
 * @param {Object=} opt_params
 * @deprecated
 */
function _IG_GetCachedUrl(url, opt_params) {
  var params = opt_params || {};
  params['REFRESH_INTERVAL'] = 3600;
  if (params.refreshInterval) {
    params['REFRESH_INTERVAL'] = params.refreshInterval;
  }
  return gadgets.io.getProxyUrl(url, params);
}
/**
 * @param {string} url
 * @param {Object=} opt_params
 * @deprecated
 */
function _IG_GetImageUrl(url, opt_params) {
  return _IG_GetCachedUrl(url, opt_params);
}

/**
 * @param {string} url
 * @return {Element}
 * @deprecated
 */
function _IG_GetImage(url) {
  var img = document.createElement('img');
  img.src = _IG_GetCachedUrl(url);
  return img;
}


/**
 * @deprecated
 */
function _IG_RegisterOnloadHandler(callback) {
  gadgets.util.registerOnLoadHandler(callback);
}

/**
 * _IG_Callback takes the arguments in the scope the callback is executed and
 * places them first in the argument array. MakeClosure takes the arguments
 * from the scope at callback construction and pushes them first in the array
 *
 * @deprecated
 */
function _IG_Callback(handler_func, var_args) {
  var orig_args = arguments;
  return function() {
    var combined_args = Array.prototype.slice.call(arguments);
    // call the handler with all args combined
    handler_func.apply(null,
        combined_args.concat(Array.prototype.slice.call(orig_args, 1)));
  };
}

var _args = gadgets.util.getUrlParameters;

/**
 * Fetches an object by document id.
 *
 * @param {string | Object} el The element you wish to fetch. You may pass
 *     an object in which allows this to be called regardless of whether or
 *     not the type of the input is known.
 * @return {HTMLElement} The element, if it exists in the document, or null.
 * @deprecated
 */
function _gel(el) {
  return document.getElementById ? document.getElementById(el) : null;
}

/**
 * Fetches elements by tag name.
 * This is functionally identical to document.getElementsByTagName()
 *
 * @param {string} tag The tag to match elements against.
 * @return {Array.<HTMLElement>} All elements of this tag type.
 * @deprecated
 */
function _gelstn(tag) {
  if (tag === '*' && document.all) {
    return document.all;
  }
  return document.getElementsByTagName ?
         document.getElementsByTagName(tag) : [];
}

/**
 * Fetches elements with ids matching a given regular expression.
 *
 * @param {string} tagName The tag to match elements against.
 * @param {RegEx} regex The expression to match.
 * @return {Array.<HTMLElement>} All elements of this tag type that match
 *     regex.
 * @deprecated
 */
function _gelsbyregex(tagName, regex) {
  var matchingTags = _gelstn(tagName);
  var matchingRegex = [];
  for (var i = 0, j = matchingTags.length; i < j; ++i) {
    if (regex.test(matchingTags[i].id)) {
      matchingRegex.push(matchingTags[i]);
    }
  }
  return matchingRegex;
}

/**
 * URI escapes the given string.
 * @param {string} str The string to escape.
 * @return {string} The escaped string.
 * @deprecated
 */
function _esc(str) {
  return window.encodeURIComponent ? encodeURIComponent(str) : escape(str);
}

/**
 * URI unescapes the given string.
 * @param {string} str The string to unescape.
 * @return {string} The unescaped string.
 * @deprecated
 */
function _unesc(str) {
  return window.decodeURIComponent ? decodeURIComponent(str) : unescape(str);
}

/**
 * Encodes HTML entities such as <, " and >.
 *
 * @param {string} str The string to escape.
 * @return {string} The escaped string.
 * @deprecated
 */
function _hesc(str) {
  return gadgets.util.escapeString(str);
}

/**
 * Removes HTML tags from the given input string.
 *
 * @param {string} str The string to strip.
 * @return {string} The stripped string.
 * @deprecated
 */
function _striptags(str) {
  return str.replace(/<\/?[^>]+>/g, '');
}

/**
 * Trims leading & trailing whitespace from the given string.
 *
 * @param {string} str The string to trim.
 * @return {string} The trimmed string.
 * @deprecated
 */
function _trim(str) {
  return str.replace(/^\s+|\s+$/g, '');
}

/**
 * Toggles the given element between being shown and block-style display.
 *
 * @param {string | HTMLElement} el The element to toggle.
 * @deprecated
 */
function _toggle(el) {
  el = (typeof el === 'string') ? _gel(el) : el;
  if (el !== null) {
    if (el.style.display.length === 0 || el.style.display === 'block') {
      el.style.display = 'none';
    } else if (el.style.display === 'none') {
      el.style.display = 'block';
    }
  }
}


var _uid = (function() {
  /**
   * @type {number} A counter used by uniqueId().
   */
  var _legacy_uidCounter = 0;

  /**
   * @return {number} a unique number.
   * @deprecated
   */
  return function() {
    return _legacy_uidCounter++;
  };
})();

/**
 * @param {number} a
 * @param {number} b
 * @return {number} The lesser of a or b.
 * @deprecated
 */
function _min(a, b) {
  return (a < b ? a : b);
}

/**
 * @param {number} a
 * @param {number} b
 * @return {number} The greater of a or b.
 * @deprecated
 */
function _max(a, b) {
  return (a > b ? a : b);
}

/**
 * @param {string} name
 * @param {Array.<string | Object>} sym
 * @deprecated
 */
function _exportSymbols(name, sym) {
  var attach = window;
  var parts = name.split('.');
  for (var i = 0, j = parts.length; i < j; i++) {
    var part = parts[i];
    attach[part] = attach[part] || {};
    attach = attach[part];
  }
  for (var k = 0, l = sym.length; k < l; k += 2) {
    attach[sym[k]] = sym[k + 1];
  }
}

/**
 * @deprecated
 * @param {Object} src
 * @param {string} etype
 * @param {function} func
 * TODO - implement.
 */
function _IG_AddDOMEventHandler(src, etype, func) {
  gadgets.warn('_IG_AddDOMEventHandler not implemented - see SHINDIG-198');
}

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview Support for basic logging capability for gadgets.
 *
 * This functionality replaces alert(msg) and window.console.log(msg).
 *
 * <p>Currently only works on browsers with a console (WebKit based browsers,
 * Firefox with Firebug extension, or Opera).
 *
 * <p>API is designed to be equivalent to existing console.log | warn | error
 * logging APIs supported by Firebug and WebKit based browsers. The only
 * addition is the ability to call gadgets.setLogLevel().
 */

/**
 * @static
 * @namespace Support for basic logging capability for gadgets.
 * @name gadgets.log
 */

gadgets['log'] = (function() {
  /** @const */
  var info_ = 1;
  /** @const */
  var warning_ = 2;
  /** @const */
  var error_ = 3;
  /** @const */
  var none_ = 4;

  /**
 * Log an informational message
 * @param {Object} message - the message to log.
 * @member gadgets
 * @name log
 * @function
 */
  var log = function(message) {
    logAtLevel(info_, message);
  };

  /**
 * Log a warning
 * @param {Object} message - the message to log.
 * @static
 */
  gadgets.warn = function(message) {
    logAtLevel(warning_, message);
  };

  /**
 * Log an error
 * @param {Object} message - The message to log.
 * @static
 */
  gadgets.error = function(message) {
    logAtLevel(error_, message);
  };

  /**
 * Sets the log level threshold.
 * @param {number} logLevel - New log level threshold.
 * @static
 * @member gadgets.log
 * @name setLogLevel
 */
  gadgets['setLogLevel'] = function(logLevel) {
    logLevelThreshold_ = logLevel;
  };

  /**
 * Logs a log message if output console is available, and log threshold is met.
 * @param {number} level - the level to log with. Optional, defaults to gadgets.log.INFO.
 * @param {Object} message - The message to log.
 * @private
 */
  function logAtLevel(level, message) {
    if (level < logLevelThreshold_ || !_console) {
      return;
    }

    if (level === warning_ && _console.warn) {
      _console.warn(message);
    } else if (level === error_ && _console.error) {
      _console.error(message);
    } else if (_console.log) {
      _console.log(message);
    }
  };

  /**
 * Log level for informational logging.
 * @static
 * @const
 * @member gadgets.log
 * @name INFO
 */
  log['INFO'] = info_;

  /**
 * Log level for warning logging.
 * @static
 * @const
 * @member gadgets.log
 * @name WARNING
 */
  log['WARNING'] = warning_;

  /**
 * Log level for no logging
 * @static
 * @const
 * @member gadgets.log
 * @name NONE
 */
  log['NONE'] = none_;

  /**
 * Current log level threshold.
 * @type {number}
 * @private
 */
  var logLevelThreshold_ = info_;



  /**
 * Console to log to
 * @private
 * @static
 */
  var _console = window.console ? window.console :
                       window.opera ? window.opera.postError : undefined;

  return log;
})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  ___.grantRead(gadgets.log, 'INFO');
  ___.grantRead(gadgets.log, 'WARNING');
  ___.grantRead(gadgets.log, 'ERROR');
  ___.grantRead(gadgets.log, 'NONE');
  caja___.whitelistFuncs([
    [gadgets, 'log'],
    [gadgets, 'warn'],
    [gadgets, 'error'],
    [gadgets, 'setLogLevel']
  ]);
});
;
{var css={'properties':(function(){var s=['|left|center|right','|top|center|bottom','#(?:[\\da-f]{3}){1,2}|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|rgb\\(\\s*(?:-?\\d+|0|[+\\-]?\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:-?\\d+|0|[+\\-]?\\d+(?:\\.\\d+)?%)\\s*,\\s*(?:-?\\d+|0|[+\\-]?\\d+(?:\\.\\d+)?%)\\)','[+\\-]?\\d+(?:\\.\\d+)?(?:[cem]m|ex|in|p[ctx])','\\d+(?:\\.\\d+)?(?:[cem]m|ex|in|p[ctx])','none|hidden|dotted|dashed|solid|double|groove|ridge|inset|outset','[+\\-]?\\d+(?:\\.\\d+)?%','\\d+(?:\\.\\d+)?%','url\\(\"[^()\\\\\"\\r\\n]+\"\\)','repeat-x|repeat-y|(?:repeat|space|round|no-repeat)(?:\\s+(?:repeat|space|round|no-repeat)){0,2}'],c=[RegExp('^\\s*(?:\\s*(?:0|'+s[3]+'|'+s[6]+')){1,2}\\s*$','i'),RegExp('^\\s*(?:\\s*(?:0|'+s[3]+'|'+s[6]+')){1,4}(?:\\s*\\/(?:\\s*(?:0|'+s[3]+'|'+s[6]+')){1,4})?\\s*$','i'),RegExp('^\\s*(?:\\s*none|(?:(?:\\s*(?:'+s[2]+')\\s+(?:0|'+s[3]+')(?:\\s*(?:0|'+s[3]+')){1,4}(?:\\s*inset)?|(?:\\s*inset)?\\s+(?:0|'+s[3]+')(?:\\s*(?:0|'+s[3]+')){1,4}(?:\\s*(?:'+s[2]+'))?)\\s*,)*(?:\\s*(?:'+s[2]+')\\s+(?:0|'+s[3]+')(?:\\s*(?:0|'+s[3]+')){1,4}(?:\\s*inset)?|(?:\\s*inset)?\\s+(?:0|'+s[3]+')(?:\\s*(?:0|'+s[3]+')){1,4}(?:\\s*(?:'+s[2]+'))?))\\s*$','i'),RegExp('^\\s*(?:'+s[2]+'|transparent|inherit)\\s*$','i'),RegExp('^\\s*(?:'+s[5]+'|inherit)\\s*$','i'),RegExp('^\\s*(?:thin|medium|thick|0|'+s[3]+'|inherit)\\s*$','i'),RegExp('^\\s*(?:(?:thin|medium|thick|0|'+s[3]+'|'+s[5]+'|'+s[2]+'|transparent|inherit)(?:\\s+(?:thin|medium|thick|0|'+s[3]+')|\\s+(?:'+s[5]+')|\\s*#(?:[\\da-f]{3}){1,2}|\\s+aqua|\\s+black|\\s+blue|\\s+fuchsia|\\s+gray|\\s+green|\\s+lime|\\s+maroon|\\s+navy|\\s+olive|\\s+orange|\\s+purple|\\s+red|\\s+silver|\\s+teal|\\s+white|\\s+yellow|\\s+rgb\\(\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\)|\\s+transparent|\\s+inherit){0,2}|inherit)\\s*$','i'),/^\s*(?:none|inherit)\s*$/i,RegExp('^\\s*(?:'+s[8]+'|none|inherit)\\s*$','i'),RegExp('^\\s*(?:0|'+s[3]+'|'+s[6]+'|auto|inherit)\\s*$','i'),RegExp('^\\s*(?:0|'+s[4]+'|'+s[7]+'|none|inherit|auto)\\s*$','i'),RegExp('^\\s*(?:0|'+s[4]+'|'+s[7]+'|inherit|auto)\\s*$','i'),/^\s*(?:0(?:\.\d+)?|\.\d+|1(?:\.0+)?|inherit)\s*$/i,RegExp('^\\s*(?:(?:'+s[2]+'|invert|inherit|'+s[5]+'|thin|medium|thick|0|'+s[3]+')(?:\\s*#(?:[\\da-f]{3}){1,2}|\\s+aqua|\\s+black|\\s+blue|\\s+fuchsia|\\s+gray|\\s+green|\\s+lime|\\s+maroon|\\s+navy|\\s+olive|\\s+orange|\\s+purple|\\s+red|\\s+silver|\\s+teal|\\s+white|\\s+yellow|\\s+rgb\\(\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\)|\\s+invert|\\s+inherit|\\s+(?:'+s[5]+'|inherit)|\\s+(?:thin|medium|thick|0|'+s[3]+'|inherit)){0,2}|inherit)\\s*$','i'),RegExp('^\\s*(?:'+s[2]+'|invert|inherit)\\s*$','i'),/^\s*(?:visible|hidden|scroll|auto|no-display|no-content)\s*$/i,RegExp('^\\s*(?:0|'+s[4]+'|'+s[7]+'|inherit)\\s*$','i'),/^\s*(?:auto|always|avoid|left|right|inherit)\s*$/i,RegExp('^\\s*(?:0|[+\\-]?\\d+(?:\\.\\d+)?m?s|'+s[6]+'|inherit)\\s*$','i'),/^\s*(?:0|[+\-]?\d+(?:\.\d+)?|inherit)\s*$/i,/^\s*(?:clip|ellipsis)\s*$/i,RegExp('^\\s*(?:normal|0|'+s[3]+'|inherit)\\s*$','i')];return{'-moz-border-radius':c[1],'-moz-border-radius-bottomleft':c[0],'-moz-border-radius-bottomright':c[0],'-moz-border-radius-topleft':c[0],'-moz-border-radius-topright':c[0],'-moz-box-shadow':c[2],'-moz-opacity':c[12],'-moz-outline':c[13],'-moz-outline-color':c[14],'-moz-outline-style':c[4],'-moz-outline-width':c[5],'-o-text-overflow':c[20],'-webkit-border-bottom-left-radius':c[0],'-webkit-border-bottom-right-radius':c[0],'-webkit-border-radius':c[1],'-webkit-border-radius-bottom-left':c[0],'-webkit-border-radius-bottom-right':c[0],'-webkit-border-radius-top-left':c[0],'-webkit-border-radius-top-right':c[0],'-webkit-border-top-left-radius':c[0],'-webkit-border-top-right-radius':c[0],'-webkit-box-shadow':c[2],'azimuth':/^\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:g?rad|deg)|(?:left-side|far-left|left|center-left|center|center-right|right|far-right|right-side|behind)(?:\s+(?:left-side|far-left|left|center-left|center|center-right|right|far-right|right-side|behind))?|leftwards|rightwards|inherit)\s*$/i,'background':RegExp('^\\s*(?:\\s*(?:'+s[8]+'|none|(?:(?:0|'+s[6]+'|'+s[3]+s[0]+')(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[1]+'))?|(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?)(?:\\s+(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?))?)(?:\\s*\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain))?|\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain)|'+s[9]+'|scroll|fixed|local|(?:border|padding|content)-box)(?:\\s*'+s[8]+'|\\s+none|(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[0]+')(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[1]+'))?|(?:\\s+(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?)){1,2})(?:\\s*\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain))?|\\s*\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain)|\\s+repeat-x|\\s+repeat-y|(?:\\s+(?:repeat|space|round|no-repeat)){1,2}|\\s+(?:scroll|fixed|local)|\\s+(?:border|padding|content)-box){0,4}\\s*,)*\\s*(?:'+s[2]+'|transparent|inherit|'+s[8]+'|none|(?:(?:0|'+s[6]+'|'+s[3]+s[0]+')(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[1]+'))?|(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?)(?:\\s+(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?))?)(?:\\s*\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain))?|\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain)|'+s[9]+'|scroll|fixed|local|(?:border|padding|content)-box)(?:\\s*#(?:[\\da-f]{3}){1,2}|\\s+aqua|\\s+black|\\s+blue|\\s+fuchsia|\\s+gray|\\s+green|\\s+lime|\\s+maroon|\\s+navy|\\s+olive|\\s+orange|\\s+purple|\\s+red|\\s+silver|\\s+teal|\\s+white|\\s+yellow|\\s+rgb\\(\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\)|\\s+transparent|\\s+inherit|\\s*'+s[8]+'|\\s+none|(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[0]+')(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[1]+'))?|(?:\\s+(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?)){1,2})(?:\\s*\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain))?|\\s*\\/\\s*(?:(?:0|'+s[4]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[4]+'|'+s[6]+'|auto)){0,2}|cover|contain)|\\s+repeat-x|\\s+repeat-y|(?:\\s+(?:repeat|space|round|no-repeat)){1,2}|\\s+(?:scroll|fixed|local)|\\s+(?:border|padding|content)-box){0,5}\\s*$','i'),'background-attachment':/^\s*(?:scroll|fixed|local)(?:\s*,\s*(?:scroll|fixed|local))*\s*$/i,'background-color':c[3],'background-image':RegExp('^\\s*(?:'+s[8]+'|none)(?:\\s*,\\s*(?:'+s[8]+'|none))*\\s*$','i'),'background-position':RegExp('^\\s*(?:(?:0|'+s[6]+'|'+s[3]+s[0]+')(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[1]+'))?|(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?)(?:\\s+(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?))?)(?:\\s*,\\s*(?:(?:0|'+s[6]+'|'+s[3]+s[0]+')(?:\\s+(?:0|'+s[6]+'|'+s[3]+s[1]+'))?|(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?)(?:\\s+(?:center|(?:lef|righ)t(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?|(?:top|bottom)(?:\\s+(?:0|'+s[6]+'|'+s[3]+'))?))?))*\\s*$','i'),'background-repeat':RegExp('^\\s*(?:'+s[9]+')(?:\\s*,\\s*(?:'+s[9]+'))*\\s*$','i'),'border':RegExp('^\\s*(?:(?:thin|medium|thick|0|'+s[3]+'|'+s[5]+'|'+s[2]+'|transparent)(?:\\s+(?:thin|medium|thick|0|'+s[3]+')|\\s+(?:'+s[5]+')|\\s*#(?:[\\da-f]{3}){1,2}|\\s+aqua|\\s+black|\\s+blue|\\s+fuchsia|\\s+gray|\\s+green|\\s+lime|\\s+maroon|\\s+navy|\\s+olive|\\s+orange|\\s+purple|\\s+red|\\s+silver|\\s+teal|\\s+white|\\s+yellow|\\s+rgb\\(\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\)|\\s+transparent){0,2}|inherit)\\s*$','i'),'border-bottom':c[6],'border-bottom-color':c[3],'border-bottom-left-radius':c[0],'border-bottom-right-radius':c[0],'border-bottom-style':c[4],'border-bottom-width':c[5],'border-collapse':/^\s*(?:collapse|separate|inherit)\s*$/i,'border-color':RegExp('^\\s*(?:(?:'+s[2]+'|transparent)(?:\\s*#(?:[\\da-f]{3}){1,2}|\\s+aqua|\\s+black|\\s+blue|\\s+fuchsia|\\s+gray|\\s+green|\\s+lime|\\s+maroon|\\s+navy|\\s+olive|\\s+orange|\\s+purple|\\s+red|\\s+silver|\\s+teal|\\s+white|\\s+yellow|\\s+rgb\\(\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\s*,\\s*(?:-?\\d+|0|'+s[6]+')\\)|\\s+transparent){0,4}|inherit)\\s*$','i'),'border-left':c[6],'border-left-color':c[3],'border-left-style':c[4],'border-left-width':c[5],'border-radius':c[1],'border-right':c[6],'border-right-color':c[3],'border-right-style':c[4],'border-right-width':c[5],'border-spacing':RegExp('^\\s*(?:(?:\\s*(?:0|'+s[3]+')){1,2}|\\s*inherit)\\s*$','i'),'border-style':RegExp('^\\s*(?:(?:'+s[5]+')(?:\\s+(?:'+s[5]+')){0,4}|inherit)\\s*$','i'),'border-top':c[6],'border-top-color':c[3],'border-top-left-radius':c[0],'border-top-right-radius':c[0],'border-top-style':c[4],'border-top-width':c[5],'border-width':RegExp('^\\s*(?:(?:thin|medium|thick|0|'+s[3]+')(?:\\s+(?:thin|medium|thick|0|'+s[3]+')){0,4}|inherit)\\s*$','i'),'bottom':c[9],'box-shadow':c[2],'caption-side':/^\s*(?:top|bottom|inherit)\s*$/i,'clear':/^\s*(?:none|left|right|both|inherit)\s*$/i,'clip':RegExp('^\\s*(?:rect\\(\\s*(?:0|'+s[3]+'|auto)\\s*,\\s*(?:0|'+s[3]+'|auto)\\s*,\\s*(?:0|'+s[3]+'|auto)\\s*,\\s*(?:0|'+s[3]+'|auto)\\)|auto|inherit)\\s*$','i'),'color':RegExp('^\\s*(?:'+s[2]+'|inherit)\\s*$','i'),'counter-increment':c[7],'counter-reset':c[7],'cue':RegExp('^\\s*(?:(?:'+s[8]+'|none|inherit)(?:\\s*'+s[8]+'|\\s+none|\\s+inherit)?|inherit)\\s*$','i'),'cue-after':c[8],'cue-before':c[8],'cursor':RegExp('^\\s*(?:(?:\\s*'+s[8]+'\\s*,)*\\s*(?:auto|crosshair|default|pointer|move|e-resize|ne-resize|nw-resize|n-resize|se-resize|sw-resize|s-resize|w-resize|text|wait|help|progress|all-scroll|col-resize|hand|no-drop|not-allowed|row-resize|vertical-text)|\\s*inherit)\\s*$','i'),'direction':/^\s*(?:ltr|rtl|inherit)\s*$/i,'display':/^\s*(?:inline|block|list-item|run-in|inline-block|table|inline-table|table-row-group|table-header-group|table-footer-group|table-row|table-column-group|table-column|table-cell|table-caption|none|inherit|-moz-inline-box|-moz-inline-stack)\s*$/i,'elevation':/^\s*(?:0|[+\-]?\d+(?:\.\d+)?(?:g?rad|deg)|below|level|above|higher|lower|inherit)\s*$/i,'empty-cells':/^\s*(?:show|hide|inherit)\s*$/i,'filter':RegExp('^\\s*(?:\\s*alpha\\(\\s*opacity\\s*=\\s*(?:0|'+s[6]+'|[+\\-]?\\d+(?:\\.\\d+)?)\\))+\\s*$','i'),'float':/^\s*(?:left|right|none|inherit)\s*$/i,'font':RegExp('^\\s*(?:(?:normal|italic|oblique|inherit|small-caps|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)(?:\\s+(?:normal|italic|oblique|inherit|small-caps|bold|bolder|lighter|100|200|300|400|500|600|700|800|900)){0,2}\\s+(?:xx-small|x-small|small|medium|large|x-large|xx-large|(?:small|larg)er|0|'+s[4]+'|'+s[7]+'|inherit)(?:\\s*\\/\\s*(?:normal|0|\\d+(?:\\.\\d+)?|'+s[4]+'|'+s[7]+'|inherit))?(?:(?:\\s*\"\\w(?:[\\w-]*\\w)(?:\\s+\\w([\\w-]*\\w))*\"|\\s+(?:serif|sans-serif|cursive|fantasy|monospace))(?:\\s*,\\s*(?:\"\\w(?:[\\w-]*\\w)(?:\\s+\\w([\\w-]*\\w))*\"|serif|sans-serif|cursive|fantasy|monospace))*|\\s+inherit)|caption|icon|menu|message-box|small-caption|status-bar|inherit)\\s*$','i'),'font-family':/^\s*(?:(?:"\w(?:[\w-]*\w)(?:\s+\w([\w-]*\w))*"|serif|sans-serif|cursive|fantasy|monospace)(?:\s*,\s*(?:"\w(?:[\w-]*\w)(?:\s+\w([\w-]*\w))*"|serif|sans-serif|cursive|fantasy|monospace))*|inherit)\s*$/i,'font-size':RegExp('^\\s*(?:xx-small|x-small|small|medium|large|x-large|xx-large|(?:small|larg)er|0|'+s[4]+'|'+s[7]+'|inherit)\\s*$','i'),'font-stretch':/^\s*(?:normal|wider|narrower|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded)\s*$/i,'font-style':/^\s*(?:normal|italic|oblique|inherit)\s*$/i,'font-variant':/^\s*(?:normal|small-caps|inherit)\s*$/i,'font-weight':/^\s*(?:normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit)\s*$/i,'height':c[9],'left':c[9],'letter-spacing':c[21],'line-height':RegExp('^\\s*(?:normal|0|\\d+(?:\\.\\d+)?|'+s[4]+'|'+s[7]+'|inherit)\\s*$','i'),'list-style':RegExp('^\\s*(?:(?:disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-greek|lower-latin|upper-latin|armenian|georgian|lower-alpha|upper-alpha|none|inherit|inside|outside|'+s[8]+')(?:\\s+(?:disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-greek|lower-latin|upper-latin|armenian|georgian|lower-alpha|upper-alpha|none|inherit)|\\s+(?:inside|outside|inherit)|\\s*'+s[8]+'|\\s+none|\\s+inherit){0,2}|inherit)\\s*$','i'),'list-style-image':c[8],'list-style-position':/^\s*(?:inside|outside|inherit)\s*$/i,'list-style-type':/^\s*(?:disc|circle|square|decimal|decimal-leading-zero|lower-roman|upper-roman|lower-greek|lower-latin|upper-latin|armenian|georgian|lower-alpha|upper-alpha|none|inherit)\s*$/i,'margin':RegExp('^\\s*(?:(?:0|'+s[3]+'|'+s[6]+'|auto)(?:\\s+(?:0|'+s[3]+'|'+s[6]+'|auto)){0,4}|inherit)\\s*$','i'),'margin-bottom':c[9],'margin-left':c[9],'margin-right':c[9],'margin-top':c[9],'max-height':c[10],'max-width':c[10],'min-height':c[11],'min-width':c[11],'opacity':c[12],'outline':c[13],'outline-color':c[14],'outline-style':c[4],'outline-width':c[5],'overflow':/^\s*(?:visible|hidden|scroll|auto|inherit)\s*$/i,'overflow-x':c[15],'overflow-y':c[15],'padding':RegExp('^\\s*(?:(?:\\s*(?:0|'+s[4]+'|'+s[7]+')){1,4}|\\s*inherit)\\s*$','i'),'padding-bottom':c[16],'padding-left':c[16],'padding-right':c[16],'padding-top':c[16],'page-break-after':c[17],'page-break-before':c[17],'page-break-inside':/^\s*(?:avoid|auto|inherit)\s*$/i,'pause':RegExp('^\\s*(?:(?:\\s*(?:0|[+\\-]?\\d+(?:\\.\\d+)?m?s|'+s[6]+')){1,2}|\\s*inherit)\\s*$','i'),'pause-after':c[18],'pause-before':c[18],'pitch':/^\s*(?:0|\d+(?:\.\d+)?k?Hz|x-low|low|medium|high|x-high|inherit)\s*$/i,'pitch-range':c[19],'play-during':RegExp('^\\s*(?:'+s[8]+'\\s*(?:mix|repeat)(?:\\s+(?:mix|repeat))?|auto|none|inherit)\\s*$','i'),'position':/^\s*(?:static|relative|absolute|inherit)\s*$/i,'quotes':c[7],'richness':c[19],'right':c[9],'speak':/^\s*(?:normal|none|spell-out|inherit)\s*$/i,'speak-header':/^\s*(?:once|always|inherit)\s*$/i,'speak-numeral':/^\s*(?:digits|continuous|inherit)\s*$/i,'speak-punctuation':/^\s*(?:code|none|inherit)\s*$/i,'speech-rate':/^\s*(?:0|[+\-]?\d+(?:\.\d+)?|x-slow|slow|medium|fast|x-fast|faster|slower|inherit)\s*$/i,'stress':c[19],'table-layout':/^\s*(?:auto|fixed|inherit)\s*$/i,'text-align':/^\s*(?:left|right|center|justify|inherit)\s*$/i,'text-decoration':/^\s*(?:none|(?:underline|overline|line-through|blink)(?:\s+(?:underline|overline|line-through|blink)){0,3}|inherit)\s*$/i,'text-indent':RegExp('^\\s*(?:0|'+s[3]+'|'+s[6]+'|inherit)\\s*$','i'),'text-overflow':c[20],'text-shadow':c[2],'text-transform':/^\s*(?:capitalize|uppercase|lowercase|none|inherit)\s*$/i,'text-wrap':/^\s*(?:normal|unrestricted|none|suppress)\s*$/i,'top':c[9],'unicode-bidi':/^\s*(?:normal|embed|bidi-override|inherit)\s*$/i,'vertical-align':RegExp('^\\s*(?:baseline|sub|super|top|text-top|middle|bottom|text-bottom|0|'+s[6]+'|'+s[3]+'|inherit)\\s*$','i'),'visibility':/^\s*(?:visible|hidden|collapse|inherit)\s*$/i,'voice-family':/^\s*(?:(?:\s*(?:"\w(?:[\w-]*\w)(?:\s+\w([\w-]*\w))*"|male|female|child)\s*,)*\s*(?:"\w(?:[\w-]*\w)(?:\s+\w([\w-]*\w))*"|male|female|child)|\s*inherit)\s*$/i,'volume':RegExp('^\\s*(?:0|\\d+(?:\\.\\d+)?|'+s[7]+'|silent|x-soft|soft|medium|loud|x-loud|inherit)\\s*$','i'),'white-space':/^\s*(?:normal|pre|nowrap|pre-wrap|pre-line|inherit|-o-pre-wrap|-moz-pre-wrap|-pre-wrap)\s*$/i,'width':RegExp('^\\s*(?:0|'+s[4]+'|'+s[7]+'|auto|inherit)\\s*$','i'),'word-spacing':c[21],'word-wrap':/^\s*(?:normal|break-word)\s*$/i,'z-index':/^\s*(?:auto|-?\d+|inherit)\s*$/i,'zoom':RegExp('^\\s*(?:normal|0|\\d+(?:\\.\\d+)?|'+s[7]+')\\s*$','i')}})(),'alternates':{'MozBoxShadow':['boxShadow'],'WebkitBoxShadow':['boxShadow'],'float':['cssFloat','styleFloat']},'HISTORY_INSENSITIVE_STYLE_WHITELIST':{'display':true,'filter':true,'float':true,'height':true,'left':true,'opacity':true,'overflow':true,'position':true,'right':true,'top':true,'visibility':true,'width':true,'padding-left':true,'padding-right':true,'padding-top':true,'padding-bottom':true}},html,html4;html4={},html4
.atype={'NONE':0,'URI':1,'URI_FRAGMENT':11,'SCRIPT':2,'STYLE':3,'ID':4,'IDREF':5,'IDREFS':6,'GLOBAL_NAME':7,'LOCAL_NAME':8,'CLASSES':9,'FRAME_TARGET':10},html4
.ATTRIBS={'*::class':9,'*::dir':0,'*::id':4,'*::lang':0,'*::onclick':2,'*::ondblclick':2,'*::onkeydown':2,'*::onkeypress':2,'*::onkeyup':2,'*::onload':2,'*::onmousedown':2,'*::onmousemove':2,'*::onmouseout':2,'*::onmouseover':2,'*::onmouseup':2,'*::style':3,'*::title':0,'a::accesskey':0,'a::coords':0,'a::href':1,'a::hreflang':0,'a::name':7,'a::onblur':2,'a::onfocus':2,'a::rel':0,'a::rev':0,'a::shape':0,'a::tabindex':0,'a::target':10,'a::type':0,'area::accesskey':0,'area::alt':0,'area::coords':0,'area::href':1,'area::nohref':0,'area::onblur':2,'area::onfocus':2,'area::shape':0,'area::tabindex':0,'area::target':10,'bdo::dir':0,'blockquote::cite':1,'br::clear':0,'button::accesskey':0,'button::disabled':0,'button::name':8,'button::onblur':2,'button::onfocus':2,'button::tabindex':0,'button::type':0,'button::value':0,'caption::align':0,'col::align':0,'col::char':0,'col::charoff':0,'col::span':0,'col::valign':0,'col::width':0,'colgroup::align':0,'colgroup::char':0,'colgroup::charoff':0,'colgroup::span':0,'colgroup::valign':0,'colgroup::width':0,'del::cite':1,'del::datetime':0,'dir::compact':0,'div::align':0,'dl::compact':0,'font::color':0,'font::face':0,'font::size':0,'form::accept':0,'form::action':1,'form::autocomplete':0,'form::enctype':0,'form::method':0,'form::name':7,'form::onreset':2,'form::onsubmit':2,'form::target':10,'h1::align':0,'h2::align':0,'h3::align':0,'h4::align':0,'h5::align':0,'h6::align':0,'hr::align':0,'hr::noshade':0,'hr::size':0,'hr::width':0,'iframe::align':0,'iframe::frameborder':0,'iframe::height':0,'iframe::marginheight':0,'iframe::marginwidth':0,'iframe::width':0,'img::align':0,'img::alt':0,'img::border':0,'img::height':0,'img::hspace':0,'img::ismap':0,'img::name':7,'img::src':1,'img::usemap':11,'img::vspace':0,'img::width':0,'input::accept':0,'input::accesskey':0,'input::align':0,'input::alt':0,'input::autocomplete':0,'input::checked':0,'input::disabled':0,'input::ismap':0,'input::maxlength':0,'input::name':8,'input::onblur':2,'input::onchange':2,'input::onfocus':2,'input::onselect':2,'input::readonly':0,'input::size':0,'input::src':1,'input::tabindex':0,'input::type':0,'input::usemap':11,'input::value':0,'ins::cite':1,'ins::datetime':0,'label::accesskey':0,'label::for':5,'label::onblur':2,'label::onfocus':2,'legend::accesskey':0,'legend::align':0,'li::type':0,'li::value':0,'map::name':7,'menu::compact':0,'ol::compact':0,'ol::start':0,'ol::type':0,'optgroup::disabled':0,'optgroup::label':0,'option::disabled':0,'option::label':0,'option::selected':0,'option::value':0,'p::align':0,'pre::width':0,'q::cite':1,'select::disabled':0,'select::multiple':0,'select::name':8,'select::onblur':2,'select::onchange':2,'select::onfocus':2,'select::size':0,'select::tabindex':0,'table::align':0,'table::bgcolor':0,'table::border':0,'table::cellpadding':0,'table::cellspacing':0,'table::frame':0,'table::rules':0,'table::summary':0,'table::width':0,'tbody::align':0,'tbody::char':0,'tbody::charoff':0,'tbody::valign':0,'td::abbr':0,'td::align':0,'td::axis':0,'td::bgcolor':0,'td::char':0,'td::charoff':0,'td::colspan':0,'td::headers':6,'td::height':0,'td::nowrap':0,'td::rowspan':0,'td::scope':0,'td::valign':0,'td::width':0,'textarea::accesskey':0,'textarea::cols':0,'textarea::disabled':0,'textarea::name':8,'textarea::onblur':2,'textarea::onchange':2,'textarea::onfocus':2,'textarea::onselect':2,'textarea::readonly':0,'textarea::rows':0,'textarea::tabindex':0,'tfoot::align':0,'tfoot::char':0,'tfoot::charoff':0,'tfoot::valign':0,'th::abbr':0,'th::align':0,'th::axis':0,'th::bgcolor':0,'th::char':0,'th::charoff':0,'th::colspan':0,'th::headers':6,'th::height':0,'th::nowrap':0,'th::rowspan':0,'th::scope':0,'th::valign':0,'th::width':0,'thead::align':0,'thead::char':0,'thead::charoff':0,'thead::valign':0,'tr::align':0,'tr::bgcolor':0,'tr::char':0,'tr::charoff':0,'tr::valign':0,'ul::compact':0,'ul::type':0},html4
.eflags={'OPTIONAL_ENDTAG':1,'EMPTY':2,'CDATA':4,'RCDATA':8,'UNSAFE':16,'FOLDABLE':32,'SCRIPT':64,'STYLE':128},html4
.ELEMENTS={'a':0,'abbr':0,'acronym':0,'address':0,'applet':16,'area':2,'b':0,'base':18,'basefont':18,'bdo':0,'big':0,'blockquote':0,'body':49,'br':2,'button':0,'caption':0,'center':0,'cite':0,'code':0,'col':2,'colgroup':1,'dd':1,'del':0,'dfn':0,'dir':0,'div':0,'dl':0,'dt':1,'em':0,'fieldset':0,'font':0,'form':0,'frame':18,'frameset':16,'h1':0,'h2':0,'h3':0,'h4':0,'h5':0,'h6':0,'head':49,'hr':2,'html':49,'i':0,'iframe':4,'img':2,'input':2,'ins':0,'isindex':18,'kbd':0,'label':0,'legend':0,'li':1,'link':18,'map':0,'menu':0,'meta':18,'noframes':20,'noscript':20,'object':16,'ol':0,'optgroup':0,'option':1,'p':1,'param':18,'pre':0,'q':0,'s':0,'samp':0,'script':84,'select':0,'small':0,'span':0,'strike':0,'strong':0,'style':148,'sub':0,'sup':0,'table':0,'tbody':1,'td':1,'textarea':8,'tfoot':1,'th':1,'thead':1,'title':24,'tr':1,'tt':0,'u':0,'ul':0,'var':0},html=(function(){var
ENTITIES,INSIDE_TAG_TOKEN,OUTSIDE_TAG_TOKEN,ampRe,decimalEscapeRe,entityRe,eqRe,gtRe,hexEscapeRe,lcase,looseAmpRe,ltRe,nulRe,quotRe;'script'==='SCRIPT'.toLowerCase()?(lcase=function(s){return s.toLowerCase()}):(lcase=function(s){return s.replace(/[A-Z]/g,function(ch){return String.fromCharCode(ch.charCodeAt(0)|32)})}),ENTITIES={'lt':'<','gt':'>','amp':'&','nbsp':'\xa0','quot':'\"','apos':'\''},decimalEscapeRe=/^#(\d+)$/,hexEscapeRe=/^#x([0-9A-Fa-f]+)$/;function
lookupEntity(name){var m;return name=lcase(name),ENTITIES.hasOwnProperty(name)?ENTITIES[name]:(m=name.match(decimalEscapeRe),m?String.fromCharCode(parseInt(m[1],10)):(m=name.match(hexEscapeRe))?String.fromCharCode(parseInt(m[1],16)):'')}function
decodeOneEntity(_,name){return lookupEntity(name)}nulRe=/\0/g;function stripNULs(s){return s.replace(nulRe,'')}entityRe=/&(#\d+|#x[0-9A-Fa-f]+|\w+);/g;function
unescapeEntities(s){return s.replace(entityRe,decodeOneEntity)}ampRe=/&/g,looseAmpRe=/&([^a-z#]|#(?:[^0-9x]|x(?:[^0-9a-f]|$)|$)|$)/gi,ltRe=/</g,gtRe=/>/g,quotRe=/\"/g,eqRe=/\=/g;function
escapeAttrib(s){return s.replace(ampRe,'&amp;').replace(ltRe,'&lt;').replace(gtRe,'&gt;').replace(quotRe,'&#34;').replace(eqRe,'&#61;')}function
normalizeRCData(rcdata){return rcdata.replace(looseAmpRe,'&amp;$1').replace(ltRe,'&lt;').replace(gtRe,'&gt;')}INSIDE_TAG_TOKEN=new
RegExp('^\\s*(?:(?:([a-z][a-z-]*)(\\s*=\\s*(\"[^\"]*\"|\'[^\']*\'|(?=[a-z][a-z-]*\\s*=)|[^>\"\'\\s]*))?)|(/?>)|.[^a-z\\s>]*)','i'),OUTSIDE_TAG_TOKEN=new
RegExp('^(?:&(\\#[0-9]+|\\#[x][0-9a-f]+|\\w+);|<!--[\\s\\S]*?-->|<!\\w[^>]*>|<\\?[^>*]*>|<(/)?([a-z][a-z0-9]*)|([^<&>]+)|([<&>]))','i');function
makeSaxParser(handler){return function parse(htmlText,param){var attribName,attribs,dataEnd,decodedValue,eflags,encodedValue,htmlLower,inTag,m,openTag,tagName;htmlText=String(htmlText),htmlLower=null,inTag=false,attribs=[],tagName=void
0,eflags=void 0,openTag=void 0,handler.startDoc&&handler.startDoc(param);while(htmlText){m=htmlText.match(inTag?INSIDE_TAG_TOKEN:OUTSIDE_TAG_TOKEN),htmlText=htmlText.substring(m[0].length);if(inTag){if(m[1]){attribName=lcase(m[1]);if(m[2]){encodedValue=m[3];switch(encodedValue.charCodeAt(0)){case
34:case 39:encodedValue=encodedValue.substring(1,encodedValue.length-1)}decodedValue=unescapeEntities(stripNULs(encodedValue))}else
decodedValue=attribName;attribs.push(attribName,decodedValue)}else if(m[4])eflags!==void
0&&(openTag?handler.startTag&&handler.startTag(tagName,attribs,param):handler.endTag&&handler.endTag(tagName,param)),openTag&&eflags&(html4
.eflags.CDATA|html4 .eflags.RCDATA)&&(htmlLower===null?(htmlLower=lcase(htmlText)):(htmlLower=htmlLower.substring(htmlLower.length-htmlText.length)),dataEnd=htmlLower.indexOf('</'+tagName),dataEnd<0&&(dataEnd=htmlText.length),eflags&html4
.eflags.CDATA?handler.cdata&&handler.cdata(htmlText.substring(0,dataEnd),param):handler.rcdata&&handler.rcdata(normalizeRCData(htmlText.substring(0,dataEnd)),param),htmlText=htmlText.substring(dataEnd)),tagName=eflags=openTag=void
0,attribs.length=0,inTag=false}else if(m[1])handler.pcdata&&handler.pcdata(m[0],param);else
if(m[3])openTag=!m[2],inTag=true,tagName=lcase(m[3]),eflags=html4 .ELEMENTS.hasOwnProperty(tagName)?html4
.ELEMENTS[tagName]:void 0;else if(m[4])handler.pcdata&&handler.pcdata(m[4],param);else
if(m[5]){if(handler.pcdata)switch(m[5]){case'<':handler.pcdata('&lt;',param);break;case'>':handler.pcdata('&gt;',param);break;default:handler.pcdata('&amp;',param)}}}handler.endDoc&&handler.endDoc(param)}}return{'normalizeRCData':normalizeRCData,'escapeAttrib':escapeAttrib,'unescapeEntities':unescapeEntities,'makeSaxParser':makeSaxParser}})(),html.makeHtmlSanitizer=function(sanitizeAttributes){var
ignoring,stack;return html.makeSaxParser({'startDoc':function(_){stack=[],ignoring=false},'startTag':function(tagName,attribs,out){var
attribName,eflags,i,n,value;if(ignoring)return;if(!html4 .ELEMENTS.hasOwnProperty(tagName))return;eflags=html4
.ELEMENTS[tagName];if(eflags&html4 .eflags.FOLDABLE)return;else if(eflags&html4 .eflags.UNSAFE)return ignoring=!(eflags&html4
.eflags.EMPTY),void 0;attribs=sanitizeAttributes(tagName,attribs);if(attribs){eflags&html4
.eflags.EMPTY||stack.push(tagName),out.push('<',tagName);for(i=0,n=attribs.length;i<n;i+=2)attribName=attribs[i],value=attribs[i+1],value!==null&&value!==void
0&&out.push(' ',attribName,'=\"',html.escapeAttrib(value),'\"');out.push('>')}},'endTag':function(tagName,out){var
eflags,i,index,stackEl;if(ignoring)return ignoring=false,void 0;if(!html4 .ELEMENTS.hasOwnProperty(tagName))return;eflags=html4
.ELEMENTS[tagName];if(!(eflags&(html4 .eflags.UNSAFE|html4 .eflags.EMPTY|html4 .eflags.FOLDABLE))){if(eflags&html4
.eflags.OPTIONAL_ENDTAG)for(index=stack.length;--index>=0;){stackEl=stack[index];if(stackEl===tagName)break;if(!(html4
.ELEMENTS[stackEl]&html4 .eflags.OPTIONAL_ENDTAG))return}else for(index=stack.length;--index>=0;)if(stack[index]===tagName)break;if(index<0)return;for(i=stack.length;--i>index;)stackEl=stack[i],html4
.ELEMENTS[stackEl]&html4 .eflags.OPTIONAL_ENDTAG||out.push('</',stackEl,'>');stack.length=index,out.push('</',tagName,'>')}},'pcdata':function(text,out){ignoring||out.push(text)},'rcdata':function(text,out){ignoring||out.push(text)},'cdata':function(text,out){ignoring||out.push(text)},'endDoc':function(out){var
i;for(i=stack.length;--i>=0;)out.push('</',stack[i],'>');stack.length=0}})};function
html_sanitize(htmlText,opt_uriPolicy,opt_nmTokenPolicy){var out=[];return html.makeHtmlSanitizer(function
sanitizeAttribs(tagName,attribs){var attribKey,attribName,atype,i,value;for(i=0;i<attribs.length;i+=2){attribName=attribs[i],value=attribs[i+1],atype=null,((attribKey=tagName+'::'+attribName,html4
.ATTRIBS.hasOwnProperty(attribKey))||(attribKey='*::'+attribName,html4 .ATTRIBS.hasOwnProperty(attribKey)))&&(atype=html4
.ATTRIBS[attribKey]);if(atype!==null)switch(atype){case html4 .atype.NONE:break;case
html4 .atype.SCRIPT:case html4 .atype.STYLE:value=null;break;case html4 .atype.ID:case
html4 .atype.IDREF:case html4 .atype.IDREFS:case html4 .atype.GLOBAL_NAME:case html4
.atype.LOCAL_NAME:case html4 .atype.CLASSES:value=opt_nmTokenPolicy?opt_nmTokenPolicy(value):value;break;case
html4 .atype.URI:value=opt_uriPolicy&&opt_uriPolicy(value);break;case html4 .atype.URI_FRAGMENT:value&&'#'===value.charAt(0)?(value=opt_nmTokenPolicy?opt_nmTokenPolicy(value):value,value&&(value='#'+value)):(value=null);break;default:value=null}else
value=null;attribs[i+1]=value}return attribs})(htmlText,out),out.join('')}};
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/**
 * Transport for browsers that support native messaging (various implementations
 * of the HTML5 postMessage method). Officially defined at
 * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html.
 *
 * postMessage is a native implementation of XDC. A page registers that
 * it would like to receive messages by listening the the "message" event
 * on the window (document in DPM) object. In turn, another page can
 * raise that event by calling window.postMessage (document.postMessage
 * in DPM) with a string representing the message and a string
 * indicating on which domain the receiving page must be to receive
 * the message. The target page will then have its "message" event raised
 * if the domain matches and can, in turn, check the origin of the message
 * and process the data contained within.
 *
 *   wpm: postMessage on the window object.
 *      - Internet Explorer 8+
 *      - Safari 4+
 *      - Chrome 2+
 *      - Webkit nightlies
 *      - Firefox 3+
 *      - Opera 9+
 */
if (!gadgets.rpctx.wpm) {  // make lib resilient to double-inclusion

  gadgets.rpctx.wpm = function() {
    var process, ready;
    var postMessage;
    var pmSync = false;
    var pmEventDomain = false;
    var isForceSecure = false;

    // Some browsers (IE, Opera) have an implementation of postMessage that is
    // synchronous, although HTML5 specifies that it should be asynchronous.  In
    // order to make all browsers behave consistently, we run a small test to detect
    // if postMessage is asynchronous or not.  If not, we wrap calls to postMessage
    // in a setTimeout with a timeout of 0.
    // Also, Opera's "message" event does not have an "origin" property (at least,
    // it doesn't in version 9.64;  presumably, it will in version 10).  If
    // event.origin does not exist, use event.domain.  The other difference is that
    // while event.origin looks like <scheme>://<hostname>:<port>, event.domain
    // consists only of <hostname>.
    //
    function testPostMessage() {
      var hit = false;

      function receiveMsg(event) {
        if (event.data == 'postmessage.test') {
          hit = true;
          if (typeof event.origin === 'undefined') {
            pmEventDomain = true;
          }
        }
      }

      gadgets.util.attachBrowserEvent(window, 'message', receiveMsg, false);
      window.postMessage('postmessage.test', '*');

      // if 'hit' is true here, then postMessage is synchronous
      if (hit) {
        pmSync = true;
      }

      gadgets.util.removeBrowserEvent(window, 'message', receiveMsg, false);
    }

    function onmessage(packet) {
      var rpc = gadgets.json.parse(packet.data);
      if (isForceSecure) {
        if (!rpc || !rpc.f) {
          return;
        }

        // for security, check origin against expected value
        var origRelay = gadgets.rpc.getRelayUrl(rpc.f) ||
            gadgets.util.getUrlParameters()['parent'];
        var origin = gadgets.rpc.getOrigin(origRelay);
        if (!pmEventDomain ? packet.origin !== origin :
            packet.domain !== /^.+:\/\/([^:]+).*/.exec(origin)[1]) {
          return;
        }
      }
      process(rpc);
    }

    return {
      getCode: function() {
        return 'wpm';
      },

      isParentVerifiable: function() {
        return true;
      },

      init: function(processFn, readyFn) {
        process = processFn;
        ready = readyFn;

        testPostMessage();
        if (!pmSync) {
          postMessage = function(win, msg, origin) {
            win.postMessage(msg, origin);
          };
        } else {
          postMessage = function(win, msg, origin) {
            window.setTimeout(function() {
              win.postMessage(msg, origin);
            }, 0);
          };
        }

        // Set up native postMessage handler.
        gadgets.util.attachBrowserEvent(window, 'message', onmessage, false);

        ready('..', true);  // Immediately ready to send to parent.
        return true;
      },

      setup: function(receiverId, token, forceSecure) {
        isForceSecure = forceSecure;
        // If we're a gadget, send an ACK message to indicate to container
        // that we're ready to receive messages.
        if (receiverId === '..') {
          if (isForceSecure) {
            gadgets.rpc._createRelayIframe(token);
          } else {
            gadgets.rpc.call(receiverId, gadgets.rpc.ACK);
          }
        }
        return true;
      },

      call: function(targetId, from, rpc) {
        var targetWin = gadgets.rpc._getTargetWin(targetId);
        // targetOrigin = canonicalized relay URL
        var origRelay = gadgets.rpc.getRelayUrl(targetId) ||
            gadgets.util.getUrlParameters()['parent'];
        var origin = gadgets.rpc.getOrigin(origRelay);
        if (origin) {
          postMessage(targetWin, gadgets.json.stringify(rpc), origin);
        } else {
          gadgets.error('No relay set (used as window.postMessage targetOrigin)' +
              ', cannot send cross-domain message');
        }
        return true;
      },

      relayOnload: function(receiverId, data) {
        ready(receiverId, true);
      }
    };
  }();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/*
 * For Gecko-based browsers, the security model allows a child to call a
 * function on the frameElement of the iframe, even if the child is in
 * a different domain. This method is dubbed "frameElement" (fe).
 *
 * The ability to add and call such functions on the frameElement allows
 * a bidirectional channel to be setup via the adding of simple function
 * references on the frameElement object itself. In this implementation,
 * when the container sets up the authentication information for that gadget
 * (by calling setAuth(...)) it as well adds a special function on the
 * gadget's iframe. This function can then be used by the gadget to send
 * messages to the container. In turn, when the gadget tries to send a
 * message, it checks to see if this function has its own function stored
 * that can be used by the container to call the gadget. If not, the
 * function is created and subsequently used by the container.
 * Note that as a result, FE can only be used by a container to call a
 * particular gadget *after* that gadget has called the container at
 * least once via FE.
 *
 *   fe: Gecko-specific frameElement trick.
 *      - Firefox 1+
 */
if (!gadgets.rpctx.frameElement) {  // make lib resilient to double-inclusion

  gadgets.rpctx.frameElement = function() {
    // Consts for FrameElement.
    var FE_G2C_CHANNEL = '__g2c_rpc';
    var FE_C2G_CHANNEL = '__c2g_rpc';
    var process;
    var ready;

    function callFrameElement(targetId, from, rpc) {
      try {
        if (from !== '..') {
          // Call from gadget to the container.
          var fe = window.frameElement;

          if (typeof fe[FE_G2C_CHANNEL] === 'function') {
            // Complete the setup of the FE channel if need be.
            if (typeof fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL] !== 'function') {
              fe[FE_G2C_CHANNEL][FE_C2G_CHANNEL] = function(args) {
                process(gadgets.json.parse(args));
              };
            }

            // Conduct the RPC call.
            fe[FE_G2C_CHANNEL](gadgets.json.stringify(rpc));
            return true;
          }
        } else {
          // Call from container to gadget[targetId].
          var frame = document.getElementById(targetId);

          if (typeof frame[FE_G2C_CHANNEL] === 'function' &&
              typeof frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL] === 'function') {

            // Conduct the RPC call.
            frame[FE_G2C_CHANNEL][FE_C2G_CHANNEL](gadgets.json.stringify(rpc));
            return true;
          }
        }
      } catch (e) {
      }
      return false;
    }

    return {
      getCode: function() {
        return 'fe';
      },

      isParentVerifiable: function() {
        return false;
      },

      init: function(processFn, readyFn) {
        // No global setup.
        process = processFn;
        ready = readyFn;
        return true;
      },

      setup: function(receiverId, token) {
        // Indicate OK to call to container. This will be true
        // by the end of this method.
        if (receiverId !== '..') {
          try {
            var frame = document.getElementById(receiverId);
            frame[FE_G2C_CHANNEL] = function(args) {
              process(gadgets.json.parse(args));
            };
          } catch (e) {
            return false;
          }
        }
        if (receiverId === '..') {
          ready('..', true);
          var ackFn = function() {
            window.setTimeout(function() {
              gadgets.rpc.call(receiverId, gadgets.rpc.ACK);
            }, 500);
          };
          // Setup to container always happens before onload.
          // If it didn't, the correct fix would be in gadgets.util.
          gadgets.util.registerOnLoadHandler(ackFn);
        }
        return true;
      },

      call: function(targetId, from, rpc) {
        return callFrameElement(targetId, from, rpc);
      }

    };
  }();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/**
 * For Internet Explorer before version 8, the security model allows anyone
 * parent to set the value of the "opener" property on another window,
 * with only the receiving window able to read it.
 * This method is dubbed "Native IE XDC" (NIX).
 *
 * This method works by placing a handler object in the "opener" property
 * of a gadget when the container sets up the authentication information
 * for that gadget (by calling setAuthToken(...)). At that point, a NIX
 * wrapper is created and placed into the gadget by calling
 * theframe.contentWindow.opener = wrapper. Note that as a result, NIX can
 * only be used by a container to call a particular gadget *after* that
 * gadget has called the container at least once via NIX.
 *
 * The NIX wrappers in this RPC implementation are instances of a VBScript
 * class that is created when this implementation loads. The reason for
 * using a VBScript class stems from the fact that any object can be passed
 * into the opener property.
 * While this is a good thing, as it lets us pass functions and setup a true
 * bidirectional channel via callbacks, it opens a potential security hole
 * by which the other page can get ahold of the "window" or "document"
 * objects in the parent page and in turn wreak havok. This is due to the
 * fact that any JS object useful for establishing such a bidirectional
 * channel (such as a function) can be used to access a function
 * (eg. obj.toString, or a function itself) created in a specific context,
 * in particular the global context of the sender. Suppose container
 * domain C passes object obj to gadget on domain G. Then the gadget can
 * access C's global context using:
 * var parentWindow = (new obj.toString.constructor("return window;"))();
 * Nulling out all of obj's properties doesn't fix this, since IE helpfully
 * restores them to their original values if you do something like:
 * delete obj.toString; delete obj.toString;
 * Thus, we wrap the necessary functions and information inside a VBScript
 * object. VBScript objects in IE, like DOM objects, are in fact COM
 * wrappers when used in JavaScript, so we can safely pass them around
 * without worrying about a breach of context while at the same time
 * allowing them to act as a pass-through mechanism for information
 * and function calls. The implementation details of this VBScript wrapper
 * can be found in the setupChannel() method below.
 *
 *   nix: Internet Explorer-specific window.opener trick.
 *     - Internet Explorer 6
 *     - Internet Explorer 7
 */
if (!gadgets.rpctx.nix) {  // make lib resilient to double-inclusion

  gadgets.rpctx.nix = function() {
    // Consts for NIX. VBScript doesn't
    // allow items to start with _ for some reason,
    // so we need to make these names quite unique, as
    // they will go into the global namespace.
    var NIX_WRAPPER = 'GRPC____NIXVBS_wrapper';
    var NIX_GET_WRAPPER = 'GRPC____NIXVBS_get_wrapper';
    var NIX_HANDLE_MESSAGE = 'GRPC____NIXVBS_handle_message';
    var NIX_CREATE_CHANNEL = 'GRPC____NIXVBS_create_channel';
    var MAX_NIX_SEARCHES = 10;
    var NIX_SEARCH_PERIOD = 500;

    // JavaScript reference to the NIX VBScript wrappers.
    // Gadgets will have but a single channel under
    // nix_channels['..'] while containers will have a channel
    // per gadget stored under the gadget's ID.
    var nix_channels = {};
    var isForceSecure = {};

    // Store the ready signal method for use on handshake complete.
    var ready;
    var numHandlerSearches = 0;

    // Search for NIX handler to parent. Tries MAX_NIX_SEARCHES times every
    // NIX_SEARCH_PERIOD milliseconds.
    function conductHandlerSearch() {
      // Call from gadget to the container.
      var handler = nix_channels['..'];
      if (handler) {
        return;
      }

      if (++numHandlerSearches > MAX_NIX_SEARCHES) {
        // Handshake failed. Will fall back.
        gadgets.warn('Nix transport setup failed, falling back...');
        ready('..', false);
        return;
      }

      // If the gadget has yet to retrieve a reference to
      // the NIX handler, try to do so now. We don't do a
      // typeof(window.opener.GetAuthToken) check here
      // because it means accessing that field on the COM object, which,
      // being an internal function reference, is not allowed.
      // "in" works because it merely checks for the prescence of
      // the key, rather than actually accessing the object's property.
      // This is just a sanity check, not a validity check.
      if (!handler && window.opener && 'GetAuthToken' in window.opener) {
        handler = window.opener;

        // Create the channel to the parent/container.
        // First verify that it knows our auth token to ensure it's not
        // an impostor.
        if (handler.GetAuthToken() == gadgets.rpc.getAuthToken('..')) {
          // Auth match - pass it back along with our wrapper to finish.
          // own wrapper and our authentication token for co-verification.
          var token = gadgets.rpc.getAuthToken('..');
          handler.CreateChannel(window[NIX_GET_WRAPPER]('..', token),
              token);
          // Set channel handler
          nix_channels['..'] = handler;
          window.opener = null;

          // Signal success and readiness to send to parent.
          // Container-to-gadget bit flipped in CreateChannel.
          ready('..', true);
          return;
        }
      }

      // Try again.
      window.setTimeout(function() { conductHandlerSearch(); },
          NIX_SEARCH_PERIOD);
    }

    // Returns current window location, without hash values
    function getLocationNoHash() {
      var loc = window.location.href;
      var idx = loc.indexOf('#');
      if (idx == -1) {
        return loc;
      }
      return loc.substring(0, idx);
    }

    // When "forcesecure" is set to true, use the relay file and a simple variant of IFPC to first
    // authenticate the container and gadget with each other.  Once that is done, then initialize
    // the NIX protocol.
    function setupSecureRelayToParent(rpctoken) {
      // To the parent, transmit the child's URL, the passed in auth
      // token, and another token generated by the child.
      var childToken = (0x7FFFFFFF * Math.random()) | 0;    // TODO expose way to have child set this value
      var data = [
        getLocationNoHash(),
        childToken
      ];
      gadgets.rpc._createRelayIframe(rpctoken, data);

      // listen for response from parent
      var hash = window.location.href.split('#')[1] || '';

      function relayTimer() {
        var newHash = window.location.href.split('#')[1] || '';
        if (newHash !== hash) {
          clearInterval(relayTimerId);
          var params = gadgets.util.getUrlParameters(window.location.href);
          if (params.childtoken == childToken) {
            // parent has been authenticated; now init NIX
            conductHandlerSearch();
            return;
          }
          // security error -- token didn't match
          ready('..', false);
        }
      }
      var relayTimerId = setInterval(relayTimer, 100);
    }

    return {
      getCode: function() {
        return 'nix';
      },

      isParentVerifiable: function(opt_receiverId) {
        // NIX is only parent verifiable if a receiver was setup with "forcesecure" set to TRUE.
        if (opt_receiverId) {
          return isForceSecure[opt_receiverId];
        }
        return false;
      },

      init: function(processFn, readyFn) {
        ready = readyFn;

        // Ensure VBScript wrapper code is in the page and that the
        // global Javascript handlers have been set.
        // VBScript methods return a type of 'unknown' when
        // checked via the typeof operator in IE. Fortunately
        // for us, this only applies to COM objects, so we
        // won't see this for a real Javascript object.
        if (typeof window[NIX_GET_WRAPPER] !== 'unknown') {
          window[NIX_HANDLE_MESSAGE] = function(data) {
            window.setTimeout(
                function() { processFn(gadgets.json.parse(data)); }, 0);
          };

          window[NIX_CREATE_CHANNEL] = function(name, channel, token) {
            // Verify the authentication token of the gadget trying
            // to create a channel for us.
            if (gadgets.rpc.getAuthToken(name) === token) {
              nix_channels[name] = channel;
              ready(name, true);
            }
          };

          // Inject the VBScript code needed.
          var vbscript =
              // We create a class to act as a wrapper for
              // a Javascript call, to prevent a break in of
              // the context.
              'Class ' + NIX_WRAPPER + '\n '

              // An internal member for keeping track of the
              // name of the document (container or gadget)
              // for which this wrapper is intended. For
              // those wrappers created by gadgets, this is not
              // used (although it is set to "..")
          + 'Private m_Intended\n'

              // Stores the auth token used to communicate with
              // the gadget. The GetChannelCreator method returns
              // an object that returns this auth token. Upon matching
              // that with its own, the gadget uses the object
              // to actually establish the communication channel.
          + 'Private m_Auth\n'

              // Method for internally setting the value
              // of the m_Intended property.
          + 'Public Sub SetIntendedName(name)\n '
          + 'If isEmpty(m_Intended) Then\n'
          + 'm_Intended = name\n'
          + 'End If\n'
          + 'End Sub\n'

              // Method for internally setting the value of the m_Auth property.
          + 'Public Sub SetAuth(auth)\n '
          + 'If isEmpty(m_Auth) Then\n'
          + 'm_Auth = auth\n'
          + 'End If\n'
          + 'End Sub\n'

              // A wrapper method which actually causes a
              // message to be sent to the other context.
          + 'Public Sub SendMessage(data)\n '
          + NIX_HANDLE_MESSAGE + '(data)\n'
          + 'End Sub\n'

              // Returns the auth token to the gadget, so it can
              // confirm a match before initiating the connection
          + 'Public Function GetAuthToken()\n '
          + 'GetAuthToken = m_Auth\n'
          + 'End Function\n'

              // Method for setting up the container->gadget
              // channel. Not strictly needed in the gadget's
              // wrapper, but no reason to get rid of it. Note here
              // that we pass the intended name to the NIX_CREATE_CHANNEL
              // method so that it can save the channel in the proper place
              // *and* verify the channel via the authentication token passed
              // here.
          + 'Public Sub CreateChannel(channel, auth)\n '
          + 'Call ' + NIX_CREATE_CHANNEL + '(m_Intended, channel, auth)\n'
          + 'End Sub\n'
          + 'End Class\n'

              // Function to get a reference to the wrapper.
          + 'Function ' + NIX_GET_WRAPPER + '(name, auth)\n'
          + 'Dim wrap\n'
          + 'Set wrap = New ' + NIX_WRAPPER + '\n'
          + 'wrap.SetIntendedName name\n'
          + 'wrap.SetAuth auth\n'
          + 'Set ' + NIX_GET_WRAPPER + ' = wrap\n'
          + 'End Function';

          try {
            window.execScript(vbscript, 'vbscript');
          } catch (e) {
            return false;
          }
        }
        return true;
      },

      setup: function(receiverId, token, forcesecure) {
        isForceSecure[receiverId] = !!forcesecure;
        if (receiverId === '..') {
          if (forcesecure) {
            setupSecureRelayToParent(token);
          } else {
            conductHandlerSearch();
          }
          return true;
        }
        try {
          var frame = document.getElementById(receiverId);
          var wrapper = window[NIX_GET_WRAPPER](receiverId, token);
          frame.contentWindow.opener = wrapper;
        } catch (e) {
          return false;
        }
        return true;
      },

      call: function(targetId, from, rpc) {
        try {
          // If we have a handler, call it.
          if (nix_channels[targetId]) {
            nix_channels[targetId].SendMessage(gadgets.json.stringify(rpc));
          }
        } catch (e) {
          return false;
        }
        return true;
      },

      // data = [child URL, child auth token]
      relayOnload: function(receiverId, data) {
        // transmit childtoken back to child to complete authentication
        var src = data[0] + '#childtoken=' + data[1];
        var childIframe = document.getElementById(receiverId);
        childIframe.src = src;
      }
    };
  }();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/*
 * For older WebKit-based browsers, the security model does not allow for any
 * known "native" hacks for conducting cross browser communication. However,
 * a variation of the IFPC (see below) can be used, entitled "RMR". RMR is
 * a technique that uses the resize event of the iframe to indicate that a
 * message was sent (instead of the much slower/performance heavy polling
 * technique used when a defined relay page is not avaliable). Simply put,
 * RMR uses the same "pass the message by the URL hash" trick that IFPC
 * uses to send a message, but instead of having an active relay page that
 * runs a piece of code when it is loaded, RMR merely changes the URL
 * of the relay page (which does not even have to exist on the domain)
 * and then notifies the other party by resizing the relay iframe. RMR
 * exploits the fact that iframes in the dom of page A can be resized
 * by page A while the onresize event will be fired in the DOM of page B,
 * thus providing a single bit channel indicating "message sent to you".
 * This method has the added benefit that the relay need not be active,
 * nor even exist: a 404 suffices just as well.
 *
 *   rmr: WebKit-specific resizing trick.
 *      - Safari 2+
 *      - Chrome 1
 */
if (!gadgets.rpctx.rmr) {  // make lib resilient to double-inclusion

  gadgets.rpctx.rmr = function() {
    // Consts for RMR, including time in ms RMR uses to poll for
    // its relay frame to be created, and the max # of polls it does.
    var RMR_SEARCH_TIMEOUT = 500;
    var RMR_MAX_POLLS = 10;

    // JavaScript references to the channel objects used by RMR.
    // Gadgets will have but a single channel under
    // rmr_channels['..'] while containers will have a channel
    // per gadget stored under the gadget's ID.
    var rmr_channels = {};

    var process;
    var ready;

    /**
   * Append an RMR relay frame to the document. This allows the receiver
   * to start receiving messages.
   *
   * @param {Node} channelFrame Relay frame to add to the DOM body.
   * @param {string} relayUri Base URI for the frame.
   * @param {string} data to pass along to the frame.
   * @param {string=} opt_frameId ID of frame for which relay is being appended (optional).
   */
    function appendRmrFrame(channelFrame, relayUri, data, opt_frameId) {
      var appendFn = function() {
        // Append the iframe.
        document.body.appendChild(channelFrame);

        // Set the src of the iframe to 'about:blank' first and then set it
        // to the relay URI. This prevents the iframe from maintaining a src
        // to the 'old' relay URI if the page is returned to from another.
        // In other words, this fixes the bfcache issue that causes the iframe's
        // src property to not be updated despite us assigning it a new value here.
        channelFrame.src = 'about:blank';
        if (opt_frameId) {
          // Process the initial sent payload (typically sent by container to
          // child/gadget) only when the relay frame has finished loading. We
          // do this to ensure that, in processRmrData(...), the ACK sent due
          // to processing can actually be sent. Before this time, the frame's
          // contentWindow is null, making it impossible to do so.
          channelFrame.onload = function() {
            processRmrData(opt_frameId);
          };
        }
        channelFrame.src = relayUri + '#' + data;
      };

      if (document.body) {
        appendFn();
      } else {
        // Common gadget case: attaching header during in-gadget handshake,
        // when we may still be in script in head. Attach onload.
        gadgets.util.registerOnLoadHandler(function() { appendFn(); });
      }
    }

    /**
   * Sets up the RMR transport frame for the given frameId. For gadgets
   * calling containers, the frameId should be '..'.
   *
   * @param {string} frameId The ID of the frame.
   */
    function setupRmr(frameId) {
      if (typeof rmr_channels[frameId] === 'object') {
        // Sanity check. Already done.
        return;
      }

      var channelFrame = document.createElement('iframe');
      var frameStyle = channelFrame.style;
      frameStyle.position = 'absolute';
      frameStyle.top = '0px';
      frameStyle.border = '0';
      frameStyle.opacity = '0';

      // The width here is important as RMR
      // makes use of the resize handler for the frame.
      // Do not modify unless you test thoroughly!
      frameStyle.width = '10px';
      frameStyle.height = '1px';
      channelFrame.id = 'rmrtransport-' + frameId;
      channelFrame.name = channelFrame.id;

      // Use the explicitly set relay, if one exists. Otherwise,
      // Construct one using the parent parameter plus robots.txt
      // as a synthetic relay. This works since browsers using RMR
      // treat 404s as legitimate for the purposes of cross domain
      // communication.
      var relayUri = gadgets.rpc.getRelayUrl(frameId);
      if (!relayUri) {
        relayUri =
            gadgets.rpc.getOrigin(gadgets.util.getUrlParameters()['parent']) +
            '/robots.txt';
      }

      rmr_channels[frameId] = {
        frame: channelFrame,
        receiveWindow: null,
        relayUri: relayUri,
        searchCounter: 0,
        width: 10,

        // Waiting means "waiting for acknowledgement to be received."
        // Acknowledgement always comes as a special ACK
        // message having been received. This message is received
        // during handshake in different ways by the container and
        // gadget, and by normal RMR message passing once the handshake
        // is complete.
        waiting: true,
        queue: [],

        // Number of non-ACK messages that have been sent to the recipient
        // and have been acknowledged.
        sendId: 0,

        // Number of messages received and processed from the sender.
        // This is the number that accompanies every ACK to tell the
        // sender to clear its queue.
        recvId: 0
      };

      if (frameId !== '..') {
        // Container always appends a relay to the gadget, before
        // the gadget appends its own relay back to container. The
        // gadget, in the meantime, refuses to attach the container
        // relay until it finds this one. Thus, the container knows
        // for certain that gadget to container communication is set
        // up by the time it finds its own relay. In addition to
        // establishing a reliable handshake protocol, this also
        // makes it possible for the gadget to send an initial batch
        // of messages to the container ASAP.
        appendRmrFrame(channelFrame, relayUri, getRmrData(frameId));
      }

      // Start searching for our own frame on the other page.
      conductRmrSearch(frameId);
    }

    /**
   * Searches for a relay frame, created by the sender referenced by
   * frameId, with which this context receives messages. Once
   * found with proper permissions, attaches a resize handler which
   * signals messages to be sent.
   *
   * @param {string} frameId Frame ID of the prospective sender.
   */
    function conductRmrSearch(frameId) {
      var channelWindow = null;

      // Increment the search counter.
      rmr_channels[frameId].searchCounter++;

      try {
        var targetWin = gadgets.rpc._getTargetWin(frameId);
        if (frameId === '..') {
          // We are a gadget.
          channelWindow = targetWin.frames['rmrtransport-' + gadgets.rpc.RPC_ID];
        } else {
          // We are a container.
          channelWindow = targetWin.frames['rmrtransport-..'];
        }
      } catch (e) {
        // Just in case; may happen when relay is set to about:blank or unset.
        // Catching exceptions here ensures that the timeout to continue the
        // search below continues to work.
      }

      var status = false;

      if (channelWindow) {
        // We have a valid reference to "our" RMR transport frame.
        // Register the proper event handlers.
        status = registerRmrChannel(frameId, channelWindow);
      }

      if (!status) {
        // Not found yet. Continue searching, but only if the counter
        // has not reached the threshold.
        if (rmr_channels[frameId].searchCounter > RMR_MAX_POLLS) {
          // If we reach this point, then RMR has failed and we
          // fall back to IFPC.
          return;
        }

        window.setTimeout(function() {
          conductRmrSearch(frameId);
        }, RMR_SEARCH_TIMEOUT);
      }
    }

    /**
   * Attempts to conduct an RPC call to the specified
   * target with the specified data via the RMR
   * method. If this method fails, the system attempts again
   * using the known default of IFPC.
   *
   * @param {string} targetId Module Id of the RPC service provider.
   * @param {string} serviceName Name of the service to call.
   * @param {string} from Module Id of the calling provider.
   * @param {Object} rpc The RPC data for this call.
   */
    function callRmr(targetId, serviceName, from, rpc) {
      var handler = null;

      if (from !== '..') {
        // Call from gadget to the container.
        handler = rmr_channels['..'];
      } else {
        // Call from container to the gadget.
        handler = rmr_channels[targetId];
      }

      if (handler) {
        // Queue the current message if not ACK.
        // ACK is always sent through getRmrData(...).
        if (serviceName !== gadgets.rpc.ACK) {
          handler.queue.push(rpc);
        }

        if (handler.waiting ||
            (handler.queue.length === 0 &&
            !(serviceName === gadgets.rpc.ACK && rpc && rpc.ackAlone === true))) {
          // If we are awaiting a response from any previously-sent messages,
          // or if we don't have anything new to send, just return.
          // Note that we don't short-return if we're ACKing just-received
          // messages.
          return true;
        }

        if (handler.queue.length > 0) {
          handler.waiting = true;
        }

        var url = handler.relayUri + '#' + getRmrData(targetId);

        try {
          // Update the URL with the message.
          handler.frame.contentWindow.location = url;

          // Resize the frame.
          var newWidth = handler.width == 10 ? 20 : 10;
          handler.frame.style.width = newWidth + 'px';
          handler.width = newWidth;

          // Done!
        } catch (e) {
          // Something about location-setting or resizing failed.
          // This should never happen, but if it does, fall back to
          // the default transport.
          return false;
        }
      }

      return true;
    }

    /**
   * Returns as a string the data to be appended to an RMR relay frame,
   * constructed from the current request queue plus an ACK message indicating
   * the currently latest-processed message ID.
   *
   * @param {string} toFrameId Frame whose sendable queued data to retrieve.
   */
    function getRmrData(toFrameId) {
      var channel = rmr_channels[toFrameId];
      var rmrData = {id: channel.sendId};
      if (channel) {
        rmrData.d = Array.prototype.slice.call(channel.queue, 0);
        rmrData.d.push({s: gadgets.rpc.ACK, id: channel.recvId});
      }
      return gadgets.json.stringify(rmrData);
    }

    /**
   * Retrieve data from the channel keyed by the given frameId,
   * processing it as a batch. All processed data is assumed to have been
   * generated by getRmrData(...), pairing that method with this.
   *
   * @param {string} fromFrameId Frame from which data is being retrieved.
   */
    function processRmrData(fromFrameId) {
      var channel = rmr_channels[fromFrameId];
      var data = channel.receiveWindow.location.hash.substring(1);

      // Decode the RPC object array.
      var rpcObj = gadgets.json.parse(decodeURIComponent(data)) || {};
      var rpcArray = rpcObj.d || [];

      var nonAckReceived = false;
      var noLongerWaiting = false;

      var numBypassed = 0;
      var numToBypass = (channel.recvId - rpcObj.id);
      for (var i = 0; i < rpcArray.length; ++i) {
        var rpc = rpcArray[i];

        // If we receive an ACK message, then mark the current
        // handler as no longer waiting and send out the next
        // queued message.
        if (rpc.s === gadgets.rpc.ACK) {
          // ACK received - whether this came from a handshake or
          // an active call, in either case it indicates readiness to
          // send messages to the from frame.
          ready(fromFrameId, true);

          if (channel.waiting) {
            noLongerWaiting = true;
          }

          channel.waiting = false;
          var newlyAcked = Math.max(0, rpc.id - channel.sendId);
          channel.queue.splice(0, newlyAcked);
          channel.sendId = Math.max(channel.sendId, rpc.id || 0);
          continue;
        }

        // If we get here, we've received > 0 non-ACK messages to
        // process. Indicate this bit for later.
        nonAckReceived = true;

        // Bypass any messages already received.
        if (++numBypassed <= numToBypass) {
          continue;
        }

        ++channel.recvId;
        process(rpc);  // actually dispatch the message
      }

      // Send an ACK indicating that we got/processed the message(s).
      // Do so if we've received a message to process or if we were waiting
      // before but a received ACK has cleared our waiting bit, and we have
      // more messages to send. Performing this operation causes additional
      // messages to be sent.
      if (nonAckReceived ||
          (noLongerWaiting && channel.queue.length > 0)) {
        var from = (fromFrameId === '..') ? gadgets.rpc.RPC_ID : '..';
        callRmr(fromFrameId, gadgets.rpc.ACK, from, {ackAlone: nonAckReceived});
      }
    }

    /**
   * Registers the RMR channel handler for the given frameId and associated
   * channel window.
   *
   * @param {string} frameId The ID of the frame for which this channel is being
   *   registered.
   * @param {Object} channelWindow The window of the receive frame for this
   *   channel, if any.
   *
   * @return {boolean} True if the frame was setup successfully, false
   *   otherwise.
   */
    function registerRmrChannel(frameId, channelWindow) {
      var channel = rmr_channels[frameId];

      // Verify that the channel is ready for receiving.
      try {
        var canAccess = false;

        // Check to see if the document is in the window. For Chrome, this
        // will return 'false' if the channelWindow is inaccessible by this
        // piece of JavaScript code, meaning that the URL of the channelWindow's
        // parent iframe has not yet changed from 'about:blank'. We do this
        // check this way because any true *access* on the channelWindow object
        // will raise a security exception, which, despite the try-catch, still
        // gets reported to the debugger (it does not break execution, the try
        // handles that problem, but it is still reported, which is bad form).
        // This check always succeeds in Safari 3.1 regardless of the state of
        // the window.
        canAccess = 'document' in channelWindow;

        if (!canAccess) {
          return false;
        }

        // Check to see if the document is an object. For Safari 3.1, this will
        // return undefined if the page is still inaccessible. Unfortunately, this
        // *will* raise a security issue in the debugger.
        // TODO Find a way around this problem.
        canAccess = typeof channelWindow['document'] == 'object';

        if (!canAccess) {
          return false;
        }

        // Once we get here, we know we can access the document (and anything else)
        // on the window object. Therefore, we check to see if the location is
        // still about:blank (this takes care of the Safari 3.2 case).
        var loc = channelWindow.location.href;

        // Check if this is about:blank for Safari.
        if (loc === 'about:blank') {
          return false;
        }
      } catch (ex) {
        // For some reason, the iframe still points to about:blank. We try
        // again in a bit.
        return false;
      }

      // Save a reference to the receive window.
      channel.receiveWindow = channelWindow;

      // Register the onresize handler.
      function onresize() {
        processRmrData(frameId);
      };

      if (typeof channelWindow.attachEvent === 'undefined') {
        channelWindow.onresize = onresize;
      } else {
        channelWindow.attachEvent('onresize', onresize);
      }

      if (frameId === '..') {
        // Gadget to container. Signal to the container that the gadget
        // is ready to receive messages by attaching the g -> c relay.
        // As a nice optimization, pass along any gadget to container
        // queued messages that have backed up since then. ACK is enqueued in
        // getRmrData to ensure that the container's waiting flag is set to false
        // (this happens in the below code run on the container side).
        appendRmrFrame(channel.frame, channel.relayUri, getRmrData(frameId), frameId);
      } else {
        // Process messages that the gadget sent in its initial relay payload.
        // We can do this immediately because the container has already appended
        // and loaded a relay frame that can be used to ACK the messages the gadget
        // sent. In the preceding if-block, however, the processRmrData(...) call
        // must wait. That's because appendRmrFrame may not actually append the
        // frame - in the context of a gadget, this code may be running in the
        // head element, so it cannot be appended to body. As a result, the
        // gadget cannot ACK the container for messages it received.
        processRmrData(frameId);
      }

      return true;
    }

    return {
      getCode: function() {
        return 'rmr';
      },

      isParentVerifiable: function() {
        return true;
      },

      init: function(processFn, readyFn) {
        // No global setup.
        process = processFn;
        ready = readyFn;
        return true;
      },

      setup: function(receiverId, token) {
        try {
          setupRmr(receiverId);
        } catch (e) {
          gadgets.warn('Caught exception setting up RMR: ' + e);
          return false;
        }
        return true;
      },

      call: function(targetId, from, rpc) {
        return callRmr(targetId, rpc.s, from, rpc);
      }
    };
  }();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

gadgets.rpctx = gadgets.rpctx || {};

/*
 * For all others, we have a fallback mechanism known as "ifpc". IFPC
 * exploits the fact that while same-origin policy prohibits a frame from
 * accessing members on a window not in the same domain, that frame can,
 * however, navigate the window heirarchy (via parent). This is exploited by
 * having a page on domain A that wants to talk to domain B create an iframe
 * on domain B pointing to a special relay file and with a message encoded
 * after the hash (#). This relay, in turn, finds the page on domain B, and
 * can call a receipt function with the message given to it. The relay URL
 * used by each caller is set via the gadgets.rpc.setRelayUrl(..) and
 * *must* be called before the call method is used.
 *
 *   ifpc: Iframe-based method, utilizing a relay page, to send a message.
 *      - No known major browsers still use this method, but it remains
 *        useful as a catch-all fallback for the time being.
 */
if (!gadgets.rpctx.ifpc) {  // make lib resilient to double-inclusion

  gadgets.rpctx.ifpc = function() {
    var iframePool = [];
    var callId = 0;
    var ready;

    /**
   * Encodes arguments for the legacy IFPC wire format.
   *
   * @param {Object} args
   * @return {string} the encoded args.
   */
    function encodeLegacyData(args) {
      var argsEscaped = [];
      for (var i = 0, j = args.length; i < j; ++i) {
        argsEscaped.push(encodeURIComponent(gadgets.json.stringify(args[i])));
      }
      return argsEscaped.join('&');
    }

    /**
   * Helper function to emit an invisible IFrame.
   * @param {string} src SRC attribute of the IFrame to emit.
   * @private
   */
    function emitInvisibleIframe(src) {
      var iframe;
      // Recycle IFrames
      for (var i = iframePool.length - 1; i >= 0; --i) {
        var ifr = iframePool[i];
        try {
          if (ifr && (ifr.recyclable || ifr.readyState === 'complete')) {
            ifr.parentNode.removeChild(ifr);
            if (window.ActiveXObject) {
              // For MSIE, delete any iframes that are no longer being used. MSIE
              // cannot reuse the IFRAME because a navigational click sound will
              // be triggered when we set the SRC attribute.
              // Other browsers scan the pool for a free iframe to reuse.
              iframePool[i] = ifr = null;
              iframePool.splice(i, 1);
            } else {
              ifr.recyclable = false;
              iframe = ifr;
              break;
            }
          }
        } catch (e) {
          // Ignore; IE7 throws an exception when trying to read readyState and
          // readyState isn't set.
        }
      }
      // Create IFrame if necessary
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.style.border = iframe.style.width = iframe.style.height = '0px';
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        iframe.onload = function() { this.recyclable = true; };
        iframePool.push(iframe);
      }
      iframe.src = src;
      window.setTimeout(function() { document.body.appendChild(iframe); }, 0);
    }

    return {
      getCode: function() {
        return 'ifpc';
      },

      isParentVerifiable: function() {
        return true;
      },

      init: function(processFn, readyFn) {
        // No global setup.
        ready = readyFn;
        ready('..', true);  // Ready immediately.
        return true;
      },

      setup: function(receiverId, token) {
        // Indicate readiness to send to receiver.
        ready(receiverId, true);
        return true;
      },

      call: function(targetId, from, rpc) {
        // Retrieve the relay file used by IFPC. Note that
        // this must be set before the call, and so we conduct
        // an extra check to ensure it is not blank.
        var relay = gadgets.rpc.getRelayUrl(targetId);
        ++callId;

        if (!relay) {
          gadgets.warn('No relay file assigned for IFPC');
          return false;
        }

        // The RPC mechanism supports two formats for IFPC (legacy and current).
        var src = null;
        if (rpc.l) {
          // Use legacy protocol.
          // Format: #iframe_id&callId&num_packets&packet_num&block_of_data
          var callArgs = rpc.a;
          src = [relay, '#', encodeLegacyData([from, callId, 1, 0,
            encodeLegacyData([from, rpc.s, '', '', from].concat(
                callArgs))])].join('');
        } else {
          // Format: #targetId & sourceId@callId & packetNum & packetId & packetData
          src = [relay, '#', targetId, '&', from, '@', callId,
            '&1&0&', encodeURIComponent(gadgets.json.stringify(rpc))].join('');
        }

        // Conduct the IFPC call by creating the Iframe with
        // the relay URL and appended message.
        emitInvisibleIframe(src);
        return true;
      }
    };
  }();

} // !end of double inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Remote procedure call library for gadget-to-container,
 * container-to-gadget, and gadget-to-gadget (thru container) communication.
 */

/**
 * gadgets.rpc Transports
 *
 * All transports are stored in object gadgets.rpctx, and are provided
 * to the core gadgets.rpc library by various build rules.
 *
 * Transports used by core gadgets.rpc code to actually pass messages.
 * each transport implements the same interface exposing hooks that
 * the core library calls at strategic points to set up and use
 * the transport.
 *
 * The methods each transport must implement are:
 * + getCode(): returns a string identifying the transport. For debugging.
 * + isParentVerifiable(): indicates (via boolean) whether the method
 *     has the property that its relay URL verifies for certain the
 *     receiver's protocol://host:port.
 * + init(processFn, readyFn): Performs any global initialization needed. Called
 *     before any other gadgets.rpc methods are invoked. processFn is
 *     the function in gadgets.rpc used to process an rpc packet. readyFn is
 *     a function that must be called when the transport is ready to send
 *     and receive messages bidirectionally. Returns
 *     true if successful, false otherwise.
 * + setup(receiverId, token): Performs per-receiver initialization, if any.
 *     receiverId will be '..' for gadget-to-container. Returns true if
 *     successful, false otherwise.
 * + call(targetId, from, rpc): Invoked to send an actual
 *     message to the given targetId, with the given serviceName, from
 *     the sender identified by 'from'. Payload is an rpc packet. Returns
 *     true if successful, false otherwise.
 */

if (!gadgets.rpc) { // make lib resilient to double-inclusion

  /**
 * @static
 * @namespace Provides operations for making rpc calls.
 * @name gadgets.rpc
 */

  gadgets.rpc = function() {
    /**
   * @const
   * @private
   */
    var CALLBACK_NAME = '__cb';

    /**
   * @const
   * @private
   */
    var DEFAULT_NAME = '';

    /** Exported constant, for use by transports only.
   * @const
   * @type {string}
   * @member gadgets.rpc
   */
    var ACK = '__ack';

    /**
   * Timeout and number of attempts made to setup a transport receiver.
   * @const
   * @private
   */
    var SETUP_FRAME_TIMEOUT = 500;

    /**
   * @const
   * @private
   */
    var SETUP_FRAME_MAX_TRIES = 10;

    var services = {};
    var relayUrl = {};
    var useLegacyProtocol = {};
    var authToken = {};
    var callId = 0;
    var callbacks = {};
    var setup = {};
    var sameDomain = {};
    var params = {};
    var receiverTx = {};
    var earlyRpcQueue = {};

    // isGadget =~ isChild for the purposes of rpc (used only in setup).
    var isChild = (window.top !== window.self);

    // Set the current rpc ID from window.name immediately, to prevent
    // shadowing of window.name by a "var name" declaration, or similar.
    var rpcId = window.name;

    var securityCallback = function() {};
    var LOAD_TIMEOUT = 0;
    var FRAME_PHISH = 1;
    var FORGED_MSG = 2;

    // Fallback transport is simply a dummy impl that emits no errors
    // and logs info on calls it receives, to avoid undesired side-effects
    // from falling back to IFPC or some other transport.
    var fallbackTransport = (function() {
      function logFn(name) {
        return function() {
          gadgets.log('gadgets.rpc.' + name + '(' +
              gadgets.json.stringify(Array.prototype.slice.call(arguments)) +
              '): call ignored. [caller: ' + document.location +
              ', isChild: ' + isChild + ']');
        };
      }
      return {
        getCode: function() {
          return 'noop';
        },
        isParentVerifiable: function() {
          return true;  // Not really, but prevents transport assignment to IFPC.
        },
        init: logFn('init'),
        setup: logFn('setup'),
        call: logFn('call')
      };
    })();

    // Load the authentication token for speaking to the container
    // from the gadget's parameters, or default to '0' if not found.
    if (gadgets.util) {
      params = gadgets.util.getUrlParameters();
    }

    /**
   * Return a transport representing the best available cross-domain
   * message-passing mechanism available to the browser.
   *
   * <p>Transports are selected on a cascading basis determined by browser
   * capability and other checks. The order of preference is:
   * <ol>
   * <li> wpm: Uses window.postMessage standard.
   * <li> dpm: Uses document.postMessage, similar to wpm but pre-standard.
   * <li> nix: Uses IE-specific browser hacks.
   * <li> rmr: Signals message passing using relay file's onresize handler.
   * <li> fe: Uses FF2-specific window.frameElement hack.
   * <li> ifpc: Sends messages via active load of a relay file.
   * </ol>
   * <p>See each transport's commentary/documentation for details.
   * @return {Object}
   * @member gadgets.rpc
   */
    function getTransport() {
      return typeof window.postMessage === 'function' ? gadgets.rpctx.wpm :
          typeof window.postMessage === 'object' ? gadgets.rpctx.wpm :
          window.ActiveXObject ? gadgets.rpctx.nix :
          navigator.userAgent.indexOf('WebKit') > 0 ? gadgets.rpctx.rmr :
          navigator.product === 'Gecko' ? gadgets.rpctx.frameElement :
          gadgets.rpctx.ifpc;
    }

    /**
   * Function passed to, and called by, a transport indicating it's ready to
   * send and receive messages.
   */
    function transportReady(receiverId, readySuccess) {
      var tx = transport;
      if (!readySuccess) {
        tx = fallbackTransport;
      }
      receiverTx[receiverId] = tx;

      // If there are any early-queued messages, send them now directly through
      // the needed transport.
      var earlyQueue = earlyRpcQueue[receiverId] || [];
      for (var i = 0; i < earlyQueue.length; ++i) {
        var rpc = earlyQueue[i];
        // There was no auth/rpc token set before, so set it now.
        rpc.t = getAuthToken(receiverId);
        tx.call(receiverId, rpc.f, rpc);
      }

      // Clear the queue so it won't be sent again.
      earlyRpcQueue[receiverId] = [];
    }

    //  Track when this main page is closed or navigated to a different location
    // ("unload" event).
    //  NOTE: The use of the "unload" handler here and for the relay iframe
    // prevents the use of the in-memory page cache in modern browsers.
    // See: https://developer.mozilla.org/en/using_firefox_1.5_caching
    // See: http://webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/
    var mainPageUnloading = false,
        hookedUnload = false;

    function hookMainPageUnload() {
      if (hookedUnload) {
        return;
      }
      function onunload() {
        mainPageUnloading = true;
      }
      gadgets.util.attachBrowserEvent(window, 'unload', onunload, false);
      hookedUnload = true;
    }

    function relayOnload(targetId, sourceId, token, data, relayWindow) {
      // Validate auth token.
      if (!authToken[sourceId] || authToken[sourceId] !== token) {
        gadgets.error('Invalid auth token. ' + authToken[sourceId] + ' vs ' + token);
        securityCallback(sourceId, FORGED_MSG);
      }

      relayWindow.onunload = function() {
        if (setup[sourceId] && !mainPageUnloading) {
          securityCallback(sourceId, FRAME_PHISH);
          gadgets.rpc.removeReceiver(sourceId);
        }
      };
      hookMainPageUnload();

      data = gadgets.json.parse(decodeURIComponent(data));
      transport.relayOnload(sourceId, data);
    }

    /**
   * Helper function to process an RPC request
   * @param {Object} rpc RPC request object.
   * @private
   */
    function process(rpc) {
      //
      // RPC object contents:
      //   s: Service Name
      //   f: From
      //   c: The callback ID or 0 if none.
      //   a: The arguments for this RPC call.
      //   t: The authentication token.
      //
      if (rpc && typeof rpc.s === 'string' && typeof rpc.f === 'string' &&
          rpc.a instanceof Array) {

        // Validate auth token.
        if (authToken[rpc.f]) {
          // We don't do type coercion here because all entries in the authToken
          // object are strings, as are all url params. See setupReceiver(...).
          if (authToken[rpc.f] !== rpc.t) {
            gadgets.error('Invalid auth token. ' + authToken[rpc.f] + ' vs ' + rpc.t);
            securityCallback(rpc.f, FORGED_MSG);
          }
        }

        if (rpc.s === ACK) {
          // Acknowledgement API, used to indicate a receiver is ready.
          window.setTimeout(function() { transportReady(rpc.f, true); }, 0);
          return;
        }

        // If there is a callback for this service, attach a callback function
        // to the rpc context object for asynchronous rpc services.
        //
        // Synchronous rpc request handlers should simply ignore it and return a
        // value as usual.
        // Asynchronous rpc request handlers, on the other hand, should pass its
        // result to this callback function and not return a value on exit.
        //
        // For example, the following rpc handler passes the first parameter back
        // to its rpc client with a one-second delay.
        //
        // function asyncRpcHandler(param) {
        //   var me = this;
        //   setTimeout(function() {
        //     me.callback(param);
        //   }, 1000);
        // }
        if (rpc.c) {
          rpc.callback = function(result) {
            gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
          };
        }

        // Call the requested RPC service.
        var result = (services[rpc.s] ||
            services[DEFAULT_NAME]).apply(rpc, rpc.a);

        // If the rpc request handler returns a value, immediately pass it back
        // to the callback. Otherwise, do nothing, assuming that the rpc handler
        // will make an asynchronous call later.
        if (rpc.c && typeof result !== 'undefined') {
          gadgets.rpc.call(rpc.f, CALLBACK_NAME, null, rpc.c, result);
        }
      }
    }

    /**
   * Helper method returning a canonicalized protocol://host[:port] for
   * a given input URL, provided as a string. Used to compute convenient
   * relay URLs and to determine whether a call is coming from the same
   * domain as its receiver (bypassing the try/catch capability detection
   * flow, thereby obviating Firebug and other tools reporting an exception).
   *
   * @param {string} url Base URL to canonicalize.
   * @memberOf gadgets.rpc
   */

    function getOrigin(url) {
      if (!url) {
        return '';
      }
      url = url.toLowerCase();
      if (url.indexOf('//') == 0) {
        url = window.location.protocol + url;
      }
      if (url.indexOf('://') == -1) {
        // Assumed to be schemaless. Default to current protocol.
        url = window.location.protocol + '//' + url;
      }
      // At this point we guarantee that "://" is in the URL and defines
      // current protocol. Skip past this to search for host:port.
      var host = url.substring(url.indexOf('://') + 3);

      // Find the first slash char, delimiting the host:port.
      var slashPos = host.indexOf('/');
      if (slashPos != -1) {
        host = host.substring(0, slashPos);
      }

      var protocol = url.substring(0, url.indexOf('://'));

      // Use port only if it's not default for the protocol.
      var portStr = '';
      var portPos = host.indexOf(':');
      if (portPos != -1) {
        var port = host.substring(portPos + 1);
        host = host.substring(0, portPos);
        if ((protocol === 'http' && port !== '80') ||
            (protocol === 'https' && port !== '443')) {
          portStr = ':' + port;
        }
      }

      // Return <protocol>://<host>[<port>]
      return protocol + '://' + host + portStr;
    }

    function getTargetWin(id) {
      if (typeof id === 'undefined' ||
          id === '..') {
        return window.parent;
      }

      // Cast to a String to avoid an index lookup.
      id = String(id);

      // Try window.frames first
      var target = window.frames[id];
      if (target) {
        return target;
      }

      // Fall back to getElementById()
      target = document.getElementById(id);
      if (target && target.contentWindow) {
        return target.contentWindow;
      }

      return null;
    }

    // Pick the most efficient RPC relay mechanism.
    var transport = getTransport();

    // Create the Default RPC handler.
    services[DEFAULT_NAME] = function() {
      gadgets.warn('Unknown RPC service: ' + this.s);
    };

    // Create a Special RPC handler for callbacks.
    services[CALLBACK_NAME] = function(callbackId, result) {
      var callback = callbacks[callbackId];
      if (callback) {
        delete callbacks[callbackId];
        callback(result);
      }
    };

    /**
   * Conducts any frame-specific work necessary to setup
   * the channel type chosen. This method is called when
   * the container page first registers the gadget in the
   * RPC mechanism. Gadgets, in turn, will complete the setup
   * of the channel once they send their first messages.
   */
    function setupFrame(frameId, token, forcesecure) {
      if (setup[frameId] === true) {
        return;
      }

      if (typeof setup[frameId] === 'undefined') {
        setup[frameId] = 0;
      }

      var tgtFrame = document.getElementById(frameId);
      if (frameId === '..' || tgtFrame != null) {
        if (transport.setup(frameId, token, forcesecure) === true) {
          setup[frameId] = true;
          return;
        }
      }

      if (setup[frameId] !== true && setup[frameId]++ < SETUP_FRAME_MAX_TRIES) {
        // Try again in a bit, assuming that frame will soon exist.
        window.setTimeout(function() { setupFrame(frameId, token, forcesecure); },
                        SETUP_FRAME_TIMEOUT);
      } else {
        // Fail: fall back for this gadget.
        receiverTx[frameId] = fallbackTransport;
        setup[frameId] = true;
      }
    }

    /**
   * Attempts to make an rpc by calling the target's receive method directly.
   * This works when gadgets are rendered on the same domain as their container,
   * a potentially useful optimization for trusted content which keeps
   * RPC behind a consistent interface.
   *
   * @param {string} target Module id of the rpc service provider.
   * @param {Object} rpc RPC data.
   * @return {boolean}
   */
    function callSameDomain(target, rpc) {
      if (typeof sameDomain[target] === 'undefined') {
        // Seed with a negative, typed value to avoid
        // hitting this code path repeatedly.
        sameDomain[target] = false;
        var targetRelay = gadgets.rpc.getRelayUrl(target);
        if (getOrigin(targetRelay) !== getOrigin(window.location.href)) {
          // Not worth trying -- avoid the error and just return.
          return false;
        }

        var targetEl = getTargetWin(target);
        try {
          // If this succeeds, then same-domain policy applied
          sameDomain[target] = targetEl.gadgets.rpc.receiveSameDomain;
        } catch (e) {
          // Shouldn't happen due to origin check. Caught to emit
          // more meaningful error to the caller.
          gadgets.error('Same domain call failed: parent= incorrectly set.');
        }
      }

      if (typeof sameDomain[target] === 'function') {
        // Call target's receive method
        sameDomain[target](rpc);
        return true;
      }

      return false;
    }

    /**
   * Sets the relay URL of a target frame.
   * @param {string} targetId Name of the target frame.
   * @param {string} url Full relay URL of the target frame.
   * @param {boolean=} opt_useLegacy True if this relay needs the legacy IFPC
   *     wire format.
   *
   * @member gadgets.rpc
   * @deprecated
   */
    function setRelayUrl(targetId, url, opt_useLegacy) {
      // make URL absolute if necessary
      if (!/http(s)?:\/\/.+/.test(url)) {
        if (url.indexOf('//') == 0) {
          url = window.location.protocol + url;
        } else if (url.charAt(0) == '/') {
          url = window.location.protocol + '//' + window.location.host + url;
        } else if (url.indexOf('://') == -1) {
          // Assumed to be schemaless. Default to current protocol.
          url = window.location.protocol + '//' + url;
        }
      }
      relayUrl[targetId] = url;
      useLegacyProtocol[targetId] = !!opt_useLegacy;
    }

    /**
   * Helper method to retrieve the authToken for a given gadget.
   * Not to be used directly.
   * @member gadgets.rpc
   * @return {string}
   */
    function getAuthToken(targetId) {
      return authToken[targetId];
    }

    /**
   * Sets the auth token of a target frame.
   * @param {string} targetId Name of the target frame.
   * @param {string} token The authentication token to use for all
   *     calls to or from this target id.
   *
   * @member gadgets.rpc
   * @deprecated
   */
    function setAuthToken(targetId, token, forcesecure) {
      token = token || '';

      // Coerce token to a String, ensuring that all authToken values
      // are strings. This ensures correct comparison with URL params
      // in the process(rpc) method.
      authToken[targetId] = String(token);

      setupFrame(targetId, token, forcesecure);
    }

    function setupContainerGadgetContext(rpctoken, opt_forcesecure) {
      /**
     * Initializes gadget to container RPC params from the provided configuration.
     */
      function init(config) {
        var configRpc = config ? config.rpc : {};
        var parentRelayUrl = configRpc.parentRelayUrl;

        // Allow for wild card parent relay files as long as it's from a
        // white listed domain. This is enforced by the rendering servlet.
        if (parentRelayUrl.substring(0, 7) !== 'http://' &&
            parentRelayUrl.substring(0, 8) !== 'https://' &&
            parentRelayUrl.substring(0, 2) !== '//') {
          // Relative path: we append to the parent.
          // We're relying on the server validating the parent parameter in this
          // case. Because of this, parent may only be passed in the query, not fragment.
          if (typeof params.parent === 'string' && params.parent !== '') {
            // Otherwise, relayUrl['..'] will be null, signaling transport
            // code to ignore rpc calls since they cannot work without a
            // relay URL with host qualification.
            if (parentRelayUrl.substring(0, 1) !== '/') {
              // Path-relative. Trust that parent is passed in appropriately.
              var lastSlash = params.parent.lastIndexOf('/');
              parentRelayUrl = params.parent.substring(0, lastSlash + 1) + parentRelayUrl;
            } else {
              // Host-relative.
              parentRelayUrl = getOrigin(params.parent) + parentRelayUrl;
            }
          }
        }

        var useLegacy = !!configRpc.useLegacyProtocol;
        setRelayUrl('..', parentRelayUrl, useLegacy);

        if (useLegacy) {
          transport = gadgets.rpctx.ifpc;
          transport.init(process, transportReady);
        }

        // Sets the auth token and signals transport to setup connection to container.
        var forceSecure = opt_forcesecure || params.forcesecure || false;
        setAuthToken('..', rpctoken, forceSecure);
      }

      var requiredConfig = {
        parentRelayUrl: gadgets.config.NonEmptyStringValidator
      };
      gadgets.config.register('rpc', requiredConfig, init);
    }

    function setupContainerGenericIframe(rpctoken, opt_parent, opt_forcesecure) {
      // Generic child IFRAME setting up connection w/ its container.
      // Use the opt_parent param if provided, or the "parent" query param
      // if found -- otherwise, do nothing since this call might be initiated
      // automatically at first, then actively later in IFRAME code.
      var forcesecure = opt_forcesecure || params.forcesecure || false;
      var parent = opt_parent || params.parent;
      if (parent) {
        setRelayUrl('..', parent);
        setAuthToken('..', rpctoken, forcesecure);
      }
    }

    function setupChildIframe(gadgetId, opt_frameurl, opt_authtoken, opt_forcesecure) {
      if (!gadgets.util) {
        return;
      }
      var childIframe = document.getElementById(gadgetId);
      if (!childIframe) {
        throw new Error('Cannot set up gadgets.rpc receiver with ID: ' + gadgetId +
            ', element not found.');
      }

      // The "relay URL" can either be explicitly specified or is set as
      // the child IFRAME URL verbatim.
      var relayUrl = opt_frameurl || childIframe.src;
      setRelayUrl(gadgetId, relayUrl);

      // The auth token is parsed from child params (rpctoken) or overridden.
      var childParams = gadgets.util.getUrlParameters(childIframe.src);
      var rpctoken = opt_authtoken || childParams.rpctoken;
      var forcesecure = opt_forcesecure || childParams.forcesecure;
      setAuthToken(gadgetId, rpctoken, forcesecure);
    }

    /**
   * Sets up the gadgets.rpc library to communicate with the receiver.
   * <p>This method replaces setRelayUrl(...) and setAuthToken(...)
   *
   * <p>Simplified instructions - highly recommended:
   * <ol>
   * <li> Generate &lt;iframe id="&lt;ID&gt;" src="...#parent=&lt;PARENTURL&gt;&rpctoken=&lt;RANDOM&gt;"/&gt;
   *      and add to DOM.
   * <li> Call gadgets.rpc.setupReceiver("&lt;ID>");
   *      <p>All parent/child communication initializes automatically from here.
   *         Naturally, both sides need to include the library.
   * </ol>
   *
   * <p>Detailed container/parent instructions:
   * <ol>
   * <li> Create the target IFRAME (eg. gadget) with a given &lt;ID> and params
   *    rpctoken=<token> (eg. #rpctoken=1234), which is a random/unguessbable
   *    string, and parent=&lt;url>, where &lt;url> is the URL of the container.
   * <li> Append IFRAME to the document.
   * <li> Call gadgets.rpc.setupReceiver(&lt;ID>)
   * <p>[Optional]. Strictly speaking, you may omit rpctoken and parent. This
   *             practice earns little but is occasionally useful for testing.
   *             If you omit parent, you MUST pass your container URL as the 2nd
   *             parameter to this method.
   * </ol>
   *
   * <p>Detailed gadget/child IFRAME instructions:
   * <ol>
   * <li> If your container/parent passed parent and rpctoken params (query string
   *    or fragment are both OK), you needn't do anything. The library will self-
   *    initialize.
   * <li> If "parent" is omitted, you MUST call this method with targetId '..'
   *    and the second param set to the parent URL.
   * <li> If "rpctoken" is omitted, but the container set an authToken manually
   *    for this frame, you MUST pass that ID (however acquired) as the 2nd param
   *    to this method.
   * </ol>
   *
   * @member gadgets.rpc
   * @param {string} targetId
   * @param {string=} opt_receiverurl
   * @param {string=} opt_authtoken
   * @param {boolean=} opt_forcesecure
   */
    function setupReceiver(targetId, opt_receiverurl, opt_authtoken, opt_forcesecure) {
      if (targetId === '..') {
        // Gadget/IFRAME to container.
        var rpctoken = opt_authtoken || params.rpctoken || params.ifpctok || '';
        if (window['__isgadget'] === true) {
          setupContainerGadgetContext(rpctoken, opt_forcesecure);
        } else {
          setupContainerGenericIframe(rpctoken, opt_receiverurl, opt_forcesecure);
        }
      } else {
        // Container to child.
        setupChildIframe(targetId, opt_receiverurl, opt_authtoken, opt_forcesecure);
      }
    }

    return /** @scope gadgets.rpc */ {
      config: function(config) {
        if (typeof config.securityCallback === 'function') {
          securityCallback = config.securityCallback;
        }
      },

      /**
     * Registers an RPC service.
     * @param {string} serviceName Service name to register.
     * @param {function(Object,Object)} handler Service handler.
     *
     * @member gadgets.rpc
     */
      register: function(serviceName, handler) {
        if (serviceName === CALLBACK_NAME || serviceName === ACK) {
          throw new Error('Cannot overwrite callback/ack service');
        }

        if (serviceName === DEFAULT_NAME) {
          throw new Error('Cannot overwrite default service:'
                        + ' use registerDefault');
        }

        services[serviceName] = handler;
      },

      /**
     * Unregisters an RPC service.
     * @param {string} serviceName Service name to unregister.
     *
     * @member gadgets.rpc
     */
      unregister: function(serviceName) {
        if (serviceName === CALLBACK_NAME || serviceName === ACK) {
          throw new Error('Cannot delete callback/ack service');
        }

        if (serviceName === DEFAULT_NAME) {
          throw new Error('Cannot delete default service:'
                        + ' use unregisterDefault');
        }

        delete services[serviceName];
      },

      /**
     * Registers a default service handler to processes all unknown
     * RPC calls which raise an exception by default.
     * @param {function(Object,Object)} handler Service handler.
     *
     * @member gadgets.rpc
     */
      registerDefault: function(handler) {
        services[DEFAULT_NAME] = handler;
      },

      /**
     * Unregisters the default service handler. Future unknown RPC
     * calls will fail silently.
     *
     * @member gadgets.rpc
     */
      unregisterDefault: function() {
        delete services[DEFAULT_NAME];
      },

      /**
     * Forces all subsequent calls to be made by a transport
     * method that allows the caller to verify the message receiver
     * (by way of the parent parameter, through getRelayUrl(...)).
     * At present this means IFPC or WPM.
     * @member gadgets.rpc
     */
      forceParentVerifiable: function() {
        if (!transport.isParentVerifiable()) {
          transport = gadgets.rpctx.ifpc;
        }
      },

      /**
     * Calls an RPC service.
     * @param {string} targetId Module Id of the RPC service provider.
     *                          Empty if calling the parent container.
     * @param {string} serviceName Service name to call.
     * @param {function()|null} callback Callback function (if any) to process
     *                                 the return value of the RPC request.
     * @param {*} var_args Parameters for the RPC request.
     *
     * @member gadgets.rpc
     */
      call: function(targetId, serviceName, callback, var_args) {
        targetId = targetId || '..';
        // Default to the container calling.
        var from = '..';

        if (targetId === '..') {
          from = rpcId;
        }

        ++callId;
        if (callback) {
          callbacks[callId] = callback;
        }

        var rpc = {
          s: serviceName,
          f: from,
          c: callback ? callId : 0,
          a: Array.prototype.slice.call(arguments, 3),
          t: authToken[targetId],
          l: useLegacyProtocol[targetId]
        };

        if (targetId !== '..' && !document.getElementById(targetId)) {
          // The target has been removed from the DOM. Don't even try.
          gadgets.log('WARNING: attempted send to nonexistent frame: ' + targetId);
          return;
        }

        // If target is on the same domain, call method directly
        if (callSameDomain(targetId, rpc)) {
          return;
        }

        // Attempt to make call via a cross-domain transport.
        // Retrieve the transport for the given target - if one
        // target is misconfigured, it won't affect the others.
        var channel = receiverTx[targetId];

        if (!channel) {
          // Not set up yet. Enqueue the rpc for such time as it is.
          if (!earlyRpcQueue[targetId]) {
            earlyRpcQueue[targetId] = [rpc];
          } else {
            earlyRpcQueue[targetId].push(rpc);
          }
          return;
        }

        // If we are told to use the legacy format, then we must
        // default to IFPC.
        if (useLegacyProtocol[targetId]) {
          channel = gadgets.rpctx.ifpc;
        }

        if (channel.call(targetId, from, rpc) === false) {
          // Fall back to IFPC. This behavior may be removed as IFPC is as well.
          receiverTx[targetId] = fallbackTransport;
          transport.call(targetId, from, rpc);
        }
      },

      /**
     * Gets the relay URL of a target frame.
     * @param {string} targetId Name of the target frame.
     * @return {string|undefined} Relay URL of the target frame.
     *
     * @member gadgets.rpc
     */
      getRelayUrl: function(targetId) {
        var url = relayUrl[targetId];
        // Some RPC methods (wpm, for one) are unhappy with schemeless URLs.
        if (url && url.substring(0, 1) === '/') {
          if (url.substring(1, 2) === '/') {    // starts with '//'
            url = document.location.protocol + url;
          } else {    // relative URL, starts with '/'
            url = document.location.protocol + '//' + document.location.host + url;
          }
        }

        return url;
      },

      setRelayUrl: setRelayUrl,
      setAuthToken: setAuthToken,
      setupReceiver: setupReceiver,
      getAuthToken: getAuthToken,

      // Note: Does not delete iframe
      removeReceiver: function(receiverId) {
        delete relayUrl[receiverId];
        delete useLegacyProtocol[receiverId];
        delete authToken[receiverId];
        delete setup[receiverId];
        delete sameDomain[receiverId];
        delete receiverTx[receiverId];
      },

      /**
     * Gets the RPC relay mechanism.
     * @return {string} RPC relay mechanism. See above for
     *   a list of supported types.
     *
     * @member gadgets.rpc
     */
      getRelayChannel: function() {
        return transport.getCode();
      },

      /**
     * Receives and processes an RPC request. (Not to be used directly.)
     * Only used by IFPC.
     * @param {Array.<string>} fragment An RPC request fragment encoded as
     *        an array. The first 4 elements are target id, source id & call id,
     *        total packet number, packet id. The last element stores the actual
     *        JSON-encoded and URI escaped packet data.
     *
     * @member gadgets.rpc
     * @deprecated
     */
      receive: function(fragment, otherWindow) {
        if (fragment.length > 4) {
          process(gadgets.json.parse(
              decodeURIComponent(fragment[fragment.length - 1])));
        } else {
          relayOnload.apply(null, fragment.concat(otherWindow));
        }
      },

      /**
     * Receives and processes an RPC request sent via the same domain.
     * (Not to be used directly). Converts the inbound rpc object's
     * Array into a local Array to pass the process() Array test.
     * @param {Object} rpc RPC object containing all request params.
     * @member gadgets.rpc
     */
      receiveSameDomain: function(rpc) {
        // Pass through to local process method but converting to a local Array
        rpc.a = Array.prototype.slice.call(rpc.a);
        window.setTimeout(function() { process(rpc); }, 0);
      },

      // Helper method to get the protocol://host:port of an input URL.
      // see docs above
      getOrigin: getOrigin,

      getReceiverOrigin: function(receiverId) {
        var channel = receiverTx[receiverId];
        if (!channel) {
          // not set up yet
          return null;
        }
        if (!channel.isParentVerifiable(receiverId)) {
          // given transport cannot verify receiver origin
          return null;
        }
        var origRelay = gadgets.rpc.getRelayUrl(receiverId) ||
            gadgets.util.getUrlParameters().parent;
        return gadgets.rpc.getOrigin(origRelay);
      },

      /**
     * Internal-only method used to initialize gadgets.rpc.
     * @member gadgets.rpc
     */
      init: function() {
        // Conduct any global setup necessary for the chosen transport.
        // Do so after gadgets.rpc definition to allow transport to access
        // gadgets.rpc methods.
        if (transport.init(process, transportReady) === false) {
          transport = fallbackTransport;
        }
        if (isChild) {
          setupReceiver('..');
        }
      },

      /** Returns the window keyed by the ID. null/".." for parent, else child */
      _getTargetWin: getTargetWin,

      /** Create an iframe for loading the relay URL. Used by child only. */
      _createRelayIframe: function(token, data) {
        var relay = gadgets.rpc.getRelayUrl('..');
        if (!relay) {
          return null;
        }

        // Format: #targetId & sourceId & authToken & data
        var src = relay + '#..&' + rpcId + '&' + token + '&' +
            encodeURIComponent(gadgets.json.stringify(data));

        var iframe = document.createElement('iframe');
        iframe.style.border = iframe.style.width = iframe.style.height = '0px';
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';

        function appendFn() {
          // Append the iframe.
          document.body.appendChild(iframe);

          // Set the src of the iframe to 'about:blank' first and then set it
          // to the relay URI. This prevents the iframe from maintaining a src
          // to the 'old' relay URI if the page is returned to from another.
          // In other words, this fixes the bfcache issue that causes the iframe's
          // src property to not be updated despite us assigning it a new value here.
          iframe.src = 'javascript:"<html></html>"';
          iframe.src = src;
        }

        if (document.body) {
          appendFn();
        } else {
          gadgets.util.registerOnLoadHandler(function() { appendFn(); });
        }

        return iframe;
      },

      ACK: ACK,

      RPC_ID: rpcId,

      SEC_ERROR_LOAD_TIMEOUT: LOAD_TIMEOUT,
      SEC_ERROR_FRAME_PHISH: FRAME_PHISH,
      SEC_ERROR_FORGED_MSG: FORGED_MSG
    };
  }();

  // Initialize library/transport.
  gadgets.rpc.init();

} // !end of double-inclusion guard
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global gadgets, shindig */

/**
 * @fileoverview Allows the container to refresh the gadget security token.
 */
gadgets.rpc.register('update_security_token', function(token) {
  shindig.auth.updateSecurityToken(token);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

(function() {
  /**
   * Called by the transports for each service method that they expose
   * @param {string} method  The method to expose e.g. "people.get".
   * @param {Object.<string,Object>} transport The transport used to execute a call for the method.
   */
  osapi._registerMethod = function(method, transport) {
    var has___ = typeof ___ !== 'undefined';

    // Skip registration of local newBatch implementation.
    if (method == 'newBatch') {
      return;
    }

    // Lookup last method value.
    var parts = method.split('.');
    var last = osapi;
    for (var i = 0; i < parts.length - 1; i++) {
      last[parts[i]] = last[parts[i]] || {};
      last = last[parts[i]];
    }

    // Use the batch as the actual executor of calls.
    var apiMethod = function(rpc) {
      var batch = osapi.newBatch();
      var boundCall = {};
      boundCall.execute = function(callback) {
        var feralCallback = has___ ? ___.untame(callback) : callback;
        var that = has___ ? ___.USELESS : this;
        batch.add(method, this);
        batch.execute(function(batchResult) {
          if (batchResult.error) {
            feralCallback.call(that, batchResult.error);
          } else {
            feralCallback.call(that, batchResult[method]);
          }
        });
      }
      if (has___) {
        ___.markInnocent(boundCall.execute, 'execute');
      }
      // TODO: This shouldnt really be necessary. The spec should be clear enough about
      // defaults that we dont have to populate this.
      rpc = rpc || {};
      rpc.userId = rpc.userId || '@viewer';
      rpc.groupId = rpc.groupId || '@self';

      // Decorate the execute method with the information necessary for batching
      boundCall.method = method;
      boundCall.transport = transport;
      boundCall.rpc = rpc;

      return boundCall;
    };
    if (has___ && typeof ___.markInnocent !== 'undefined') {
      ___.markInnocent(apiMethod, method);
    }

    if (last[parts[parts.length - 1]]) {
      gadgets.warn('Skipping duplicate osapi method definition ' + method + ' on transport ' + transport.name);
    } else {
      last[parts[parts.length - 1]] = apiMethod;
    }
  };
})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

(function() {

  /**
   * It is common to batch requests together to make them more efficient.
   *
   * Note: the container config specified endpoints at which services are to be found.
   * When creating a batch, the calls are split out into separate requests based on the
   * transport, as it may get sent to a different server on the backend.
   */
  var newBatch = function() {
    var that = {};

    // An array of requests where each request is
    // { key : <key>
    //   request : {
    //     method : <service-method>
    //     rpc  : <request params>
    //     transport : <rpc dispatcher>
    //  }
    // }

    /** @type {Array.<Object>} */
    var keyedRequests = [];

    /**
     * Create a new request in the batch
     * @param {string} key id for the request.
     * @param {Object} request the opensocial request object which is of the form
     * { method : <service-method>
     *   rpc  : <request>
     *   transport : <rpc dispatcher>
     * }.
     */
    var add = function(key, request) {
      if (request && key) {
        keyedRequests.push({'key' : key, 'request' : request});
      }
      return that;
    };

    /**
     * Convert our internal request format into a JSON-RPC
     * @param {Object} request
     */
    var toJsonRpc = function(request) {
      var jsonRpc = {method: request.request.method, id: request.key};
      if (request.request.rpc) {
        jsonRpc.params = request.request.rpc;
      }
      return jsonRpc;
    };

    /**
     * Call to make a batch execute its requests. Batch will distribute calls over their
     * bound transports and then merge them before calling the userCallback. If the result
     * of an rpc is another rpc request then it will be chained and executed.
     *
     * @param {function(Object)} userCallback the callback to the gadget where results are passed.
     */
    var execute = function(userCallback) {
      var batchResult = {};

      var perTransportBatch = {};

      // Break requests into their per-transport batches in call order
      /** @type {number} */
      var latchCount = 0;
      var transports = [];
      for (var i = 0; i < keyedRequests.length; i++) {
        // Batch requests per-transport
        var transport = keyedRequests[i].request.transport;
        if (!perTransportBatch[transport.name]) {
          transports.push(transport);
          latchCount++;
        }
        perTransportBatch[transport.name] = perTransportBatch[transport.name] || [];

        // Transform the request into JSON-RPC form before sending to the transport
        perTransportBatch[transport.name].push(toJsonRpc(keyedRequests[i]));
      }

      // Define callback for transports
      var transportCallback = function(transportBatchResult) {
        if (transportBatchResult.error) {
          batchResult.error = transportBatchResult.error;
        }
        // Merge transport results into overall result and hoist data.
        // All transport results are required to be of the format
        // { <key> : <JSON-RPC response>, ...}
        for (var i = 0; i < keyedRequests.length; i++) {
          var key = keyedRequests[i].key;
          var response = transportBatchResult[key];
          if (response) {
            if (response.error) {
              // No need to hoist error responses
              batchResult[key] = response;
            } else {
              // Handle both compliant and non-compliant JSON-RPC data responses.
              batchResult[key] = response.data || response.result;
            }
          }
        }

        // Latch on no. of transports before calling user callback
        latchCount--;
        if (latchCount === 0) {
          userCallback(batchResult);
        }
      };

      // For each transport execute its local batch of requests
      for (var j = 0; j < transports.length; j++) {
        transports[j].execute(perTransportBatch[transports[j].name], transportCallback);
      }

      // Force the callback to occur asynchronously even if there were no actual calls
      if (latchCount == 0) {
        window.setTimeout(function() {userCallback(batchResult)}, 0);
      }
    };

    that.execute = execute;
    that.add = add;
    return that;
  };

  osapi.newBatch = newBatch;
})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * Provide a transport of osapi requests over JSON-RPC. Exposed JSON-RPC endpoints and
 * their associated methods are available from config in the "osapi.services" field.
 */
(function() {

  /**
   * Called by a batch to execute all requests
   * @param {Object} requests
   * @param {function(Object)} callback
   */
  function execute(requests, callback) {

    function processResponse(response) {
      // Convert an XHR failure to a JSON-RPC error
      if (response.errors[0]) {
        callback({
          error: {
            code: response.rc,
            message: response.text
          }
        });
      } else {
        var jsonResponse = response.result || response.data;
        if (jsonResponse.error) {
          callback(jsonResponse);
        } else {
          var responseMap = {};
          for (var i = 0; i < jsonResponse.length; i++) {
            responseMap[jsonResponse[i].id] = jsonResponse[i];
          }
          callback(responseMap);
        }
      }
    }

    var request = {
      'POST_DATA' : gadgets.json.stringify(requests),
      'CONTENT_TYPE' : 'JSON',
      'METHOD' : 'POST',
      'AUTHORIZATION' : 'SIGNED'
    };

    var url = this.name;
    var token = shindig.auth.getSecurityToken();
    if (token) {
      url += '?st=';
      url += encodeURIComponent(token);
    }
    gadgets.io.makeNonProxiedRequest(url, processResponse, request, 'application/json');
  }

  function init(config) {
    var services = config['osapi.services'];
    if (services) {
      // Iterate over the defined services, extract the http endpoints and
      // create a transport per-endpoint
      for (var endpointName in services) if (services.hasOwnProperty(endpointName)) {
        if (endpointName.indexOf('http') == 0 ||
            endpointName.indexOf('//') == 0) {
          // Expand the host & append the security token
          var endpointUrl = endpointName.replace('%host%', document.location.host);
          var transport = { name: endpointUrl, 'execute' : execute };
          var methods = services[endpointName];
          for (var i = 0; i < methods.length; i++) {
            osapi._registerMethod(methods[i], transport);
          }
        }
      }
    }
  }

  // We do run this in the container mode in the new common container
  if (gadgets.config) {
    gadgets.config.register('osapi.services', null, init);
  }

})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * A transport for osapi based on gadgets.rpc. Allows osapi to expose APIs requiring container
 * and user UI mediation in addition to allowing data oriented APIs to be implemented using
 * gadgets.rpc instead of XHR/JSON-RPC/REST etc..
 */
if (gadgets && gadgets.rpc) { //Dont bind if gadgets.rpc not defined
  (function() {

    /**
     * Execute the JSON-RPC batch of gadgets.rpc. The container is expected to implement
     * the method osapi._handleGadgetRpcMethod(<JSON-RPC batch>)
     *
     * @param {Object} requests the opensocial JSON-RPC request batch.
     * @param {function(Object)} callback to the osapi batch with either an error response or
     * a JSON-RPC batch result.
     * @private
     */
    function execute(requests, callback) {
      var rpcCallback = function(response) {
        if (!response) {
          callback({ code: 500, message: 'Container refused the request' });
        } else if (response.error) {
          callback(response);
        } else {
          var responseMap = {};
          for (var i = 0; i < response.length; i++) {
            responseMap[response[i].id] = response[i];
          }
          callback(responseMap);
        }
      };
      gadgets.rpc.call('..', 'osapi._handleGadgetRpcMethod', rpcCallback, requests);
      // TODO - Timeout handling if rpc silently fails?
    }

    function init(config) {
      var transport = { name: 'gadgets.rpc', 'execute' : execute };
      var services = config['osapi.services'];
      if (services) {
        // Iterate over the defined services, extract the gadget.rpc endpoint and
        // bind to it
        for (var endpointName in services) if (services.hasOwnProperty(endpointName)) {
          if (endpointName === 'gadgets.rpc') {
            var methods = services[endpointName];
            for (var i = 0; i < methods.length; i++) {
              osapi._registerMethod(methods[i], transport);
            }
          }
        }
      }

      // Check if the container.listMethods is bound? If it is then use it to
      // introspect the container services for available methods and bind them
      // Because the call is asynchronous we delay the execution of the gadget onLoad
      // handler until the callback has completed. Containers wishing to avoid this
      // behavior should not specify a binding for container.listMethods in their
      // container config but rather list out all the container methods they want to
      // expose directly which is the preferred option for production environments
      if (osapi.container && osapi.container.listMethods) {

        // Swap out the onload handler with a latch so that it is not called
        // until two of the three following events occur
        // 1 - gadgets.util.runOnLoadHandlers called at end of gadget content
        // 2 - callback from container.listMethods
        // 3 - callback from window.setTimeout
        var originalRunOnLoadHandlers = gadgets.util.runOnLoadHandlers;
        var count = 2;
        var newRunOnLoadHandlers = function() {
          count--;
          if (count == 0) {
            originalRunOnLoadHandlers();
          }
        };
        gadgets.util.runOnLoadHandlers = newRunOnLoadHandlers;

        // Call for the container methods and bind them to osapi.
        osapi.container.listMethods({}).execute(function(response) {
          if (!response.error) {
            for (var i = 0; i < response.length; i++) {
              // do not rebind container.listMethods implementation
              if (response[i] != 'container.listMethods') {
                osapi._registerMethod(response[i], transport);
              }
            }
          }
          // Notify completion
          newRunOnLoadHandlers();
        });

        // Wait 500ms for the rpc. This should be a reasonable upper bound
        // even for slow transports while still allowing for reasonable testing
        // in a development environment
        window.setTimeout(newRunOnLoadHandlers, 500);
      }
    }

    // Do not run this in container mode.
    if (gadgets.config && gadgets.config.isGadget) {
      gadgets.config.register('osapi.services', null, init);
    }
  })();
}
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * Service to retrieve People via JSON RPC opensocial calls.
 * Called in onLoad handler as osapi.people.get could be defined by
 * the container over the gadgets.rpc transport.
 */
gadgets.util.registerOnLoadHandler(function() {

  // No point defining these if osapi.people.get doesn't exist
  if (osapi && osapi.people && osapi.people.get) {
    /**
    * Helper functions to get People.
    * Options specifies parameters to the call as outlined in the
    * JSON RPC Opensocial Spec
    * http://www.opensocial.org/Technical-Resources/opensocial-spec-v081/rpc-protocol
    * @param {object.<JSON>} The JSON object of parameters for the specific request.
    */
    /**
      * Function to get Viewer profile.
      * Options specifies parameters to the call as outlined in the
      * JSON RPC Opensocial Spec
      * http://www.opensocial.org/Technical-Resources/opensocial-spec-v081/rpc-protocol
      * @param {object.<JSON>} The JSON object of parameters for the specific request.
      */
    osapi.people.getViewer = function(options) {
      options = options || {};
      options.userId = '@viewer';
      options.groupId = '@self';
      return osapi.people.get(options);
    };

    /**
      * Function to get Viewer's friends'  profiles.
      * Options specifies parameters to the call as outlined in the
      * JSON RPC Opensocial Spec
      * http://www.opensocial.org/Technical-Resources/opensocial-spec-v081/rpc-protocol
      * @param {object.<JSON>} The JSON object of parameters for the specific request.
      */
    osapi.people.getViewerFriends = function(options) {
      options = options || {};
      options.userId = '@viewer';
      options.groupId = '@friends';
      return osapi.people.get(options);
    };

    /**
      * Function to get Owner profile.
      * Options specifies parameters to the call as outlined in the
      * JSON RPC Opensocial Spec
      * http://www.opensocial.org/Technical-Resources/opensocial-spec-v081/rpc-protocol
      * @param {object.<JSON>} The JSON object of parameters for the specific request.
      */
    osapi.people.getOwner = function(options) {
      options = options || {};
      options.userId = '@owner';
      options.groupId = '@self';
      return osapi.people.get(options);
    };

    /**
      * Function to get Owner's friends' profiles.
      * Options specifies parameters to the call as outlined in the
      * JSON RPC Opensocial Spec
      * http://www.opensocial.org/Technical-Resources/opensocial-spec-v081/rpc-protocol
      * @param {object.<JSON>} The JSON object of parameters for the specific request.
      */
    osapi.people.getOwnerFriends = function(options) {
      options = options || {};
      options.userId = '@owner';
      options.groupId = '@friends';
      return osapi.people.get(options);
    };
  }
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core osapi.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {

  ___.tamesTo(osapi.newBatch, ___.markFuncFreeze(function() {
    var result = osapi.newBatch();
    ___.markInnocent(result['add'], 'add');
    ___.markInnocent(result['execute'], 'execute');
    return ___.tame(result);
  }));

  // OSAPI functions are marked as simple funcs as they are registered
  imports.outers.osapi = ___.tame(osapi);
  ___.grantRead(imports.outers, 'osapi');

  // Forced to tame in an onload handler because peoplehelpers does
  // not define some functions till runOnLoadHandlers runs
  var savedImports = imports;
  gadgets.util.registerOnLoadHandler(function() {
    if (osapi && osapi.people && osapi.people.get) {
      caja___.whitelistFuncs([
        [osapi.people, 'getViewer'],
        [osapi.people, 'getViewerFriends'],
        [osapi.people, 'getOwner'],
        [osapi.people, 'getOwnerFriends']
      ]);
      // Careful not to clobber osapi.people which already has tamed functions on it
      savedImports.outers.osapi.people.getViewer = ___.tame(osapi.people.getViewer);
      savedImports.outers.osapi.people.getViewerFriends = ___.tame(osapi.people.getViewerFriends);
      savedImports.outers.osapi.people.getOwner = ___.tame(osapi.people.getOwner);
      savedImports.outers.osapi.people.getOwnerFriends = ___.tame(osapi.people.getOwnerFriends);
    }
  });

});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/*global ActiveXObject */

/**
 * @fileoverview This library provides a standard and convenient way to embed
 * Flash content into gadgets.
 */

/**
 * @static
 * @class Embeds Flash content in gadgets.
 * @name gadgets.flash
 */
gadgets.flash = gadgets.flash || {};

/**
 * Detects Flash Player and its major version.
 * @return {number} The major version of Flash Player
 *                  or 0 if Flash is not supported.
 *
 * @member gadgets.flash
 */
gadgets.flash.getMajorVersion = function() {
  var flashMajorVersion = 0;
  if (navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length) {
    // Flash detection for browsers using Netscape's plugin architecture
    var i = navigator.plugins['Shockwave Flash'];
    if (i && i.description) {
      flashMajorVersion = parseInt(i.description.match(/[0-9]+/)[0], 10);
    }
  } else {
    // Flash detection for IE
    // This is done by trying to create an ActiveX object with the name
    // "ShockwaveFlash.ShockwaveFlash.{majorVersion}".
    for (var version = 10; version > 0; version--) {
      try {
        var dummy = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.' + version);
        return version;
      } catch (e) {
      }
    }
  }
  return flashMajorVersion;
};

gadgets.flash.swfContainerId_ = 0;

/**
 * Injects a Flash file into the DOM tree.
 * @param {string} swfUrl SWF URL.
 * @param {string | Object} swfContainer The id or object reference of an
 *     existing html container element.
 * @param {number} swfVersion Minimal Flash Player version required.
 * @param {Object=} opt_params An optional object that may contain any valid html
 *     parameter. All attributes will be passed through to the flash movie on
 *     creation.
 * @return {boolean} Whether the function call completes successfully.
 *
 * @member gadgets.flash
 */
gadgets.flash.embedFlash = function(swfUrl, swfContainer, swfVersion, opt_params) {
  switch (typeof swfContainer) {
    case 'string':
      swfContainer = document.getElementById(swfContainer);
    case 'object':
      if (swfContainer && (typeof swfContainer.innerHTML === 'string')) {
        break;
      }
    default:
      return false;
  }

  switch (typeof opt_params) {
    case 'undefined':
      opt_params = {};
    case 'object':
      break;
    default:
      return false;
  }

  if (swfUrl.indexOf('//') == 0) {
    swfUrl = document.location.protocol + swfUrl;
  }

  var ver = gadgets.flash.getMajorVersion();
  if (ver) {
    var swfVer = parseInt(swfVersion, 10);
    if (isNaN(swfVer)) {
      swfVer = 0;
    }
    if (ver >= swfVer) {
      // Set default size
      if (opt_params.width === void 0) {
        opt_params.width = '100%';
      }
      if (opt_params.height === void 0) {
        opt_params.height = '100%';
      }
      // Set the default "base" attribute
      if (typeof opt_params.base !== 'string') {
        var a = document.createElement('a');
        a.href = swfUrl;
        // Get the part up to the last slash
        opt_params.base = a.href.match(/^(.*\/)[^\/]*$/)[1];
      }
      // Set wmode to "opaque" if it's not defined. The default value
      // "window" is undesirable because browsers will render Flash
      // on top of other html elements.
      if (typeof opt_params.wmode !== 'string') {
        opt_params.wmode = 'opaque';
      }
      while (!opt_params.id) {
        var newId = 'swfContainer' + gadgets.flash.swfContainerId_++;
        if (!document.getElementById(newId)) {
          opt_params.id = newId;
        }
      }
      // Prepare flash object
      var flashObj;
      if (navigator.plugins && navigator.mimeTypes &&
          navigator.mimeTypes.length) {
        // Use <embed> tag for Netscape and Mozilla browsers
        opt_params.type = 'application/x-shockwave-flash';
        opt_params.src = swfUrl;

        flashObj = document.createElement('embed');
        for (var prop in opt_params) {
          if (!/^swf_/.test(prop) && !/___$/.test(prop)) {
            flashObj.setAttribute(prop, opt_params[prop]);
          }
        }
        // Inject flash object
        swfContainer.innerHTML = '';
        swfContainer.appendChild(flashObj);
        return true;
      } else {
        // Use <object> tag for IE
        // For some odd reason IE demands that innerHTML be used to set <param>
        // values; they're otherwise ignored. As such, we need to be careful
        // what values we accept in opt_params to avoid it being possible to
        // use this HTML generation for nefarious purposes.
        var propIsHtmlSafe = function(val) {
          return !/["<>]/.test(val);
        };

        opt_params.movie = swfUrl;
        var attr = {
          width: opt_params.width,
          height: opt_params.height,
          classid: 'clsid:D27CDB6E-AE6D-11CF-96B8-444553540000'
        };
        if (opt_params.id) {
          attr.id = opt_params.id;
        }

        var html = '<object';
        for (var attrProp in attr) {
          if (!/___$/.test(attrProp) &&
              propIsHtmlSafe(attrProp) &&
              propIsHtmlSafe(attr[attrProp])) {
            html += ' ' + attrProp + '="' + attr[attrProp] + '"';
          }
        }
        html += '>';

        for (var paramsProp in opt_params) {
          var param = document.createElement('param');
          if (!/^swf_/.test(paramsProp) &&
              !attr[paramsProp] &&
              !/___$/.test(paramsProp) &&
              propIsHtmlSafe(paramsProp) &&
              propIsHtmlSafe(opt_params[paramsProp])) {
            html += '<param name="' + paramsProp + '" value="'
                 + opt_params[paramsProp] + '" />';
          }
        }
        html += '</object>';
      }
      swfContainer.innerHTML = html;
      return true;
    }
  }
  return false;
};

/**
 * Injects a cached Flash file into the DOM tree.
 * Accepts the same parameters as gadgets.flash.embedFlash does.
 * @param {string} swfUrl SWF URL.
 * @param {string | Object} swfContainer The id or object reference of an
 *     existing html container element.
 * @param {number} swfVersion Minimal Flash Player version required.
 * @param {Object=} opt_params An optional object that may contain any valid html
 *     parameter. All attributes will be passed through to the flash movie on
 *     creation.
 * @return {boolean} Whether the function call completes successfully.
 *
 * @member gadgets.flash
 */
gadgets.flash.embedCachedFlash = function(swfUrl, swfContainer, swfVersion, opt_params) {
  var url = gadgets.io.getProxyUrl(swfUrl, { rewriteMime: 'application/x-shockwave-flash' });
  return gadgets.flash.embedFlash(url, swfContainer, swfVersion, opt_params);
};

/**
 * iGoogle compatible way to get flash version.
 * @deprecated use gadgets.flash.getMajorVersion instead.
 * @see gadgets.flash.getMajorVersion
 */
var _IG_GetFlashMajorVersion = gadgets.flash.getMajorVersion;


/**
 * iGoogle compatible way to embed flash
 * @deprecated use gadgets.flash.embedFlash instead.
 * @see gadgets.flash.embedFlash
 */
var _IG_EmbedFlash = function(swfUrl, swfContainer, opt_params) {
  return gadgets.flash.embedFlash(swfUrl, swfContainer, opt_params.swf_version,
      opt_params);
};

/**
 * iGoogle compatible way to embed cached flash
 * @deprecated use gadgets.flash.embedCachedFlash() instead.
 * @see gadgets.flash.embedCachedFlash
 */
var _IG_EmbedCachedFlash = function(swfUrl, swfContainer, opt_params) {
  return gadgets.flash.embedCachedFlash(swfUrl, swfContainer, opt_params.swf_version,
      opt_params);
};

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.flash.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
var bridge___;

tamings___.push(function(imports) {
  ___.tamesTo(gadgets.flash.embedFlash, (function() {
    var cleanse = (function() {
      // Gets a fresh Array and Object constructor that
      // doesn't have the caja properties on it.  This is
      // important for passing objects across the boundary
      // to flash code.
      var ifr = document.createElement('iframe');
      ifr.width = 1; ifr.height = 1; ifr.border = 0;
      document.body.appendChild(ifr);
      var O = ifr.contentWindow.Object;
      document.body.removeChild(ifr);

      var c = function(obj) {
        var t = typeof obj, i;
        if (t === 'number' || t === 'boolean' || t === 'string') {
          return obj;
        }
        if (t === 'object') {
          var o = new O;
          for (i in obj) {
            if (/__$/.test(i)) { continue; }
            o[i] = c(obj[i]);
          }
          if (obj.length !== undefined) { o.length = obj.length; }
          return o;
        }
        return (void 0);
      };
      return c;
    })();


    var d = document.createElement('div');
    d.appendChild(document.createTextNode('bridge'));
    document.body.appendChild(d);

    gadgets.flash.embedFlash(
        '/container/Bridge.swf',
        d,
        10,
        {
          allowNetworking: 'always',
          allowScriptAccess: 'all',
          width: 0,
          height: 0,
          flashvars: 'logging=true'
        });
    bridge___ = d.childNodes[0];
    bridge___.channels = [];

    callJS = function(functionName, argv) {
      // This assumes that there's a single gadget in the frame.
      var $v = ___.getNewModuleHandler().getImports().$v;
      return $v.cf($v.ro(functionName), argv);
    };

    onFlashBridgeReady = function() {
      var len = bridge___.channels.length;
      for (var i = 0; i < len; ++i) {
        bridge___.registerChannel(bridge___.channels[i]);
      }
      delete bridge___.channels;
      var outers = ___.getNewModuleHandler().getImports().$v.getOuters();
      if (outers.onFlashBridgeReady) {
        callJS('onFlashBridgeReady', []);
      }
    };

    return ___.frozenFunc(function tamedEmbedFlash(swfUrl, swfContainer, swfVersion,
                                                   opt_params) {
          // Check that swfContainer is a wrapped node
          if (typeof swfContainer === 'string') {
            // This assumes that there's only one gadget in the frame.
            var $v = ___.getNewModuleHandler().getImports().$v;
            swfContainer = $v.cm(
                $v.ro('document'),
                'getElementById',
                [swfContainer]);
          } else if (typeof swfContainer !== 'object' || !swfContainer.node___) {
            return false;
          }

          // Generate a random number for use as the channel name
          // for communication between the bridge and the contained
          // flash object.
          // TODO: Use true randomness.
          var channel = '_flash' + ('' + Math.random()).substring(2);

          // Strip out allowNetworking and allowScriptAccess,
          //   as well as any caja-specific properties.
          var new_params = {};
          for (i in opt_params) {
            if (i.match(/___$/)) { continue; }
            var ilc = i.toLowerCase();
            if (ilc === 'allownetworking' || ilc === 'allowscriptaccess') {
              continue;
            }
            var topi = typeof opt_params[i];
            if (topi !== 'string' && topi !== 'number') { continue; }
            new_params[i] = opt_params[i];
          }
          new_params.allowNetworking = 'never';
          new_params.allowScriptAccess = 'none';
          if (!new_params.flashVars) { new_params.flashVars = ''; }
          new_params.flashVars += '&channel=' + channel;

          // Load the flash.
          gadgets.flash.embedFlash(swfUrl, swfContainer.node___, 10, new_params);

          if (bridge___.channels) {
            // If the bridge hasn't loaded, queue up the channel names
            // for later registration
            bridge___.channels.push(channel);
          } else {
            // Otherwise, register the channel immediately.
            bridge___.registerChannel(channel);
          }

          // Return the ability to talk to the boxed swf.
          return ___.primFreeze({
            callSWF: (function(channel) {
              return ___.func(function(methodName, argv) {
                return bridge___.callSWF(
                    '' + channel,
                    '' + methodName,
                    cleanse(argv));
              });
            })(channel)
          });
        });
  })());
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview This library provides functions for navigating to and dealing
 *     with views of the current gadget.
 */

/**
 * Implements the gadgets.views API spec. See
 * http://code.google.com/apis/gadgets/docs/reference/gadgets.views.html
 */
gadgets.views = function() {

  /**
   * Reference to the current view object.
   */
  var currentView = null;

  /**
   * Map of all supported views for this container.
   */
  var supportedViews = {};

  /**
   * Map of parameters passed to the current request.
   */
  var params = {};

  /**
   * Forces navigation via requestNavigateTo.
   */
  function forceNavigate(e) {
    if (!e) {
      e = window.event;
    }

    var target;
    if (e.target) {
      target = e.target;
    } else if (e.srcElement) {
      target = e.srcElement;
    }

    if (target.nodeType === 3) {
      target = target.parentNode;
    }

    if (target.nodeName.toLowerCase() === 'a') {
      // We use getAttribute() instead of .href to avoid automatic relative path resolution.
      var href = target.getAttribute('href');
      if (href && href[0] !== '#' && href.indexOf('://') === -1) {
        gadgets.views.requestNavigateTo(currentView, href);
        if (e.stopPropagation) {
          e.stopPropagation();
        }
        if (e.preventDefault) {
          e.preventDefault();
        }
        e.returnValue = false;
        e.cancelBubble = true;
        return false;
      }
    }

    return false;
  }

  /**
   * Initializes views. Assumes that the current view is the "view"
   * url parameter (or default if "view" isn't supported), and that
   * all view parameters are in the form view-<name>
   * TODO: Use unified configuration when it becomes available.
   *
   */
  function init(config) {
    var conf = config.views || {};
    for (var s in conf) {
      if (conf.hasOwnProperty(s)) {
        // TODO: Fix this by moving view names / config into a sub property.
        if (s != 'rewriteLinks') {
          var obj = conf[s];
          if (!obj) {
            continue;
          }
          supportedViews[s] = new gadgets.views.View(s, obj.isOnlyVisible);
          var aliases = obj.aliases || [];
          for (var i = 0, alias; (alias = aliases[i]); ++i) {
            supportedViews[alias] = new gadgets.views.View(s, obj.isOnlyVisible);
          }
        }
      }
    }

    var urlParams = gadgets.util.getUrlParameters();
    // View parameters are passed as a single parameter.
    if (urlParams['view-params']) {
      params = gadgets.json.parse(urlParams['view-params']) || params;
    }
    currentView = supportedViews[urlParams.view] || supportedViews['default'];

    if (conf.rewriteLinks) {
      gadgets.util.attachBrowserEvent(document, 'click', forceNavigate, false);
    }
  }

  gadgets.config.register('views', null, init);

  return {

    /**
     * Binds a URL template with variables in the passed environment
     * to produce a URL string.
     *
     * The URL template conforms to the IETF draft spec:
     * http://bitworking.org/projects/URI-Templates/spec/draft-gregorio-uritemplate-03.html
     *
     * @param {string} urlTemplate A URL template for a container view.
     * @param {Object.<string, string>} environment A set of named variables.
     * @return {string} A URL string with substituted variables.
     */
    bind: function(urlTemplate, environment) {
      if (typeof urlTemplate !== 'string') {
        throw new Error('Invalid urlTemplate');
      }

      if (typeof environment !== 'object') {
        throw new Error('Invalid environment');
      }

      var varRE = /^([a-zA-Z0-9][a-zA-Z0-9_\.\-]*)(=([a-zA-Z0-9\-\._~]|(%[0-9a-fA-F]{2}))*)?$/,
          expansionRE = new RegExp('\\{([^}]*)\\}', 'g'),
          opRE = /^-([a-zA-Z]+)\|([^|]*)\|(.+)$/,
          result = [],
          textStart = 0,
          group,
          match,
          varName,
          defaultValue,
          op,
          arg,
          vars,
          flag;

      /**
       * @param {string} varName
       * @param {string=} defaultVal
       */
      function getVar(varName, defaultVal) {
        return environment.hasOwnProperty(varName) ?
               environment[varName] : defaultVal;
      }

      function matchVar(v) {
        if (!(match = v.match(varRE))) {
          throw new Error('Invalid variable : ' + v);
        }
      }

      function matchVars(vs, j, map) {
        var i, va = vs.split(',');
        for (i = 0; i < va.length; ++i) {
          matchVar(va[i]);
          if (map(j, getVar(match[1]), match[1])) {
            break;
          }
        }
        return j;
      }

      function objectIsEmpty(v) {
        if ((typeof v === 'object') || (typeof v === 'function')) {
          for (var i in v) {
            if (v.hasOwnProperty(i)) {
              return false;
            }
          }
          return true;
        }
        return false;
      }

      while ((group = expansionRE.exec(urlTemplate))) {
        result.push(urlTemplate.substring(textStart, group.index));
        textStart = expansionRE.lastIndex;
        if ((match = group[1].match(varRE))) {
          varName = match[1];
          defaultValue = match[2] ? match[2].substr(1) : '';
          result.push(getVar(varName, defaultValue));
        } else {
          if ((match = group[1].match(opRE))) {
            op = match[1];
            arg = match[2];
            vars = match[3];
            flag = 0;
            switch (op) {
              case 'neg':
                flag = 1;
              case 'opt':
                if (matchVars(vars, {flag: flag}, function(j, v) {
                  if (typeof v !== 'undefined' && !objectIsEmpty(v)) {
                    j.flag = !j.flag;
                    return 1;
                  }
                  return 0;
                }).flag) {
                  result.push(arg);
                }
                break;
              case 'join':
                result.push(matchVars(vars, [], function(j, v, k) {
                  if (typeof v === 'string') {
                    j.push(k + '=' + v);
                  } else if (typeof v === 'object') {
                    for (var i in v) {
                      if (v.hasOwnProperty(i)) {
                        j.push(i + '=' + v[i]);
                      }
                    }
                  }
                }).join(arg));
                break;
              case 'list':
                matchVar(vars);
                var value = getVar(match[1]);
                if (typeof value === 'object' && typeof value.join === 'function') {
                  result.push(value.join(arg));
                }
                break;
              case 'prefix':
                flag = 1;
              case 'suffix':
                matchVar(vars);
                value = getVar(match[1], match[2] && match[2].substr(1));
                if (typeof value === 'string') {
                  result.push(flag ? arg + value : value + arg);
                } else if (typeof value === 'object' && typeof value.join === 'function') {
                  result.push(flag ? arg + value.join(arg) : value.join(arg) + arg);
                }
                break;
              default:
                throw new Error('Invalid operator : ' + op);
            }
          } else {
            throw new Error('Invalid syntax : ' + group[0]);
          }
        }
      }

      result.push(urlTemplate.substr(textStart));

      return result.join('');
    },

    /**
     * Attempts to navigate to this gadget in a different view. If the container
     * supports parameters will pass the optional parameters along to the gadget
     * in the new view.
     *
     * @param {string | gadgets.views.View} view The view to navigate to.
     * @param {Object.<string, string>=} opt_params Parameters to pass to the
     *     gadget after it has been navigated to on the surface.
     * @param {string=} opt_ownerId The ID of the owner of the page to navigate to;
     *                 defaults to the current owner.
     */
    requestNavigateTo: function(view, opt_params, opt_ownerId) {
      if (typeof view !== 'string') {
        view = view.getName();
      }
      // TODO If we want to implement a POPUP view we'll have to do it here,
      // The parent frame's attempts to use window.open will fail since it's not
      // directly initiated from the onclick handler
      gadgets.rpc.call(null, 'requestNavigateTo', null, view, opt_params, opt_ownerId);
    },

    /**
     * Returns the current view.
     *
     * @return {gadgets.views.View} The current view.
     */
    getCurrentView: function() {
      return currentView;
    },

    /**
     * Returns a map of all the supported views. Keys each gadgets.view.View by
     * its name.
     *
     * @return {Object.<gadgets.views.ViewType | string, gadgets.views.View>}
     *   All supported views, keyed by their name attribute.
     */
    getSupportedViews: function() {
      return supportedViews;
    },

    /**
     * Returns the parameters passed into this gadget for this view. Does not
     * include all url parameters, only the ones passed into
     * gadgets.views.requestNavigateTo
     *
     * @return {Object.<string, string>} The parameter map.
     */
    getParams: function() {
      return params;
    }
  };
}();


/**
 * @class
 * View Class
 * @name gadgets.views.View
 */

/**
 * View Representation
 * @constructor
 * @param {string} name - the name of the view.
 * @param {boolean=} opt_isOnlyVisible - is this view devoted to this gadget.
 */

gadgets.views.View = function(name, opt_isOnlyVisible) {
  this.name_ = name;
  this.isOnlyVisible_ = !!opt_isOnlyVisible;
};

/**
 * @return {string} The view name.
 */
gadgets.views.View.prototype.getName = function() {
  return this.name_;
};

/**
 * Returns the associated URL template of the view.
 * The URL template conforms to the IETF draft spec:
 * http://bitworking.org/projects/URI-Templates/spec/draft-gregorio-uritemplate-03.html
 * @return {string} A URL template.
 */
gadgets.views.View.prototype.getUrlTemplate = function() {
  return gadgets.config &&
         gadgets.config.views &&
         gadgets.config.views[this.name_] &&
         gadgets.config.views[this.name_].urlTemplate;
};

/**
 * Binds the view's URL template with variables in the passed environment
 * to produce a URL string.
 * @param {Object.<string, string>} environment A set of named variables.
 * @return {string} A URL string with substituted variables.
 */
gadgets.views.View.prototype.bind = function(environment) {
  return gadgets.views.bind(this.getUrlTemplate(), environment);
};

/**
 * @return {boolean} True if this is the only visible gadget on the page.
 */
gadgets.views.View.prototype.isOnlyVisibleGadget = function() {
  return this.isOnlyVisible_;
};

gadgets.views.ViewType = gadgets.util.makeEnum([
  'CANVAS', 'HOME', 'PREVIEW', 'PROFILE',
  // TODO Deprecate the following ViewTypes.
  'FULL_PAGE', 'DASHBOARD', 'POPUP'
]);
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.views.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistCtors([
    [gadgets.views, 'View', Object]
  ]);
  caja___.whitelistMeths([
    [gadgets.views.View, 'bind'],
    [gadgets.views.View, 'getUrlTemplate'],
    [gadgets.views.View, 'isOnlyVisibleGadget'],
    [gadgets.views.View, 'getName']
  ]);
  caja___.whitelistFuncs([
    [gadgets.views, 'getCurrentView'],
    [gadgets.views, 'getParams'],
    [gadgets.views, 'requestNavigateTo']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview This library augments gadgets.window with functionality
 * to get the frame's viewport dimensions.
 */

gadgets.window = gadgets.window || {};

// we wrap these in an anonymous function to avoid storing private data
// as members of gadgets.window.
(function() {
  /**
   * Detects the inner dimensions of a frame.
   * See: http://www.quirksmode.org/viewport/compatibility.html for more
   * information.
   * @return {Object} An object with width and height properties.
   * @member gadgets.window
   */
  gadgets.window.getViewportDimensions = function() {
    var x = 0;
    var y = 0;
    if (self.innerHeight) {
      // all except Explorer
      x = self.innerWidth;
      y = self.innerHeight;
    } else if (document.documentElement &&
               document.documentElement.clientHeight) {
      // Explorer 6 Strict Mode
      x = document.documentElement.clientWidth;
      y = document.documentElement.clientHeight;
    } else if (document.body) {
      // other Explorers
      x = document.body.clientWidth;
      y = document.body.clientHeight;
    }
    return {width: x, height: y};
  };
})();
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview This library augments gadgets.window with functionality
 * to change the height of a gadget dynamically.
 */

/**
 * @static
 * @class Provides operations for getting information about and modifying the
 *     window the gadget is placed in.
 * @name gadgets.window
 */
gadgets.window = gadgets.window || {};

// we wrap these in an anonymous function to avoid storing private data
// as members of gadgets.window.
(function() {

  var oldHeight;

  /**
   * Parse out the value (specified in px) for a CSS attribute of an element.
   *
   * @param {Element} elem the element with the attribute to look for.
   * @param {string} attr the CSS attribute name of interest.
   * @return {number} the value of the px attr of the elem.
   * @private
   */
  function parseIntFromElemPxAttribute(elem, attr) {
    var style = window.getComputedStyle(elem, '');
    var value = style.getPropertyValue(attr);
    value.match(/^([0-9]+)/);
    return parseInt(RegExp.$1, 10);
  }

  /**
   * For Webkit-based browsers, calculate the height of the gadget iframe by
   * iterating through all elements in the gadget, starting with the body tag.
   * It is not sufficient to only account body children elements, because
   * CSS style position "float" may place a child element outside of the
   * containing parent element. Not counting "float" elements may lead to
   * undercounting.
   *
   * @return {number} the height of the gadget.
   * @private
   */
  function getHeightForWebkit() {
    var result = 0;
    var queue = [document.body];

    while (queue.length > 0) {
      var elem = queue.shift();
      var children = elem.childNodes;

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (typeof child.offsetTop !== 'undefined' &&
            typeof child.scrollHeight !== 'undefined') {
          // scrollHeight already accounts for border-bottom, padding-bottom.
          var bottom = child.offsetTop + child.scrollHeight +
              parseIntFromElemPxAttribute(child, 'margin-bottom');
          result = Math.max(result, bottom);
        }
        queue.push(child);
      }
    }

    // Add border, padding and margin of the containing body.
    return result
        + parseIntFromElemPxAttribute(document.body, 'border-bottom')
        + parseIntFromElemPxAttribute(document.body, 'margin-bottom')
        + parseIntFromElemPxAttribute(document.body, 'padding-bottom');
  }

  /**
   * Adjusts the gadget height
   * @param {number=} opt_height An optional preferred height in pixels. If not
   *     specified, will attempt to fit the gadget to its content.
   * @member gadgets.window
   */
  gadgets.window.adjustHeight = function(opt_height) {
    var newHeight = parseInt(opt_height, 10);
    var heightAutoCalculated = false;
    if (isNaN(newHeight)) {
      heightAutoCalculated = true;

      // Resize the gadget to fit its content.

      // Calculating inner content height is hard and different between
      // browsers rendering in Strict vs. Quirks mode.  We use a combination of
      // three properties within document.body and document.documentElement:
      // - scrollHeight
      // - offsetHeight
      // - clientHeight
      // These values differ significantly between browsers and rendering modes.
      // But there are patterns.  It just takes a lot of time and persistence
      // to figure out.

      // Get the height of the viewport
      var vh = gadgets.window.getViewportDimensions().height;
      var body = document.body;
      var docEl = document.documentElement;
      if (document.compatMode === 'CSS1Compat' && docEl.scrollHeight) {
        // In Strict mode:
        // The inner content height is contained in either:
        //    document.documentElement.scrollHeight
        //    document.documentElement.offsetHeight
        // Based on studying the values output by different browsers,
        // use the value that's NOT equal to the viewport height found above.
        newHeight = docEl.scrollHeight !== vh ?
            docEl.scrollHeight : docEl.offsetHeight;
      } else if (navigator.userAgent.indexOf('AppleWebKit') >= 0) {
        // In Webkit:
        // Property scrollHeight and offsetHeight will only increase in value.
        // This will incorrectly calculate reduced height of a gadget
        // (ie: made smaller).
        newHeight = getHeightForWebkit();
      } else if (body && docEl) {
        // In Quirks mode:
        // documentElement.clientHeight is equal to documentElement.offsetHeight
        // except in IE.  In most browsers, document.documentElement can be used
        // to calculate the inner content height.
        // However, in other browsers (e.g. IE), document.body must be used
        // instead.  How do we know which one to use?
        // If document.documentElement.clientHeight does NOT equal
        // document.documentElement.offsetHeight, then use document.body.
        var sh = docEl.scrollHeight;
        var oh = docEl.offsetHeight;
        if (docEl.clientHeight !== oh) {
          sh = body.scrollHeight;
          oh = body.offsetHeight;
        }

        // Detect whether the inner content height is bigger or smaller
        // than the bounding box (viewport).  If bigger, take the larger
        // value.  If smaller, take the smaller value.
        if (sh > vh) {
          // Content is larger
          newHeight = sh > oh ? sh : oh;
        } else {
          // Content is smaller
          newHeight = sh < oh ? sh : oh;
        }
      }
    }

    // Only make the IFPC call if height has changed
    if (newHeight !== oldHeight &&
        !isNaN(newHeight) &&
        !(heightAutoCalculated && newHeight === 0)) {
      oldHeight = newHeight;
      gadgets.rpc.call(null, 'resize_iframe', null, newHeight);
    }
  };
}());

/**
 * @see gadgets.window#adjustHeight
 */
var _IG_AdjustIFrameHeight = gadgets.window.adjustHeight;

// TODO Attach gadgets.window.adjustHeight to the onresize event

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose core gadgets.window.* API to cajoled gadgets
 */
var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistFuncs([
    [gadgets.window, 'adjustHeight'],
    [gadgets.window, 'getViewportDimensions']
  ]);
});

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Tabs library for gadgets.
 */

/**
 * @class Tab class for gadgets.
 * You create tabs using the TabSet addTab() method.
 * To get Tab objects,
 * use the TabSet getSelectedTab() or getTabs() methods.
 *
 * <p>
 * <b>See also:</b>
 * <a href="gadgets.TabSet.html">TabSet</a>
 * </p>
 *
 * @name gadgets.Tab
 * @description Creates a new Tab.
 */

/**
 * @param {gadgets.TabSet} handle The associated gadgets.TabSet instance.
 * @private
 * @constructor
 */
gadgets.Tab = function(handle) {
  this.handle_ = handle;
  this.td_ = null;
  this.contentContainer_ = null;
  this.callback_ = null;
};

/**
 * Returns the label of the tab as a string (may contain HTML).
 * @return {string} Label of the tab.
 */
gadgets.Tab.prototype.getName = function() {
  return this.td_.innerHTML;
};

/**
 * Returns the HTML element that contains the tab's label.
 * @return {Element} The HTML element of the tab's label.
 */
gadgets.Tab.prototype.getNameContainer = function() {
  return this.td_;
};

/**
 * Returns the HTML element where the tab content is rendered.
 * @return {Element} The HTML element of the content container.
 */
gadgets.Tab.prototype.getContentContainer = function() {
  return this.contentContainer_;
};

/**
 * Returns the callback function that is executed when the tab is selected.
 * @return {function(string)} The callback function of the tab.
 */
gadgets.Tab.prototype.getCallback = function() {
  return this.callback_;
};

/**
 * Returns the tab's index.
 * @return {number} The tab's index.
 */
gadgets.Tab.prototype.getIndex = function() {
  var tabs = this.handle_.getTabs();
  for (var i = 0; i < tabs.length; ++i) {
    if (this === tabs[i]) {
      return i;
    }
  }
  return -1;
};

/**
 * @class A class gadgets can use to make tabs.
 * @description Creates a new TabSet object
 *
 * @param {string=} opt_moduleId Optional suffix for the ID of tab container.
 * @param {string=} opt_defaultTab Optional tab name that specifies the name of
 *                   of the tab that is selected after initialization.
 *                   If this parameter is omitted, the first tab is selected by
 *                   default.
 * @param {Element=} opt_container The HTML element to contain the tabs.  If
 *                    omitted, a new div element is created and inserted at the
 *                    very top.
 */
gadgets.TabSet = function(opt_moduleId, opt_defaultTab, opt_container) {
  this.moduleId_ = opt_moduleId || 0;
  this.domIdFilter_ = new RegExp('^[A-Za-z]([0-9a-zA-Z_:.-]+)?$');
  this.selectedTab_ = null;
  this.tabs_ = [];
  this.tabsAdded_ = 0;
  this.defaultTabName_ = opt_defaultTab || '';
  this.leftNavContainer_ = null;
  this.rightNavContainer_ = null;
  this.navTable_ = null;
  this.tabsContainer_ = null;
  this.rtl_ = document.body.dir === 'rtl';
  this.prefs_ = new gadgets.Prefs();
  this.selectedTabIndex_ = this.prefs_.getString('selectedTab');
  this.mainContainer_ = this.createMainContainer_(opt_container);
  this.tabTable_ = this.createTabTable_();
  this.displayTabs(false);
  //  gadgets.TabSet.addCSS_([  ].join(''));
};

gadgets.config.register('tabset', {}, function(configuration) {
  // Injects the default stylesheet for tabs
  gadgets.TabSet.addCSS_(configuration.tabs.css.join(''));
});


/**
 * Adds a new tab based on the name-value pairs specified in opt_params.
 * @param {string} tabName Label of the tab to create.
 * @param {string|Object=} opt_params Optional parameter object. The following
 *                   properties are supported:
 *                   .contentContainer An existing HTML element to be used as
 *                     the tab content container. If omitted, the tabs
 *                     library creates one.
 *                   .callback A callback function to be executed when the tab
 *                     is selected.
 *                   .tooltip A tooltip description that pops up when user moves
 *                     the mouse cursor over the tab.
 *                   .index The index at which to insert the tab. If omitted,
 *                     the new tab is appended to the end.
 * @return {string} DOM id of the tab container.
 */
gadgets.TabSet.prototype.addTab = function(tabName, opt_params) {
  if (typeof opt_params === 'string') {
    opt_params = {contentContainer: document.getElementById(arguments[1]),
      callback: arguments[2]};
  }

  var params = opt_params || {};

  var tabIndex = -1;
  if (params.index >= 0 && params.index < this.tabs_.length) {
    tabIndex = params.index;
  }
  var tab = this.createTab_(tabName, {
    contentContainer: params.contentContainer,
    callback: params.callback,
    tooltip: params.tooltip
  });

  var tr = this.tabTable_.rows[0];
  if (this.tabs_.length > 0) {
    var filler = document.createElement('td');
    filler.className = this.cascade_('tablib_spacerTab');
    filler.appendChild(document.createTextNode(' '));

    var ref = tabIndex < 0 ? tr.cells[tr.cells.length - 1] : this.tabs_[tabIndex].td_;
    tr.insertBefore(filler, ref);
    tr.insertBefore(tab.td_, tabIndex < 0 ? ref : filler);
  } else {
    tr.insertBefore(tab.td_, tr.cells[tr.cells.length - 1]);
  }

  if (tabIndex < 0) {
    tabIndex = this.tabs_.length;
    this.tabs_.push(tab);
  } else {
    this.tabs_.splice(tabIndex, 0, tab);

    // Inserting may change selected tab's index
    this.saveSelectedTabIndex_();
  }

  var selectedIndex = parseInt(this.selectedTabIndex_, 10);
  if (isNaN(selectedIndex)) {
    if (tabName == this.defaultTabName_ || (!this.defaultTabName_ && tabIndex === 0)) {
      this.selectTab_(tab);
    }
  } else if (selectedIndex == tabIndex) {
    this.selectTab_(tab, true);
  }

  this.tabsAdded_++;
  this.displayTabs(true);
  this.adjustNavigation_();

  return tab.contentContainer_.id;
};

/**
 * Removes a tab at tabIndex and all of its associated content.
 * @param {number} tabIndex Index of the tab to remove.
 */
gadgets.TabSet.prototype.removeTab = function(tabIndex) {
  var tab = this.tabs_[tabIndex];
  if (tab) {
    if (tab === this.selectedTab_) {
      var maxIndex = this.tabs_.length - 1;
      if (maxIndex > 0) {
        this.selectTab_(tabIndex < maxIndex ?
            this.tabs_[tabIndex + 1] :
            this.tabs_[tabIndex - 1]);
      }
    }
    var tr = this.tabTable_.rows[0];
    if (this.tabs_.length > 1) {
      tr.removeChild(tabIndex ? tab.td_.previousSibling : tab.td_.nextSibling);
    }
    tr.removeChild(tab.td_);
    this.mainContainer_.removeChild(tab.contentContainer_);
    this.tabs_.splice(tabIndex, 1);
    this.adjustNavigation_();
    if (this.tabs_.length === 0) {
      this.displayTabs(false);
      this.selectedTab_ = null;
    }
  }
};

/**
 * Returns the currently selected tab object.
 * @return {gadgets.Tab} The currently selected tab object.
 */
gadgets.TabSet.prototype.getSelectedTab = function() {
  return this.selectedTab_;
};

/**
 * Selects the tab at tabIndex and fires the tab's callback function if it
 * exists. If the tab is already selected, the callback is not fired.
 * @param {number} tabIndex Index of the tab to select.
 */
gadgets.TabSet.prototype.setSelectedTab = function(tabIndex) {
  if (this.tabs_[tabIndex]) {
    this.selectTab_(this.tabs_[tabIndex]);
  }
};

/**
 * Swaps the positions of tabs at tabIndex1 and tabIndex2. The selected tab
 * does not change, and no callback functions are called.
 * @param {number} tabIndex1 Index of the first tab to swap.
 * @param {number} tabIndex2 Index of the secnod tab to swap.
 */
gadgets.TabSet.prototype.swapTabs = function(tabIndex1, tabIndex2) {
  var tab1 = this.tabs_[tabIndex1];
  var tab2 = this.tabs_[tabIndex2];
  if (tab1 && tab2) {
    var tr = tab1.td_.parentNode;
    var slot = tab1.td_.nextSibling;
    tr.insertBefore(tab1.td_, tab2.td_);
    tr.insertBefore(tab2.td_, slot);
    this.tabs_[tabIndex1] = tab2;
    this.tabs_[tabIndex2] = tab1;
  }
};


/**
 * Returns an array of all existing tab objects.
 * @return {Array.<gadgets.Tab>} Array of all existing tab objects.
 */
gadgets.TabSet.prototype.getTabs = function() {
  return this.tabs_;
};

/**
 * Sets the alignment of tabs. Tabs are center-aligned by default.
 * @param {string} align 'left', 'center', or 'right'.
 * @param {number=} opt_offset Optional parameter to set the number of pixels
 *                   to offset tabs from the left or right edge. The default
 *                   value is 3px.
 */
gadgets.TabSet.prototype.alignTabs = function(align, opt_offset) {
  var tr = this.tabTable_.rows[0];
  var left = tr.cells[0];
  var right = tr.cells[tr.cells.length - 1];
  var offset = isNaN(opt_offset) ? '3px' : opt_offset + 'px';
  left.style.width = align === 'left' ? offset : '';
  right.style.width = align === 'right' ? offset : '';
  // In Opera and potentially some other browsers, changes to the width of
  // table cells aren't rendered.  To fix this, we force to re-render the
  // table by hiding and showing it again.
  this.tabTable_.style.display = 'none';
  this.tabTable_.style.display = '';
};

/**
 * Shows or hides tabs and all associated content.
 * @param {boolean} display true to show tabs; false to hide tabs.
 */
gadgets.TabSet.prototype.displayTabs = function(display) {
  this.mainContainer_.style.display = display ? 'block' : 'none';
};

/**
 * Returns the tab headers container element.
 * @return {Element} The tab headers container element.
 */
gadgets.TabSet.prototype.getHeaderContainer = function() {
  return this.tabTable_;
};

/**
 * Helper method that returns an HTML container element to which all tab-related
 * content will be appended.
 * This container element is created and inserted as the first child of the
 * gadget if opt_element is not specified.
 * @param {Element=} opt_element Optional HTML container element.
 * @return {Element} HTML container element.
 * @private
 */
gadgets.TabSet.prototype.createMainContainer_ = function(opt_element) {
  var newId = 'tl_' + this.moduleId_;
  var container = opt_element || document.getElementById(newId);

  if (!container) {
    container = document.createElement('div');
    container.id = newId;
    document.body.insertBefore(container, document.body.firstChild);
  }

  container.className = this.cascade_('tablib_main_container') + ' ' +
      container.className;

  return container;
};

/**
 * Helper method that expands a class name into two class names.
 * @param {string} label CSS class.
 * @return {string} Expanded class names.
 * @private
 */
gadgets.TabSet.prototype.cascade_ = function(label) {
  return label + ' ' + label + this.moduleId_;
};

/**
 * Helper method that creates the tabs table and inserts it into the main
 * container as the first child.
 * @return {Element} HTML element of the tab container table.
 * @private
 */
gadgets.TabSet.prototype.createTabTable_ = function() {
  var table = document.createElement('table');
  table.id = this.mainContainer_.id + '_header';
  table.className = this.cascade_('tablib_table');
  table.cellSpacing = '0';
  table.cellPadding = '0';

  var tbody = document.createElement('tbody');
  var tr = document.createElement('tr');
  tbody.appendChild(tr);
  table.appendChild(tbody);

  var emptyTd = document.createElement('td');
  emptyTd.className = this.cascade_('tablib_emptyTab');
  emptyTd.appendChild(document.createTextNode(' '));
  tr.appendChild(emptyTd);
  tr.appendChild(emptyTd.cloneNode(true));

  // Construct a wrapper table around our tab table to house the navigation
  // elements. These elements will appear if the tab table overflows.
  var navTable = document.createElement('table');
  navTable.id = this.mainContainer_.id + '_navTable';
  navTable.style.width = '100%';
  navTable.cellSpacing = '0';
  navTable.cellPadding = '0';
  navTable.style.tableLayout = 'fixed';
  var navTbody = document.createElement('tbody');
  var navTr = document.createElement('tr');
  navTbody.appendChild(navTr);
  navTable.appendChild(navTbody);

  // Create the left navigation element.
  var leftNavTd = document.createElement('td');
  leftNavTd.className = this.cascade_('tablib_emptyTab') + ' ' +
                        this.cascade_('tablib_navContainer');
  leftNavTd.style.textAlign = 'left';
  leftNavTd.style.display = '';
  var leftNav = document.createElement('a');
  leftNav.href = 'javascript:void(0)';
  leftNav.innerHTML = '&laquo;';
  leftNavTd.appendChild(leftNav);
  navTr.appendChild(leftNavTd);

  // House the actual tab table in the middle, hiding any overflow.
  var tabNavTd = document.createElement('td');
  navTr.appendChild(tabNavTd);
  var wrapper = document.createElement('div');
  wrapper.style.width = '100%';
  wrapper.style.overflow = 'hidden';
  wrapper.appendChild(table);
  tabNavTd.appendChild(wrapper);

  // Create the right navigation element.
  var rightNavTd = document.createElement('td');
  rightNavTd.className = this.cascade_('tablib_emptyTab') + ' ' +
                         this.cascade_('tablib_navContainer');
  rightNavTd.style.textAlign = 'right';
  rightNavTd.style.display = '';
  var rightNav = document.createElement('a');
  rightNav.href = 'javascript:void(0)';
  rightNav.innerHTML = '&raquo;';
  rightNavTd.appendChild(rightNav);
  navTr.appendChild(rightNavTd);

  // Register onclick event handlers for smooth scrolling.
  var me = this;
  leftNav.onclick = function(event) {
    me.smoothScroll_(wrapper, -120);
  };
  rightNav.onclick = function(event) {
    me.smoothScroll_(wrapper, 120);
  };

  // Swap left and right scrolling if direction is RTL.
  if (this.rtl_) {
    var temp = leftNav.onclick;
    leftNav.onclick = rightNav.onclick;
    rightNav.onclick = temp;
  }

  // If we're already displaying tabs, then remove them.
  if (this.navTable_) {
    this.mainContainer_.replaceChild(navTable, this.navTable_);
  } else {
    this.mainContainer_.insertBefore(navTable, this.mainContainer_.firstChild);
    var adjustNavigationFn = function() {
      me.adjustNavigation_();
    };
    gadgets.util.attachBrowserEvent(window, 'resize', adjustNavigationFn, false);
  }

  this.navTable_ = navTable;
  this.leftNavContainer_ = leftNavTd;
  this.rightNavContainer_ = rightNavTd;
  this.tabsContainer_ = wrapper;

  return table;
};

/**
 * Helper method that shows or hides the navigation elements.
 * @private
 */
gadgets.TabSet.prototype.adjustNavigation_ = function() {
  this.leftNavContainer_.style.display = 'none';
  this.rightNavContainer_.style.display = 'none';
  if (this.tabsContainer_.scrollWidth <= this.tabsContainer_.offsetWidth) {
    if (this.tabsContainer_.scrollLeft) {
      // to avoid JS error in IE
      this.tabsContainer_.scrollLeft = 0;
    }
    return;
  }

  this.leftNavContainer_.style.display = '';
  this.rightNavContainer_.style.display = '';
  if (this.tabsContainer_.scrollLeft + this.tabsContainer_.offsetWidth >
      this.tabsContainer_.scrollWidth) {
    this.tabsContainer_.scrollLeft = this.tabsContainer_.scrollWidth -
                                     this.tabsContainer_.offsetWidth;
  } else if (this.rtl_) {
    this.tabsContainer_.scrollLeft = this.tabsContainer_.scrollWidth;
  }
};

/**
 * Helper method that smoothly scrolls the tabs container.
 * @param {Element} container The tabs container element.
 * @param {number} distance The amount of pixels to scroll right.
 * @private
 */
gadgets.TabSet.prototype.smoothScroll_ = function(container, distance) {
  var scrollAmount = 10;
  if (!distance) {
    return;
  } else {
    container.scrollLeft += (distance < 0) ? -scrollAmount : scrollAmount;
  }

  var nextScroll = Math.min(scrollAmount, Math.abs(distance));
  var me = this;
  var timeoutFn = function() {
    me.smoothScroll_(container, (distance < 0) ? distance + nextScroll :
                                                 distance - nextScroll);
  };
  setTimeout(timeoutFn, 10);
};

/**
 * Helper function that dynamically inserts CSS rules to the page.
 * @param {string} cssText CSS rules to inject.
 * @private
 */
gadgets.TabSet.addCSS_ = function(cssText) {
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = cssText;
    } else {
      styleElement.appendChild(document.createTextNode(cssText));
    }
    head.insertBefore(styleElement, head.firstChild);
  }
};

/**
 * Helper method that creates a new gadgets.Tab object.
 * @param {string} tabName Label of the tab to create.
 * @param {Object} params Parameter object. The following properties
 *                   are supported:
 *                   .contentContainer An existing HTML element to be used as
 *                     the tab content container. If omitted, the tabs
 *                     library creates one.
 *                   .callback A callback function to be executed when the tab
 *                     is selected.
 *                   .tooltip A tooltip description that pops up when user moves
 *                     the mouse cursor over the tab.
 * @return {gadgets.Tab} A new gadgets.Tab object.
 * @private
 */
gadgets.TabSet.prototype.createTab_ = function(tabName, params) {
  var tab = new gadgets.Tab(this);
  tab.contentContainer_ = params.contentContainer;
  tab.callback_ = params.callback;
  tab.td_ = document.createElement('td');
  tab.td_.title = params.tooltip || '';
  tab.td_.innerHTML = html_sanitize(tabName);
  tab.td_.className = this.cascade_('tablib_unselected');
  tab.td_.onclick = this.setSelectedTabGenerator_(tab);

  if (!tab.contentContainer_) {
    tab.contentContainer_ = document.createElement('div');
    tab.contentContainer_.id = this.mainContainer_.id + '_' + this.tabsAdded_;
    this.mainContainer_.appendChild(tab.contentContainer_);
  } else if (tab.contentContainer_.parentNode !== this.mainContainer_) {
    this.mainContainer_.appendChild(tab.contentContainer_);
  }
  tab.contentContainer_.style.display = 'none';
  tab.contentContainer_.className = this.cascade_('tablib_content_container') +
      ' ' + tab.contentContainer_.className;
  return tab;
};

/**
 * Helper method that creates a function to select the specified tab.
 * @param {gadgets.Tab} tab The tab to select.
 * @return {function()} Callback function to select the tab.
 * @private
 */
gadgets.TabSet.prototype.setSelectedTabGenerator_ = function(tab) {
  return function() { tab.handle_.selectTab_(tab); };
};

/**
 * Helper method that selects a tab and unselects the previously selected.
 * If the tab is already selected, then callback is not executed.
 * @param {gadgets.Tab} tab The tab to select.
 * @private
 */
gadgets.TabSet.prototype.selectTab_ = function(tab, opt_inhibit_save) {
  if (this.selectedTab_ === tab) {
    return;
  }

  if (this.selectedTab_) {
    this.selectedTab_.td_.className = this.cascade_('tablib_unselected');
    this.selectedTab_.td_.onclick =
        this.setSelectedTabGenerator_(this.selectedTab_);
    this.selectedTab_.contentContainer_.style.display = 'none';
  }

  tab.td_.className = this.cascade_('tablib_selected');
  tab.td_.onclick = null;
  tab.contentContainer_.style.display = 'block';
  this.selectedTab_ = tab;

  // Remember which tab is selected only if nosave is not true.
  var nosave = (opt_inhibit_save === true) ? true : false;
  if (!nosave) {
    this.saveSelectedTabIndex_();
  }

  if (typeof tab.callback_ === 'function') {
    tab.callback_(tab.contentContainer_.id);
  }
};

gadgets.TabSet.prototype.saveSelectedTabIndex_ = function() {
  try {
    var currentTabIndex = this.selectedTab_.getIndex();
    if (currentTabIndex >= 0) {
      this.selectedTabIndex_ = currentTabIndex;
      this.prefs_.set('selectedTab', currentTabIndex);
    }
  } catch (e) {
    // ignore.  setprefs is optional for tablib.
  }
};

// Aliases for legacy code

/**
 * @type {gadgets.TabSet}
 * @deprecated
 */
var _IG_Tabs = gadgets.TabSet;
_IG_Tabs.prototype.moveTab = _IG_Tabs.prototype.swapTabs;

/**
 * @param {string} tabName
 * @param {function()} callback
 * @deprecated
 */
_IG_Tabs.prototype.addDynamicTab = function(tabName, callback) {
  return this.addTab(tabName, {callback: callback});
};

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose gadgets.Tabs and gadgets.TabSet API to cajoled gadgets
 */

var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistMeths([
    [gadgets.Tab, 'getCallback'],
    [gadgets.Tab, 'getContentContainer'],
    [gadgets.Tab, 'getIndex'],
    [gadgets.Tab, 'getName'],
    [gadgets.Tab, 'getNameContainer'],

    [gadgets.TabSet, 'addTab'],
    [gadgets.TabSet, 'alignTabs'],
    [gadgets.TabSet, 'displayTabs'],
    [gadgets.TabSet, 'getHeaderContainer'],
    [gadgets.TabSet, 'getSelectedTab'],
    [gadgets.TabSet, 'getTabs'],
    [gadgets.TabSet, 'removeTab'],
    [gadgets.TabSet, 'setSelectedTab'],
    [gadgets.TabSet, 'swapTabs']
  ]);
  caja___.whitelistCtors([
    [gadgets, 'TabSet']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements. See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership. The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Library for creating small dismissible messages in gadgets.
 * Typical use cases:
 * <ul>
 * <li> status messages, e.g. loading, saving, etc.
 * <li> promotional messages, e.g. new features, new gadget, etc.
 * <li> debug/error messages, e.g. bad input, failed connection to server.
 * </ul>
 */

/**
 * @class MiniMessage class.
 *
 * @description Used to create messages that will appear to the user within the
 *     gadget.
 * @param {string=} opt_moduleId Optional module Id.
 * @param {Element=} opt_container Optional HTML container element where
 *                                mini-messages will appear.
 */
gadgets.MiniMessage = function(opt_moduleId, opt_container) {
  this.numMessages_ = 0;
  this.moduleId_ = opt_moduleId || 0;
  this.container_ = typeof opt_container === 'object' ?
                    opt_container : this.createContainer_();
};

/**
 * Helper function that creates a container HTML element where mini-messages
 * will be appended to.  The container element is inserted at the top of gadget.
 * @return {Element} An HTML div element as the message container.
 * @private
 */
gadgets.MiniMessage.prototype.createContainer_ = function() {
  var containerId = 'mm_' + this.moduleId_;
  var container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;

    document.body.insertBefore(container, document.body.firstChild);
  }

  return container;
};

/**
 * Helper function that dynamically inserts CSS rules to the page.
 * @param {string} cssText CSS rules to inject.
 * @private
 */
gadgets.MiniMessage.addCSS_ = function(cssText) {
  var head = document.getElementsByTagName('head')[0];
  if (head) {
    var styleElement = document.createElement('style');
    styleElement.type = 'text/css';
    if (styleElement.styleSheet) {
      styleElement.styleSheet.cssText = cssText;
    } else {
      styleElement.appendChild(document.createTextNode(cssText));
    }
    head.insertBefore(styleElement, head.firstChild);
  }
};

/**
 * Helper function that expands a class name into two class names.
 * @param {string} label The CSS class name.
 * @return {string} "X Xn", with n is the ID of this module.
 * @private
 */
gadgets.MiniMessage.prototype.cascade_ = function(label) {
  return label + ' ' + label + this.moduleId_;
};

/**
 * Helper function that returns a function that dismisses a message by removing
 * the message table element from the DOM.  The action is cancelled if the
 * callback function returns false.
 * @param {Element} element HTML element to remove.
 * @param {function()=} opt_callback Optional callback function to be called when
 *                                the message is dismissed.
 * @return {function()} A function that dismisses the specified message.
 * @private
 */
gadgets.MiniMessage.prototype.dismissFunction_ = function(element, opt_callback) {
  return function() {
    if (typeof opt_callback === 'function' && !opt_callback()) {
      return;
    }
    try {
      element.parentNode.removeChild(element);
    } catch (e) {
      // Silently fail in case the element was already removed.
    }
  };
};

/**
 * Creates a dismissible message with an [[]x] icon that allows users to dismiss
 * the message. When the message is dismissed, it is removed from the DOM
 * and the optional callback function, if defined, is called.
 * @param {string | Object} message The message as an HTML string or DOM element.
 * @param {function()=} opt_callback Optional callback function to be called when
 *                                the message is dismissed.
 * @return {Element} HTML element of the created message.
 */
gadgets.MiniMessage.prototype.createDismissibleMessage = function(message,
                                                         opt_callback) {
  var table = this.createStaticMessage(message);
  var td = document.createElement('td');
  td.width = 10;

  var span = td.appendChild(document.createElement('span'));
  span.className = this.cascade_('mmlib_xlink');
  span.onclick = this.dismissFunction_(table, opt_callback);
  span.innerHTML = '[x]';

  table.rows[0].appendChild(td);

  return table;
};

/**
 * Creates a message that displays for the specified number of seconds.
 * When the timer expires,
 * the message is dismissed and the optional callback function is executed.
 * @param {string | Object} message The message as an HTML string or DOM element.
 * @param {number} seconds Number of seconds to wait before dismissing
 *                         the message.
 * @param {function()=} opt_callback Optional callback function to be called when
 *                                the message is dismissed.
 * @return {Element} HTML element of the created message.
 */
gadgets.MiniMessage.prototype.createTimerMessage = function(message, seconds,
                                                            opt_callback) {
  var table = this.createStaticMessage(message);
  window.setTimeout(this.dismissFunction_(table, opt_callback), seconds * 1000);
  return table;
};

/**
 * Creates a static message that can only be dismissed programmatically
 * (by calling dismissMessage()).
 * @param {string | Object} message The message as an HTML string or DOM element.
 * @return {Element} HTML element of the created message.
 */
gadgets.MiniMessage.prototype.createStaticMessage = function(message) {
  // Generate and assign unique DOM ID to table.
  var table = document.createElement('table');
  table.id = 'mm_' + this.moduleId_ + '_' + this.numMessages_;
  table.className = this.cascade_('mmlib_table');
  table.cellSpacing = 0;
  table.cellPadding = 0;
  this.numMessages_++;

  var tbody = table.appendChild(document.createElement('tbody'));
  var tr = tbody.appendChild(document.createElement('tr'));

  // Create message column
  var td = tr.appendChild(document.createElement('td'));

  // If the message already exists in DOM, preserve its location.
  // Otherwise, insert it at the top.
  var ELEMENT_NODE = 1;
  if (typeof message === 'object' &&
      message.parentNode &&
      message.parentNode.nodeType === ELEMENT_NODE) {
    var messageClone = message.cloneNode(true);
    message.style.display = 'none';
    messageClone.id = '';
    td.appendChild(messageClone);
    message.parentNode.insertBefore(table, message.nextSibling);
  } else {
    if (typeof message === 'object') {
      td.appendChild(message);
    } else {
      td.innerHTML = html_sanitize(message);
    }
    this.container_.appendChild(table);
  }

  return table;
};

/**
 * Dismisses the specified message.
 * @param {Element} message HTML element of the message to remove.
 */
gadgets.MiniMessage.prototype.dismissMessage = function(message) {
  this.dismissFunction_(message)();
};

// Injects the default stylesheet for mini-messages.
gadgets.config.register('minimessage', {}, function(configuration) {
  // Injects the default stylesheet for mini-messages
  gadgets.MiniMessage.addCSS_(configuration.minimessage.css.join(''));
});

// Alias for legacy code
var _IG_MiniMessage = gadgets.MiniMessage;

;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @class
 * Tame and expose gadgets.MiniMessage.* API to cajoled gadgets
 */

var tamings___ = tamings___ || [];
tamings___.push(function(imports) {
  caja___.whitelistCtors([
    [gadgets, 'MiniMessage', Object]
  ]);
  caja___.whitelistMeths([
    [gadgets.MiniMessage, 'createDismissibleMessage'],
    [gadgets.MiniMessage, 'createStaticMessage'],
    [gadgets.MiniMessage, 'createTimerMessage'],
    [gadgets.MiniMessage, 'dismissMessage']
  ]);
});
;
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/**
 * @fileoverview API to assist with management of the OAuth popup window.
 */

/**
 * @constructor
 */
gadgets.oauth = gadgets.oauth || {};

/**
 * @class OAuth popup window manager.
 *
 * <p>
 * Expected usage:
 * </p>
 *
 * <ol>
 * <li>
 * <p>
 * Gadget attempts to fetch OAuth data for the user and discovers that
 * approval is needed.  The gadget creates two new UI elements:
 * </p>
 * <ul>
 *   <li>
 *      a "personalize this gadget" button or link.
 *   </li>
 *   <li>
 *      a "personalization done" button or link, which is initially hidden.
 *   </li>
 * </ul>
 * <p>
 * The "personalization done" button may be unnecessary.  The popup window
 * manager will attempt to detect when the window closes.  However, the
 * "personalization done" button should still be displayed to handle cases
 * where the popup manager is unable to detect that a window has closed.  This
 * allows the user to signal approval manually.
 * </p>
 * </li>
 *
 * <li>
 * Gadget creates a popup object and associates event handlers with the UI
 * elements:
 *
 * <pre>
 *    // Called when the user opens the popup window.
 *    var onOpen = function() {
 *      $("personalizeDone").style.display = "block"
 *    }
 *    // Called when the user closes the popup window.
 *    var onClose = function() {
 *      $("personalizeDone").style.display = "none"
 *      fetchData();
 *    }
 *    var popup = new gadgets.oauth.Popup(
 *        response.oauthApprovalUrl,
 *        "height=300,width=200",
 *        onOpen,
 *        onClose
 *    );
 *
 *    personalizeButton.onclick = popup.createOpenerOnClick();
 *    personalizeDoneButton.onclick = popup.createApprovedOnClick();
 * </pre>
 * </li>
 *
 * <li>
 * <p>
 * When the user clicks the personalization button/link, a window is opened
 * to the approval URL.  The onOpen function is called to notify the gadget
 * that the window was opened.
 * </p>
 * </li>
 *
 * <li>
 * <p>
 * When the window is closed, the popup manager calls the onClose function
 * and the gadget attempts to fetch the user's data.
 * </p>
 * </li>
 * </ol>
 *
 * @constructor
 *
 * @description used to create a new OAuth popup window manager.
 *
 * @param {string} destination Target URL for the popup window.
 * @param {string} windowOptions Options for window.open, used to specify
 *     look and feel of the window.
 * @param {function()} openCallback Function to call when the window is opened.
 * @param {function()} closeCallback Function to call when the window is closed.
 */
gadgets.oauth.Popup = function(destination, windowOptions, openCallback,
    closeCallback) {
  this.destination_ = destination;
  this.windowOptions_ = windowOptions;
  this.openCallback_ = openCallback;
  this.closeCallback_ = closeCallback;
  this.win_ = null;
};

/**
 * @return {function()} an onclick handler for the "open the approval window" link.
 */
gadgets.oauth.Popup.prototype.createOpenerOnClick = function() {
  var self = this;
  return function() {
    self.onClick_();
  };
};

/**
 * Called when the user clicks to open the popup window.
 *
 * @return {boolean} false to prevent the default action for the click.
 * @private
 */
gadgets.oauth.Popup.prototype.onClick_ = function() {
  // If a popup blocker blocks the window, we do nothing.  The user will
  // need to approve the popup, then click again to open the window.
  // Note that because we don't call window.open until the user has clicked
  // something the popup blockers *should* let us through.
  this.win_ = window.open(this.destination_, '_blank', this.windowOptions_);
  if (this.win_) {
    // Poll every 100ms to check if the window has been closed
    var self = this;
    var closure = function() {
      self.checkClosed_();
    };
    this.timer_ = window.setInterval(closure, 100);
    this.openCallback_();
  }
  return false;
};

/**
 * Called at intervals to check whether the window has closed.
 * @private
 */
gadgets.oauth.Popup.prototype.checkClosed_ = function() {
  if ((!this.win_) || this.win_.closed) {
    this.win_ = null;
    this.handleApproval_();
  }
};

/**
 * Called when we recieve an indication the user has approved access, either
 * because they closed the popup window or clicked an "I've approved" button.
 * @private
 */
gadgets.oauth.Popup.prototype.handleApproval_ = function() {
  if (this.timer_) {
    window.clearInterval(this.timer_);
    this.timer_ = null;
  }
  if (this.win_) {
    this.win_.close();
    this.win_ = null;
  }
  this.closeCallback_();
  return false;
};

/**
 * @return {function()} an onclick handler for the "I've approved" link.  This may not
 * ever be called.  If we successfully detect that the window was closed,
 * this link is unnecessary.
 */
gadgets.oauth.Popup.prototype.createApprovedOnClick = function() {
  var self = this;
  return function() {
    self.handleApproval_();
  };
};
;