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
		// Testing ScalarAPI JS
		// if (scalarapi.loadNode("----", true, handleSuccess, handleFailure, 1 ) == "loaded" ) {
		// 	console.log("loaded");
		// 	handleSuccess();
		// }
		// function handleSuccess(){
		// 	var node = scalarapi.getNode("----");
		// 	console.log(node);
		// }
		//
		// function handleFailure(){
		// 	console.log("Failed. Node not loaded")
		// }

		var page_url = window.location.origin + window.location.pathname;
		var pageSlug = window.location.pathname.split("/").pop();
		let colorize = true;
		let language = null;
		let color_safe = false;
		let colorize_tooltip = false;

		var parsed_text = {
			"original": {
			},
			"processed": {
			}
		}

		function getTextNodes(parent){
			var nodes = parent.childNodes;
			var textNodes = [];
			var otherNodes = [];

			nodes.forEach(function(node){
				if(node.nodeType === 3){
					textNodes.push(node);
					wrapNode(node, parent);
				} else {
					otherNodes.push(node);
					getTextNodes(node);
				}
			});
			return textNodes;
		}

		function notJustPunct(str){
			const cyrillicAndRomanRegex = /[\u0400-\u04FFa-zA-Z]/gi;
			var found = str.match(cyrillicAndRomanRegex);
			return(found !== null);
		}

		function wrapNode(node, parent){
			if(notJustPunct(node.data)){
        let spanEl = document.createElement("span");
				let id = uuidv4(); // https://github.com/uuidjs/uuid
				spanEl.setAttribute("id", id);
        parent.insertBefore(spanEl, node);
        spanEl.appendChild(node);
				parsed_text.original[id] = node.data;
	    } else {
	        return false;
	    }
		}

		function replaceTextNode(id, type="processed"){
			if(type == "processed" || type == "original"){
				document.querySelector(`[id="${id}"]`).innerHTML = parsed_text[type][id];
			} else {
				return false;
			}
		}

		function swapNodes(type="processed"){
			for(var key in parsed_text[type]){
				replaceTextNode(key, type=type);
			}
		}

		function main(){
			var body_copies = document.querySelectorAll(".body_copy");
			body_copies.forEach(function(el){
				getTextNodes(el);
			});

			payload = {
				"elements": parsed_text['original']
			}

			// When complete, call the API
			colorize_elements(payload).then(function(response){
				parsed_text['processed'] = response['data']['elements'];
				if(colorize){
					createToggleButton(colorize);
					swapNodes(type="processed");
				}
			});
		}

		main();



		// var page_url = window.location.origin + window.location.pathname;
		// var pageSlug = window.location.pathname.split("/").pop();
		// let colorize = true;
		// let language = null;
		// let color_safe = false;
		// let colorize_tooltip = false;
    // createToggleButton(colorize);
    // getScalarNode(page_url, processHtml);

		function getScalarNode(url, callback){
			var scalar_api_json_uri = url + ".rdfjson";
			$.getJSON(scalar_api_json_uri, function(data){
				let latest = data[url]["http://scalar.usc.edu/2012/01/scalar-ns#version"][0].value;
				let node = data[latest];
				console.log(data);
				try {
					window.raw_content = node["http://rdfs.org/sioc/ns#content"][0].value;
          console.log(window.raw_content);
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

			var tooltip = `<div class="popover caption_font fade left in" role="tooltip" id="colorize_tooltip" style="position:fixed;top:${toggle_position.top - 29}px; left:${toggle_position.left - 250}px"><div class="arrow" style="top:50%"></div><h3 class="popover-title" style="display:none"></h3><div class="popover-content">Toggle Colorization (Word Levels)</div><div class="popover-content vertical-line"><span style="margin-right:10px">Colorsafe?</span><label class="switch"><input id="colorsafe" type="checkbox"><span class="slider round"></span></label></div></div>`
			$(tooltip).insertAfter(".ru-toggle");
      $(".ru-toggle").click(toggleColorization);

			$(".ru-toggle").mouseover(function(){
				colorize_tooltip = true;
				$("#colorize_tooltip").show();
			})
			$(".ru-toggle").mouseout(function(){
				colorize_tooltip = false;
				setTimeout(function(){ $("#colorize_tooltip").hide(); }, 1000);
			})

			$("#colorize_tooltip").mouseover(function(){
				console.log("tooltip mousedover");
				colorize_tooltip = true;
				$("#colorize_tooltip").stop();
				$("#colorize_tooltip").show();
			})
			$("#colorize_tooltip").mouseout(function(){
				console.log("tooltip mousedout");
				colorize_tooltip = false;
				$("#colorize_tooltip").stop();
				setTimeout(function(){ $("#colorize_tooltip").hide(); }, 1000);
			})

			$("#colorsafe").change(function(){
				console.log("colorsafe clicked");
				if(this.checked){
					color_safe = true;
				} else {
					color_safe = false;
				}
				toggleColorSafe();
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

		function toggleColorSafe(){
			console.log("colorsafe!")
			let words = $(".word", ".wordlevel1", ".wordlevel2", ".wordlevel3", ".wordlevel4", ".wordlevel5", ".wordlevel6", "[data-level='1E']", "[data-level='2I']", "[data-level='3A']", "[data-level='3AU']", "[data-level='4S']", "[data-level='4SU']", "[data-level=5U']", "[data-level='6U']");
			console.log(words);
			if(color_safe){
				words.each(function(word){
					word.addClass("colorSafe");
				})
			} else {
				words.each(function(word){
					word.removeClass("colorSafe");
				})
			}

		}


	})
});

})(window, jQuery);
