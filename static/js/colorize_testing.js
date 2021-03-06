(function(global, $) {
  "use strict";
	const ApiClient = global.app.ApiClient;

	function colorize_elements(elements, params={}){
		const api = new ApiClient();
		return api.colorize_elements(elements, params).then((res) => {
			return res;
		});
	}

$( document ).ready( function() {
	$('body').on('pageLoadComplete',function() {
		var pageUrl = window.location.origin + window.location.pathname;
		var pageSlug = window.location.pathname.split("/").pop();
		let colorize = true;
		let language = false;
		let colorSafe = false;
		let colorizeTooltip = false;
		window.parsed_text = {
			"raw": {
			},
			"processed": {
			}
		}

		var setLanguage = function(url){
			var scalar_api_json_uri = url + ".rdfjson";
			return new Promise(function(resolve, reject){
				$.getJSON(scalar_api_json_uri, function(data){
					let latest = data[url]["http://scalar.usc.edu/2012/01/scalar-ns#version"][0].value;
					let node = data[latest];
					try {
						language = node["http://purl.org/dc/terms/language"][0].value;
						resolve(language);
					}
					catch(err){
						console.log("No language set at dcterms:language metadata");
						language = null;
						resolve(language);
					}

				});
			})
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
				parsed_text.raw[id] = node.data;
				return true;
	    } else {
	        return false;
	    }
		}

		function replaceTextNode(id, source="processed"){
			if(source == "processed" || source == "raw"){
				try {
					document.querySelector(`[id="${id}"]`).innerHTML = parsed_text[source][id];
					return true;
				}
				catch(err){
					console.log("Error: text node not replaced.")
					console.log(err);
					return false;
				}
			} else {
				console.log("Invalid source.")
				return false;
			}
		}

		function swapNodes(source="processed"){
			//console.log("swapping nodes");
			for(var key in parsed_text[source]){
				replaceTextNode(key, source);
			}
		}

		function main(){
			console.log("main running");

			if(language !== "English"){
				var bodyCopies = document.querySelectorAll(".body_copy");
				function getNodes(item){
					return new Promise((resolve, reject) => {
						resolve(getTextNodes(item));
					})
				}
				let promiseArray = Array.from(bodyCopies).map(getNodes);
				Promise.all(promiseArray).then(results => {
					// console.log("all promises finshed");
					var payload = {
						"elements": parsed_text['raw']
					}
					//console.log(payload);
					colorize_elements(payload).then(function(response){
						window.parsed_text['processed'] = response['data']['elements'];
						if(colorize){
							createToggleButton(colorize);
							swapNodes("processed");
						}
					});
				})
			}
		}

    function createToggleButton(colorize_text=true){
      var ru_toggle = `<img class="ru-toggle" title="" data-toggle="popover" data-colorize="${colorize_text}" data-placement="bottom" src="https://harvard-atg.github.io/scalar-assets/static/img/ru_flag_round_250.png" alt="Russian colorize toggle">`;
			$("body").append(ru_toggle);
			let toggle_position = $(".ru-toggle").position();

			var tooltip = `<div class="popover caption_font fade left in" role="tooltip" id="colorizeTooltip" style="position:fixed;top:${toggle_position.top - 24}px; left:${toggle_position.left - 150}px"><div class="arrow" style="top:50%"></div><h3 class="popover-title">Toggle Word Levels</h3><div class="popover-content vertical-line" style="text-align:center"><span style="margin-right:10px">Colorsafe?</span><input id="colorsafe" type="checkbox"></div></div>`;

			$(tooltip).insertAfter(".ru-toggle");
      $(".ru-toggle").click(toggleColorization);

			$(".ru-toggle").mouseover(function(){
				colorizeTooltip = true;
				$("#colorizeTooltip").show();
			})
			$(".ru-toggle").mouseout(function(){
				colorizeTooltip = false;
				setTimeout(function(){
					if(!colorizeTooltip){
						$("#colorizeTooltip").hide();
					}
				}, 1000);
			})

			$("#colorizeTooltip").mouseover(function(){
				// console.log("tooltip mousedover");
				colorizeTooltip = true;
				$("#colorizeTooltip").stop();
			})
			$("#colorizeTooltip").mouseout(function(){
				// console.log("tooltip mousedout");
				colorizeTooltip = false;
				setTimeout(function(){
					if(!colorizeTooltip){
						$("#colorizeTooltip").hide();
					}
				}, 1000);
			})

			$("#colorsafe").change(function(){
				// console.log("colorsafe clicked");
				if(this.checked){
					colorSafe = true;
				} else {
					colorSafe = false;
				}
				toggleColorSafe();
			})
    }

		function toggleColorization(){
			if(colorize){
				colorize = false;
				swapNodes("raw");
				$(".ru-toggle").css({"opacity": ".25"});
      } else {
				colorize = true;
				swapNodes("processed");
				$(".ru-toggle").css({"opacity": ".75"});
      }
		}

		function toggleColorSafe(){
			// console.log("colorsafe!")
			let words = document.querySelectorAll('[data-level="1E"], [data-level="2I"], [data-level="3A"], [data-level="3AU"], [data-level="4S"], [data-level="4SU"], [data-level="5U"], [data-level="6U"], .word, .wordlevel1, .wordlevel2, .wordlevel3, .wordlevel4, .wordlevel5, .wordlevel6');
			if(colorSafe){
				words.forEach(function(word){
					word.classList.add("colorSafe");
				})
			} else {
				words.forEach(function(word){
					word.classList.remove("colorSafe");
				})
			}
		}

		setLanguage(pageUrl)
			.then(function(){
				main();
			})

	})
});

})(window, jQuery);
