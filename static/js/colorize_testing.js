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

		var testBlob = {
	   "elements":{
	      "ef23c62f-759a-40ca-9401-6f5fff6aae6e":"[01-01] В аудито́рии университе́та",
	      "f7464298-7a7a-4b41-8e51-f1ddc005576d":"— Приве́т! Как тебя зову́т?",
	      "2ff91b9b-2fe9-4665-bbc5-1dd4c5288b9c":"— Ле́на. А тебя?",
	      "3c28e678-5f64-43ec-a391-6fa16cadef00":"— Ви́ктор. Очень прия́тно.",
	      "1f45c3c7-3189-4995-8913-9e591de4fa03":"— Мне то́же. Ты отку́да?",
	      "922450d8-18a6-4558-9168-556865199b0d":"— Я из Каза́ни, а ты?",
	      "065681d0-ea4e-4e2a-a051-32b95d5b72f8":"— Я из Пско́ва. На како́м факульте́те ты у́чишься?",
	      "95a61edf-69ec-4bf1-b971-d0f24a1794ec":"— Я то́лько что поступи́л на факульте́т журнали́стики. Я на первом курсе. А ты?",
	      "6d5f8888-f92c-4b9f-ad71-ef5386a1e3e7":"— А я учу́сь на тре́тьем ку́рсе на факульте́те политоло́гии.",
	      "f0cc536c-4c56-4ea1-9cce-d1853be4b6ba":"[01-02] На заня́тии",
	      "01b9281f-e919-45ac-aa03-c80a072ae48f":"— Здра́вствуйте! Меня зову́т Ольга Алекса́ндровна. Я ваш но́вый преподава́тель ру́сского языка́. А тепе́рь ва́ша о́чередь. Предста́вьтесь, пожа́луйста.",
	      "d34d1db0-e58f-41ff-bf27-0ccdb15daf2d":"— Здра́вствуйте! Меня зову́т Джейк. Я учу́сь на пе́рвом ку́рсе. Я изуча́ю русский язык и литерату́ру.",
	      "88f26807-1679-4a95-a4f9-6c1d02f49c39":"— До́брый день! Меня зову́т Ло́ра. Я студе́нтка Га́рвардского университе́та. Я учу́сь на пе́рвом ку́рсе магистрату́ры. Я изуча́ю политоло́гию и стра́ны Восто́чной Евро́пы.",
	      "9b6f2e61-60c4-4343-85d0-4f6a87c5d8ad":"твоя́/ва́ша о́чередь your turn"
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

		function replaceTextNode(id, type="processed"){
			if(type == "processed" || type == "raw"){
				try {
					document.querySelector(`[id="${id}"]`).innerHTML = parsed_text[type][id];
					return true;
				}
				catch(err){
					console.log("Error: text node not replaced.")
					console.log(err);
					return false;
				}
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
			console.log("main running");

			var bodyCopies = document.querySelectorAll(".body_copy");
			// bodyCopies.forEach(function(el){
			// 	getTextNodes(el);
			// });

			function getNodes(item){
				return new Promise((resolve, reject) => {
					resolve(getTextNodes(item));
				})
			}
			let promiseArray = Array.from(bodyCopies).map(getNodes);
			Promise.all(promiseArray).then(results => {
				console.log("all promises finshed");
				console.log("TEST");
				console.log(testBlob);
				colorize_elements(testBlob).then(function(response){
					console.log(response);
				})
				var payload = {
					"elements": parsed_text['raw']
				}
				console.log(payload);
				colorize_elements(payload).then(function(response){
					console.log(response);
					window.parsed_text['processed'] = response['data']['elements'];
					if(colorize){
						createToggleButton(colorize);
						swapNodes(type="processed");
					}
				});
			})
		}

    function createToggleButton(colorize_text=true){
      var ru_toggle = `<img class="ru-toggle" title="" data-toggle="popover" data-colorize="${colorize_text}"data-placement="bottom" src="https://harvard-atg.github.io/scalar-assets/static/img/ru_flag_round_250.png" alt="Russian colorize toggle">`;
			$("body").append(ru_toggle);
			let toggle_position = $(".ru-toggle").position();

			var tooltip = `<div class="popover caption_font fade left in" role="tooltip" id="colorizeTooltip" style="position:fixed;top:${toggle_position.top - 29}px; left:${toggle_position.left - 250}px"><div class="arrow" style="top:50%"></div><h3 class="popover-title" style="display:none"></h3><div class="popover-content">Toggle Colorization (Word Levels)</div><div class="popover-content vertical-line"><span style="margin-right:10px">Colorsafe?</span><label class="switch"><input id="colorsafe" type="checkbox"><span class="slider round"></span></label></div></div>`
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
      if($(this).data("colorize") == true){
        $(this).data("colorize", false);
				colorize = false;
				swapNodes(type="raw");
				$(".ru-toggle").css({"opacity": ".25"});
      } else {
        $(this).data("colorize", true);
				colorize = true;
				swapNodes(type="processed");
				$(".ru-toggle").css({"opacity": ".75"});
      }
		}

		function toggleColorSafe(){
			console.log("colorsafe!")
			let words = $(".word", ".wordlevel1", ".wordlevel2", ".wordlevel3", ".wordlevel4", ".wordlevel5", ".wordlevel6", "[data-level='1E']", "[data-level='2I']", "[data-level='3A']", "[data-level='3AU']", "[data-level='4S']", "[data-level='4SU']", "[data-level=5U']", "[data-level='6U']");
			console.log(words);
			if(colorSafe){
				words.each(function(word){
					word.addClass("colorSafe");
				})
			} else {
				words.each(function(word){
					word.removeClass("colorSafe");
				})
			}
		}

		main();

	})
});

})(window, jQuery);
