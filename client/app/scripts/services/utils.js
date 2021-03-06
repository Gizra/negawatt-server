'use strict';

angular.module('negawattClientApp')
  .service('Utils', function (md5) {
    var Utils = this;
    /**
     * Base64 encode / decode
     * http://www.webtoolkit.info/
     *
     */
    this.Base64 = {
      // private property
      _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      // public method for encoding
      encode: function (input) {
        var output = '';
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Utils.Base64._utf8_encode(input);
        while (i < input.length) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }
          output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
      },
      // private method for UTF-8 encoding
      _utf8_encode: function (string) {
        string = string.replace(/\r\n/g, '\n');
        var utftext = '';
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          }
          else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
          }
        }
        return utftext;
      }
    };

    /**
     * Convert an array of objects to an object index by property id.
     *
     * @param list {*[]}
     *  List of objects.
     *
     * @returns {*}
     *  Object indexed with properties id of each item.
     */
    this.indexById = function (list) {
      var indexed = {};
      angular.forEach(list, function (item) {
        this[item.id] = item;
      }, indexed);

      return indexed;
    };

    /**
     * Convert a object properties to an array.
     *
     * @param {*} object
     *    The Object.
     *
     * @returns {Array}
     *    Collection of the object's properties into an array.
     */
    this.toArray = function (object) {
      var result = [];

      angular.forEach(object, function (property) {
        this.push(property);
      }, result);

      return result;
    };

    /**
     * Convert a object to a hash code.
     *
     * @param object
     *   JSON Format object.
     *
     * @returns {string}
     *   Hash code
     */
    this.objToHash = function(obj) {
      return obj && md5.createHash(JSON.stringify(obj));
    }

    /**
     * Clean undefined properties from the obj.
     *
     * @param obj
     *  The object wit properties undefined.
     *
     * @returns {*}
     *  The object cleaned.
     */
    this.cleanProperties = function(obj) {
      angular.forEach(obj, function(item, key) {
        if (angular.isUndefined(item)) {
          delete obj[key];
        }
      });

      return obj;
    }

    /**
     * Check if an object or array is empty.
     *
     * @param obj
     *  The Object ot Array
     *
     * @returns {boolean|*}
     *  Return true is Object|Array is empty, otherwise false.
     */
    this.isEmpty = function(obj) {
      return angular.isUndefined(obj) || obj === null || angular.isObject(obj) && !Object.keys(obj).length;
    }
  });
