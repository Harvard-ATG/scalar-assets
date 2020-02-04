(function(global, $) {
  "use strict";
	const ApiClient = global.app.ApiClient;

	function colorizehtml(input_html) {
		const api = new ApiClient();
		var params = {
			"attribute": "data",
		}
		return api.colorizehtml(input_html, params).then((res) => {
			return res;
		});
	}

$( document ).ready( function() {
	$('body').on('pageLoadComplete',function() {
		var page_url = window.location.origin + window.location.pathname;
		var pageSlug = window.location.pathname.split("/").pop();
		let colorize = true;
		let language = null;
    // createToggleButton(colorize);
    getScalarNode(page_url, processHtml);

		function getScalarNode(url, callback){
			var scalar_api_json_uri = url + ".rdfjson";
			$.getJSON(scalar_api_json_uri, function(data){
				let latest = data[url]["http://scalar.usc.edu/2012/01/scalar-ns#version"][0].value;
				let node = data[latest];
				try {
					window.raw_content = node["http://rdfs.org/sioc/ns#content"][0].value;
				}
				catch(err){
					console.log("No content in page");
				}
				try {
					language = node["http://purl.org/dc/terms/language"][0].value;
					console.log(language)
				}
				catch(err){
					console.log("No language set at dcterms:language metadata");
				}
				let prefix = "<div class='paragraph_wrapper'><div class='body_copy'>";
				let suffix = "</div></div>"
				window.raw_content_wrapped = `${prefix}${raw_content}${suffix}`;
				if(language !== "English"){
					callback(raw_content_wrapped);
				}
			})
		}

		function processHtml(content){
			colorizehtml(content).then(function(response){
        window.colorized_content = response;
				if(colorize){
					createToggleButton(colorize);
					$( "span[property='sioc:content']" ).html(colorized_content);
				}
			});
		}



    function createToggleButton(colorize_text=true){
      var ru_toggle = `<img class="ru-toggle" title="" data-toggle="popover" data-colorize="${colorize_text}"data-placement="bottom" src="https://harvard-atg.github.io/scalar-assets/static/img/ru_flag_round_250.png" alt="Russian colorize toggle">`;
			$("body").append(ru_toggle);
			let toggle_position = $(".ru-toggle").position();

			var tooltip = `<div class="popover caption_font fade left in" role="tooltip" id="colorize_tooltip" style="position:fixed;top:${toggle_position.top - 4}px; left:${toggle_position.left - 250}px">
			<div class="arrow" style="top:50%"></div><h3 class="popover-title" style="display:none"></h3><div class="popover-content">Toggle Colorization (Word Levels)</div></div>`
			$(tooltip).insertAfter(".ru-toggle");
      $(".ru-toggle").click(toggleColorization);
			$(".ru-toggle").mouseover(function(){
				$("#colorize_tooltip").toggle();
			})
			$(".ru-toggle").mouseout(function(){
				$("#colorize_tooltip").toggle();
			})
    }

		function toggleColorization(){
      if($(this).data("colorize") == true){
        $(this).data("colorize", false);
				colorize = false;
        $( "span[property='sioc:content']" ).html(raw_content_wrapped);
				$(".ru-toggle").css({"opacity": ".25"});
      } else {
        $(this).data("colorize", true);
				colorize = true;
        $( "span[property='sioc:content']" ).html(colorized_content);
				$(".ru-toggle").css({"opacity": ".75"});
      }
		}


	})
});

})(window, jQuery);
