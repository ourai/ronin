/*!
 * Jigsaw
 * 
 * Developed by Ourai Lin, http://ourai.ws/
 * 
 * Copyright (c) 2013 JavaScript Revolution
 */
define(function( require, exports, module ) {

var data = [
        [require( "./core/main" ), "Core.Global"],
        [require( "./core/object" ), "Core.Object"],
        [require( "./core/array" ), "Core.Array"],
        [require( "./core/string" ), "Core.String"]
    ];
var Constructor = require("./core/constructor");

module.exports = new Constructor(data, true);

});
