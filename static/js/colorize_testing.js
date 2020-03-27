(function(global, $) {
  "use strict";
	const ApiClient = global.app.ApiClient;

	function colorize_elements(elements, params={}){
		const api = new ApiClient();
		// params['attribute'] = "data";
		return api.colorize_elements(elements, params).then((res) => {
			return res;
		});
	}

$( document ).ready( function() {
	$('body').on('pageLoadComplete',function() {
		var page_url = window.location.origin + window.location.pathname;
		var pageSlug = window.location.pathname.split("/").pop();
		let colorize = true;
		let language = null;
		let colorSafe = false;
		let colorizeTooltip = false;

		window.parsed_text = {
			"raw": {
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
			console.log("swapping nodes");
			for(var key in parsed_text[source]){
				replaceTextNode(key, source);
			}
		}

		function main(){
			console.log("main running");

			var bodyCopies = document.querySelectorAll(".body_copy");

			function getNodes(item){
				return new Promise((resolve, reject) => {
					resolve(getTextNodes(item));
				})
			}
			let promiseArray = Array.from(bodyCopies).map(getNodes);
			Promise.all(promiseArray).then(results => {
				console.log("all promises finshed");
				var payload = {
					"elements": parsed_text['raw']
				}
				console.log(payload);
				colorize_elements(payload).then(function(response){
					window.parsed_text['processed'] = response['data']['elements'];
					if(colorize){
						createToggleButton(colorize);
						swapNodes("processed");
					}
				});
			})
		}

    function createToggleButton(colorize_text=true){
      var ru_toggle = `<img class="ru-toggle" title="" data-toggle="popover" data-colorize="${colorize_text}" data-placement="bottom" src="https://harvard-atg.github.io/scalar-assets/static/img/ru_flag_round_250.png" alt="Russian colorize toggle">`;
			$("body").append(ru_toggle);
			let toggle_position = $(".ru-toggle").position();

			var tooltip = `<div class="popover caption_font fade left in" role="tooltip" id="colorizeTooltip" style="position:fixed;top:${toggle_position.top - 29}px; left:${toggle_position.left - 250}px"><div class="arrow" style="top:50%"></div><h3 class="popover-title" style="display:none"></h3><div class="popover-content">Toggle Colorization (Word Levels)</div><span class="popover-content vertical-line"><span style="margin-right:10px">Colorsafe?</span><input id="colorsafe" type="checkbox"></span></div>`;

			$(tooltip).insertAfter(".ru-toggle");
      $(".ru-toggle").click(toggleColorization);

			$(".ru-toggle").mouseover(function(){
				colorizeTooltip = true;
				$("#colorizeTooltip").show();
			})
			$(".ru-toggle").mouseout(function(){
				colorizeTooltip = false;
				setTimeout(function(){ $("#colorizeTooltip").hide(); }, 1000);
			})

			$("#colorizeTooltip").mouseover(function(){
				console.log("tooltip mousedover");
				colorizeTooltip = true;
				$("#colorizeTooltip").stop();
				$("#colorizeTooltip").show();
			})
			$("#colorizeTooltip").mouseout(function(){
				console.log("tooltip mousedout");
				colorizeTooltip = false;
				$("#colorizeTooltip").stop();
				setTimeout(function(){ $("#colorizeTooltip").hide(); }, 1000);
			})

			$("#colorsafe").change(function(){
				console.log("colorsafe clicked");
				if(this.checked){
					colorSafe = true;
				} else {
					colorSafe = false;
				}
				toggleColorSafe();
			})
    }

		function toggleColorization(){
      // if($(this).data("colorize") == true){
      //   $(this).data("colorize", false);
			if(colorize){
				colorize = false;
				swapNodes("raw");
				$(".ru-toggle").css({"opacity": ".25"});
      } else {
        // $(this).data("colorize", true);
				colorize = true;
				swapNodes("processed");
				$(".ru-toggle").css({"opacity": ".75"});
      }
		}

		function toggleColorSafe(){
			console.log("colorsafe!")
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

		main();

	})
});

})(window, jQuery);
