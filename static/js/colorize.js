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

// async function processHtml() {
// 	const input_html = $("#contentinput").val();
// 	writeframe('inputpreview', input_html);
// 	writeframe('outputpreview', 'Processing...');

// 	const output_html = await colorizehtml(input_html);
// 	writeframe('outputpreview', output_html);
// 	$("#outputhtml").val(output_html);
// 	$("#results").show();
// }

function writeframe(id, html) {
	var iframe = document.createElement('iframe');
	iframe.className = "previewhtml";
	document.getElementById(id).innerHTML = "";
	document.getElementById(id).appendChild(iframe);

	// Note: using this method instead of:
	//    iframe.src = 'data:text/html;charset=utf-8,' + encodeURI(html);
	// because it handles larger strings/html
	iframe.contentWindow.document.open();
	iframe.contentWindow.document.write(html);
	iframe.contentWindow.document.close();
}

function copy() {
	var copyText = document.querySelector("#outputhtml");
	copyText.select();
	document.execCommand("copy");
}

$( document ).ready( function() {
	// $('body').on('pageLoadComplete',function() {

	// function setBook(){
	// 	console.log("SET BOOK");
	// 	let bookconfig = {
	// 		bookUrl: window.location.href,
	// 		pageSlug: window.location.pathname.split("/").pop(),
	// 	}
	// 	// var bookUrl = window.location.href;
	// 	// var pageSlug = window.location.pathname.split("/").pop();
	// 	scalarapi.setBook(bookconfig.bookUrl);
	// 	return Promise.resolve(bookconfig);
	// }
	//
	// function loadNode(config){
	// 	console.log("LOAD NODE");
	// 	console.log(config);
	// 	scalarapi.loadNode(config.pageSlug, true, handleSuccess, handleFailure);
	// }

	// function main(){
	// 	console.log("main");
	// 	setBook()
	// 		.then(loadNode())
	// 	// let q = setBook();
	// 	// console.log(q);
	// }
	// main();



		// new Promise(function(resolve, reject){
		// 	console.log("1");
		// 	let bookUrl = window.location.href;
		// 	var pageSlug = window.location.pathname.split("/").pop();
		// 	scalarapi.setBook(bookUrl);
		// }).then(function(result){
		// 	console.log("2");
		// 	return new Promise((resolve, reject) => {
		// 		scalarapi.loadNode(pageSlug, true, handleSuccess, handleFailure)
		// 	})
		// })
		var bookUrl = window.location.href;
		var pageSlug = window.location.pathname.split("/").pop();
		console.log(bookUrl);
		console.log(pageSlug);

		if(bookUrl.includes("scalar.fas.harvard.edu")){
			//console.log(`Scalar API book url set to ${bookUrl}`);
			console.log("Scalae API book url set to https://scalar.fas.harvard.edu/foundationsofrussian/");
			//scalarapi.setBook(bookUrl);
			scalarapi.setBook("https://scalar.fas.harvard.edu/foundationsofrussian");
		} else {
			console.log("Scalar API book url - default book and page");
			// pageSlug = "russian-test-2"
			// scalarapi.setBook( "https://scalar.fas.harvard.edu/cole---test-book" );
			scalarapi.setBook("https://scalar.fas.harvard.edu/foundationsofrussian");
			var pageSlug = "cole---test-page";
			var pageUri = "https://scalar.fas.harvard.edu/foundationsofrussian/cole---test-page";
		}

		if ( scalarapi.loadNode( pageSlug, true, handleSuccess, handleFailure) == "loaded" ) {
			// handleSuccess();
		};

		// function handleSuccess(){
		// 	console.log("success");
		// 	getScalarNode(pageSlug)
		// 		.then(processHtml())
		// 		.then(swapHtml())
		// }

		function getScalarNode(nodeSlug, callback){
			console.log("getting scalar node");
			const node = scalarapi.getNode(pageUri);
			//const node = scalarapi.getNode(pageSlug);

			setTimeout(function(){
				console.log("Got Scalar node");
				console.log(node);
				// let content = node.versions[0].content;
	      let content = node.current.content;
				callback(content);
			}, 1000);
		}

		function processHtml(content, callback){
			console.log("process html");
			const output_html = colorizehtml(content).then(function(response){
				console.log("colorized");
        console.log(response);
				$( "span[property='sioc:content']" ).html(response);
      });
		}

		// function swapHtml(html){
		// 	console.log("swap");
		// 	console.log(html);
		// 	$("article.page" > "span[property='sioc:content']").html(html);
		// }


		function handleSuccess(){
			getScalarNode(pageSlug, function(data){
				console.log("DATA");
				console.log(data);
				//processHtml(data, swapHtml);
				processHtml(data);
			})
			//getScalarNode(pageSlug, processHtml);
			// Get Scalar Node - return content
			// Colorify the content
			// Swap the HTML
			// return new Promise(function(resolve, reject){
			// 	const node = await scalarapi.getNode(pageSlug);
			// })

		}

		// if ( scalarapi.loadNode( pageSlug, true, handleSuccess, handleFailure) == "loaded" ) {
		// 	// handleSuccess();
		// };

		// async function processHtml(content){
		// 	console.log("process html");
		// 	const output_html = await colorizehtml(content);
		// 	console.log("HHH")
		// 	console.log(output_html);
		// 	return(output_html);
		// }
		//
		// async function swapHtml(html){
		// 	console.log("swap");
		// 	console.log(html);
		// }
		//
		// async function getScalarNode(nodeSlug){
		// 	console.log("getting scalar node");
		// 	const node = await scalarapi.getNode(pageSlug);
		// 	console.log("Got Scalar node");
		// 	console.log(node);
		// 	// let content = node.versions[0].content;
    //   let content = node.current.content;
		// 	return(content);
		// }

		// function handleSuccess() {
		// 	console.log(pageSlug);
		// 	// var node = scalarapi.getNode( thisPageSlug );
		// 	var node, content;
		// 	var node_promise = getScalarNode(pageSlug);
		// 	node_promise.then(function(data){
		// 		node = data;
		// 		console.log("inside node_promise");
		// 		console.log("Node:");
		// 		console.log(node);
		// 		content = node.versions[0].content;
		// 	});
		// 	// var content = node.versions[0].content;
		// 	var promise = processHtml(content);
		// 	console.log(promise);
		// 	var colorized;
		// 	promise.then(function(data){
		// 		console.log("data");
		// 		console.log(data);
		// 		console.log("inside process promise");
		// 		colorized = data;
		// 		$( "span[property='sioc:content']" ).html(colorized);
		// 		console.log("Data colorized.")
		// 	})
		// }
		//
		function handleFailure() {
			console.log("The node could not be loaded. Colorization failed.")
		}
	// });
});

})(window, jQuery);
