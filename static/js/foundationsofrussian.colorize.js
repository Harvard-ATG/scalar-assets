(function($) {
	"use strict";

	function main() {
		console.log("colorize activated", window.location.pathname);
	}

	if(typeof $ === "undefined") {
		console.log("error: jQuery is not defined!");
	} else {
		main();
	}
})(jQuery);
