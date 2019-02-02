var websites_list = {"mangahere":"mangahere.cc/manga/",
					"mangafox":"fanfox.net/manga/",
					"mangatown":"mangatown.com/manga/",
					"readmangatoday":"readmng.com/",
					"webtoons":"webtoons.com/",
					"mangakakalot":"mangakakalot.com/",
					"manganelo":"manganelo.com/"
					};

//fix fanfox annoying urls
(function fanfoxURLFix() {
	if (this.location.href.indexOf("fanfox.net//") >= 0)
		this.location.href = this.location.href.replace("fanfox.net//", "fanfox.net/");
})();

window.addEventListener("load", readMangaChapter);
function readMangaChapter() {
	var url = window.location.href;
	var is_placeholder = true;
	var website = "notAMangaWebsite";
	//check if it's in the list and return the name
	for (let x in websites_list) {
		if (url.indexOf(websites_list[x]) >= 0){
			website = x;
		}
	}
	
	//check if the chapter is available or if it's a placeholder page
	//if using mangaloader script in tampermonkey
	if (document.getElementsByClassName("ml-images")[0]){
		is_placeholder = false;
	} else {
		switch (website) {
			case "mangahere":
				is_placeholder = document.querySelector("img.reader-main-img") || document.querySelector("img#image") ? false : true;
				break;
			case "mangafox":
				is_placeholder = document.querySelector("img.reader-main-img") || document.querySelector("img#image") ? false : true;
				break;
			case "mangatown":
				is_placeholder = document.querySelector("#viewer.read_img") || document.querySelector("img#image") ? false : true;
				break;
			case "readmangatoday":
				is_placeholder = document.querySelector("#chapter_img") ? false : true; //no mobile site
				break;
			case "webtoons":
				is_placeholder = document.querySelector("img._images") || document.querySelector("img._checkVisible") ? false : true;
				break;
			case "mangakakalot":
				{let elem = document.querySelector("#vungdoc img");
				let source_url = elem ? elem.src : null;
				is_placeholder = source_url && ! source_url.includes("/nextchap.png") ? false : true; //no mobile site
				break;}
			case "manganelo":
				{let elem = document.querySelector("#vungdoc img");
				let source_url = elem ? elem.src : null;
				is_placeholder = source_url && ! source_url.includes("/nextchap.png") ? false : true; //no mobile site
				break;}
		}
	}
	
	if (!is_placeholder) {
		browser.runtime.sendMessage({"target":"background","read": url});
	}
}

//listen to background script, and create navigation buttons
browser.runtime.onMessage.addListener(createNavigation);

function createNavigation(message) {
	if  (!(document.getElementById("mangassubscriber_nav_bar")) && message.target == "content" && message.navigation){
		document.body.classList.add("navigation_bar_spacer");
		var navigation = message.navigation;
		let nav_bar = document.createElement("div");
		nav_bar.setAttribute("id", "mangassubscriber_nav_bar");

		if (navigation.first_chapter != "") {
			let first_button = document.createElement("div");
			first_button.classList.add("left_nav_button", "button", "table");
			let first_button_link = document.createElement("a");
			first_button_link.classList.add("row");
			let first_button_arrow = document.createElement("img");
			first_button_arrow.classList.add("text_icons", "cell");
			first_button_arrow.src = browser.extension.getURL("../icons/arrow_left_double.svg");
			first_button_link.appendChild(first_button_arrow);
			let first_button_text_node = document.createElement("div");
			first_button_text_node.classList.add("cell");
			first_button_text_node.innerText = navigation.first_chapter.number;
			first_button_link.appendChild(first_button_text_node);
			first_button_link.href = navigation.first_chapter.url;
			first_button.appendChild(first_button_link);
			nav_bar.appendChild(first_button);
		}
		if (navigation.previous_chapter != "") {
			let previous_button = document.createElement("div");
			previous_button.classList.add("left_nav_button", "button", "table");
			let previous_button_link = document.createElement("a");
			previous_button_link.classList.add("row");
			let previous_button_arrow = document.createElement("img");
			previous_button_arrow.classList.add("text_icons", "cell");
			previous_button_arrow.src = browser.extension.getURL("../icons/arrow_left_single.svg");
			previous_button_link.appendChild(previous_button_arrow);
			let previous_button_text_node = document.createElement("div");
			previous_button_text_node.classList.add("cell");
			previous_button_text_node.innerText = navigation.previous_chapter.number;
			previous_button_link.appendChild(previous_button_text_node);
			previous_button_link.href = navigation.previous_chapter.url;
			previous_button.appendChild(previous_button_link);
			nav_bar.appendChild(previous_button);
		}
		//append last_chapter before previous_chapter to avoid them getting inverted due to css : float:right
		if (navigation.last_chapter != "") {
			let last_button = document.createElement("div");
			last_button.classList.add("right_nav_button", "button");
			let last_button_link = document.createElement("a");
			last_button_link.textContent = navigation.last_chapter.number + " >>";
			last_button_link.href = navigation.last_chapter.url;
			last_button.appendChild(last_button_link);
			nav_bar.appendChild(last_button);
		}
		if (navigation.next_chapter != "") {
			let next_button = document.createElement("div");
			next_button.classList.add("right_nav_button", "button");
			let next_button_link = document.createElement("a");
			next_button_link.textContent = navigation.next_chapter.number + " >";
			next_button_link.href = navigation.next_chapter.url;
			next_button.appendChild(next_button_link);
			nav_bar.appendChild(next_button);
		}

		let menu_wrapper = document.createElement("div");
		menu_wrapper.classList.add("centered");
		nav_bar.appendChild(menu_wrapper);

		let menu_button = document.createElement("div");
		menu_button.classList.add("button");
		let menu_button_link = document.createElement("a");
		menu_button_link.textContent = " . . . ";
		menu_button.appendChild(menu_button_link);
		menu_wrapper.appendChild(menu_button);
		
		let menu = document.createElement("div");
		menu.classList.add("button", "mangassubscriber_hidden");
		menu_wrapper.appendChild(menu);

		if (navigation.unread_chapter != "") {
			let first_unread_button = document.createElement("div");
			first_unread_button.classList.add("button");
			
			let first_unread_button_link = document.createElement("a");
			first_unread_button_link.textContent = "go to first unread chapter";
			first_unread_button_link.href = navigation.unread_chapter.url;
			first_unread_button.appendChild(first_unread_button_link);
			menu.appendChild(first_unread_button);
		}
		
		let mark_unread_button = document.createElement("div");
		mark_unread_button.classList.add("button");
		mark_unread_button.addEventListener("click", () => {
			browser.runtime.sendMessage({"target":"background","unread": window.location.href});
		});
		let mark_unread_button_link = document.createElement("a");
		mark_unread_button_link.textContent = "mark chapter as not read";
		mark_unread_button.appendChild(mark_unread_button_link);
		menu.appendChild(mark_unread_button);
		


		document.body.appendChild(nav_bar);
	
		// Create an observer to fire readMangaCHapter when the body is modified (which recreates the nav_bar if it has been destroyed by MangaLoader)
		var config = { attributes: false, childList: true, subtree: false };
		var observer = new MutationObserver(readMangaChapter);
		observer.observe(document.body, config);
	}
}