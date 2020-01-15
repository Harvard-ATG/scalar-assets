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
		var url = window.location.href;
		var pageSlug = window.location.pathname.split("/").pop();
		console.log(url);
		console.log(pageSlug);
		let colorize = true;
    createToggleButton(colorize);
    getScalarNode(pageSlug, processHtml);

		function getScalarNode(nodeSlug, callback){
			console.log("getting scalar node");
			// var scalar_api_json_uri = pageUri + ".rdfjson";
			var scalar_api_json_uri = url + ".rdfjson";
			console.log(scalar_api_json_uri);
			$.getJSON(scalar_api_json_uri, function(data){
				console.log("Got Scalar data!");
				console.log(data);
				let latest = data[url]["http://scalar.usc.edu/2012/01/scalar-ns#version"][0].value;
				let node = data[latest];
				var window.raw_content = node["http://rdfs.org/sioc/ns#content"][0].value;
				callback(raw_content);
			})
		}

		function processHtml(content){
			console.log("process html");
			colorizehtml(raw_content).then(function(response){
				console.log("colorized");
				console.log(response);
        var window.colorized_content = response;
				if(colorize){
					$( "span[property='sioc:content']" ).html(colorized_content);
				}
			});
		}



    function createToggleButton(colorize_text=true){
      var ru_toggle = `<img class="ru-toggle" title="" data-toggle="popover" data-colorize="${colorize_text}"data-placement="bottom" src="https://harvard-atg.github.io/scalar-assets/static/img/ru_flag_round_250.png" alt="Russian colorize toggle">`;
      $(body).append(ru_toggle);
      $(".ru-toggle").click(toggleColorization());
    }

		function toggleColorization(){
      console.log("colorize toggled");
			console.log(this);
      if($(this).data("colorize") == true){
        $(this).data("colorize", false);
				colorize = false;
        $( "span[property='sioc:content']" ).html(raw_content);
      } else {
        $(this).data("colorize", true);
				colorize = true;
        $( "span[property='sioc:content']" ).html(colorized_content);
      }
		}


	})
});

})(window, jQuery);
