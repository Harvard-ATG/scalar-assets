(function($) {
	"use strict";

	function main() {
		console.log("colorize", window.location.pathname);
	}

	if(typeof $ === "undefined") {
		console.log("error: jQuery is not defined!");
	} else {
		main();
	}
})(jQuery);
