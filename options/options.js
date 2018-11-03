//display the version
document.getElementById("details").innerHTML = "MangaSubscriber v" + browser.runtime.getManifest().version;

//toggle the "check all sites when updating the list" option
document.getElementById("check_all_sites").addEventListener("click", async (e) => {
	var background = await browser.runtime.getBackgroundPage();
	await background.toggleCheckAllSites();
	displayCheckAllSites();
});

//display the status of the "check all sites when updating the list" option
async function displayCheckAllSites(){
	var background = await browser.runtime.getBackgroundPage();
	var check_all_sites = await background.getCheckAllSites();
	if (check_all_sites) {
		document.getElementById("check_all_sites_tickbox").src = "/icons/high_resolution_update_true.png";
	} else {
		document.getElementById("check_all_sites_tickbox").src = "/icons/high_resolution_update_false.png";
	}
}

//initialize the "check all sites when updating the list" option
displayCheckAllSites();

//export the manga list
document.getElementById("export").addEventListener("click", async (e) => {
	var background = await browser.runtime.getBackgroundPage();

	var export_text = document.getElementById("export");

	export_text.innerHTML = "...";
	var fail = await background.exportMangasList();
	if (!fail){
		export_text.innerHTML = "list exported";
	} else {
		export_text.innerHTML = "error, try again";
	}
	setTimeout(()=>{export_text.innerHTML = "export mangas list";},3000);
});

//import the manga list
document.getElementById("import_text").addEventListener("click", async (e) => {
	//retrieve the file
	var file = document.getElementById("hidden_import").files[0];
	if (file){
		var background = await browser.runtime.getBackgroundPage();
		
		//retrieve the chosen import option
		var import_option = "";
		var inputs = document.getElementsByName("import_option");
		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].checked) {
				import_option = inputs[i].value;
			}
		}
		
		document.getElementById("import_options").style="display:none";
		document.getElementById("import_file").style="display:none";
		document.getElementById("import_text").colSpan = "3";
		
		var fail = await background.importMangasList(file, import_option);
		if (!fail){
			document.getElementById("import_text").innerHTML = "list imported";
		} else {
			document.getElementById("import_text").innerHTML = "error, try again";
		}
		setTimeout(()=>{document.getElementById("import_text").innerHTML = "import mangas list";
						document.getElementById("import_text").colSpan = "1";
						document.getElementById("import_options").style="display:";
						document.getElementById("visible_import").innerText = "[choose a file]";
						document.getElementById("import_file").style="display:";
		},3000);
	} else {
		document.getElementById("import_text").innerHTML = "error, please choose a file to import";
		setTimeout(()=>{document.getElementById("import_text").innerHTML = "import mangas list";},3000);
	}
});

//display chosen import file
document.getElementById("hidden_import").addEventListener("change", async (e) => {
	document.getElementById("visible_import").innerText = "["+ document.getElementById("hidden_import").files[0].name +"]";
});

//display and manage the manga list
document.getElementById("toggle_list").addEventListener("click", async (e) => {
	
	var background = await browser.runtime.getBackgroundPage();
	//reset the list
	var dom_mangas_list = document.getElementById("complete_list");
	//si la liste est vide, on la construit
	if (!dom_mangas_list.firstChild) {
		
		var legend = document.getElementById("legend");
		if (legend.attributes.hidden)
			legend.attributes.removeNamedItem("hidden");
		
		var mangas = await background.getMangasList();
		//sorting the mangas alphabetically
		mangas = Object.keys(mangas).sort().reduce((r, k) => (r[k] = mangas[k], r), {});
		var unread_mangas = [];
		var read_mangas = [];
		
		//get search value and re-initialize it
		var search_list = document.getElementById("search_list").value;
		document.getElementById("search_list").value = "";
		
		//for each manga, 
		for (let name in mangas){
			//if the manga corresponds with the search
			if (search_list == "" || name.indexOf(search_list) != -1){
				var manga = mangas[name];
				
				//sort the chapters (unread ones by ascending order, read ones by descending order)
				let read_chapters = [];
				let unread_chapters = [];
				for (let chapter in manga.chapters_list){
					manga.chapters_list[chapter]["status"] == "unread" ? unread_chapters.push(chapter) : read_chapters.push(chapter);
				}
				unread_chapters.sort();
				read_chapters.sort().reverse();
				
				//construct tr element with manga & website name properties,   
				let dom_manga = document.createElement("div");
				dom_manga.setAttribute("class", "row");
				dom_manga.manga_name = name;
				dom_manga.website_name = manga.website_name;
				
				//displaying the manga name 
				let dom_manga_text = document.createElement("div");
				dom_manga_text.setAttribute("class", "tooltiptextcontainer cell");
				//create a tooltip with full name
				let tooltip = document.createElement("span");
				tooltip.setAttribute("class", "tooltiptext");
				let tooltip_text = document.createTextNode(name.replace(/_/g, " "));
				tooltip.appendChild(tooltip_text);
				dom_manga_text.appendChild(tooltip);
				//add text to the name
				let dom_name_node = document.createElement("span");
				dom_name_node.setAttribute("class", "name_text");
				let dom_name_text_node = document.createTextNode(name.replace(/_/g, " "));
				dom_name_node.appendChild(dom_name_text_node);
				dom_manga_text.appendChild(dom_name_node);

				dom_manga.appendChild(dom_manga_text);
				
				//and number of unread chapters			
				let dom_unread_number_node = document.createElement("div");
				let text_node;
				if (unread_chapters.length)
					dom_unread_number_node.setAttribute("class", "unread_number cell");
				else
					dom_unread_number_node.setAttribute("class", "read_number cell");
				
				text_node = document.createTextNode(" ("+unread_chapters.length+")");
				dom_unread_number_node.appendChild(text_node);
				dom_manga.appendChild(dom_unread_number_node);
				
				
				//and the sorted chapter list (unread first, then read)
				
				let dom_select_td = document.createElement("div");
				dom_select_td.setAttribute("class", "cell");
				let dom_select = document.createElement("select");
				dom_select.setAttribute("class", unread_chapters.length?"unread_chapter cell":"read_chapter");
				//update background when selected option changes
				dom_select.addEventListener("change", function(e){e.target.setAttribute("class", e.target.options[e.target.selectedIndex].classList);}, false);
				
				for (let x in unread_chapters){
					let dom_option = document.createElement("option");
					dom_option.setAttribute("class", "unread_chapter");
					let dom_option_text = document.createTextNode(unread_chapters[x]);
					dom_option.appendChild(dom_option_text);
					
					dom_select.appendChild(dom_option);
				}
				for (let x in read_chapters){
					let dom_option = document.createElement("option");
					dom_option.setAttribute("class", "read_chapter");
					let dom_option_text = document.createTextNode(read_chapters[x]);
					dom_option.appendChild(dom_option_text);
					
					dom_select.appendChild(dom_option);
				}
				dom_select_td.appendChild(dom_select);
				dom_manga.appendChild(dom_select_td);
				
				//and a button to read chapter selected from the list. button needs listener to (1) call background function to reconstruct url, and (2) open link in new tab
				let dom_read_button_td = document.createElement("div");
				dom_read_button_td.setAttribute("class", "cell");
				let dom_read_button = document.createElement("button");
				let dom_read_button_text = document.createTextNode("read");
				dom_read_button.appendChild(dom_read_button_text);
				dom_read_button.addEventListener("click", 
						async function(e){	let my_manga = e.target.parentElement.parentElement;
											let manga_url = await background.reconstructChapterURL(my_manga.website_name, my_manga.manga_name, my_manga.getElementsByTagName("select")[0].options[my_manga.getElementsByTagName("select")[0].selectedIndex].value); 
											browser.tabs.create({url:manga_url, active:false});
										}
						, false);
				dom_read_button_td.appendChild(dom_read_button);
				dom_manga.appendChild(dom_read_button_td);

				//and a button to mark all chapters as read
				let dom_read_all_button_td = document.createElement("div");
				dom_read_all_button_td.setAttribute("class", "cell");
				let dom_read_all_button = document.createElement("div");
				dom_read_all_button.setAttribute("class", "icons read_all_icon");
				dom_read_all_button.addEventListener("click", 
						async function(e){	let my_manga = e.target.parentElement.parentElement;
											let chapters_list = my_manga.getElementsByTagName("select")[0].options;
											for (let index in chapters_list) {
												if (chapters_list.hasOwnProperty(index) && chapters_list[index].classList.contains("unread_chapter")){
													let manga_url = await background.reconstructChapterURL(my_manga.website_name, my_manga.manga_name, chapters_list[index].value); 
													await background.readMangaChapter({"target" : "background", "url" : manga_url});
													
													chapters_list[index].setAttribute("class", "read_chapter");
												} else break;
											}
											
											let unread_number = my_manga.getElementsByClassName("unread_number")[0];
											unread_number.innerText = " (0)";
											unread_number.setAttribute("class", "read_number");
											my_manga.getElementsByTagName("select")[0].setAttribute("class", "read_chapter");
										}
						, false);
				dom_read_all_button_td.appendChild(dom_read_all_button);
				dom_manga.appendChild(dom_read_all_button_td);
				
				//and a button to toggle updating of a manga
				let dom_update_toggle_button_td = document.createElement("div");
				dom_update_toggle_button_td.setAttribute("class", "cell");
				let dom_update_toggle_button = document.createElement("div");
				dom_update_toggle_button.update_state = manga["update"];
				dom_update_toggle_button.setAttribute("class", "icons update_"+dom_update_toggle_button.update_state+"_icon");
				dom_update_toggle_button.addEventListener("click", 
						async function(e){	let my_manga = e.target.parentElement.parentElement;
											//if (e.target.update_state == "true") {
												await background.setMangaUpdate(my_manga.manga_name, !e.target.update_state);
												e.target.update_state = !e.target.update_state;
											
											e.target.setAttribute("class", "icons update_"+e.target.update_state+"_icon");
										}
						, false);
				dom_update_toggle_button_td.appendChild(dom_update_toggle_button);
				dom_manga.appendChild(dom_update_toggle_button_td);
				
				//and a button to delete the manga from the list
				let dom_delete_button_td = document.createElement("div");
				dom_delete_button_td.setAttribute("class", "cell");
				let dom_delete_button = document.createElement("div");
				dom_delete_button.setAttribute("class", "icons delete_icon");
				dom_delete_button.addEventListener("click", 
						async function(e){	let my_manga = e.target.parentElement.parentElement;
											await background.deleteManga(my_manga.manga_name);
											dom_mangas_list.removeChild(e.target.parentElement.parentElement);
										}
						, false);
				dom_delete_button_td.appendChild(dom_delete_button);
				dom_manga.appendChild(dom_delete_button_td);
				
				
				//add manga to the unread array or to the read array
				if (unread_chapters.length)
					unread_mangas.push(dom_manga);
				else read_mangas.push(dom_manga);
			}
		}
		
		for (let dom_manga in unread_mangas){
			dom_mangas_list.appendChild(unread_mangas[dom_manga]);
		}
		for (let dom_manga in read_mangas){
			dom_mangas_list.appendChild(read_mangas[dom_manga]);
		}
		
		
		//toggle the list
		dom_mangas_list.style.display = "block";
	} else {
		//si la liste existe, on la vide
		while (dom_mangas_list.firstChild){
			 dom_mangas_list.removeChild(dom_mangas_list.firstChild);
		}
		dom_mangas_list.style.display = "none";
		var legend = document.getElementById("legend");
		legend.setAttribute("hidden", "hidden");
	}
});

//trim manga list when search is validated
document.getElementById("search_list").addEventListener("change", async (e) => {
	var dom_mangas_list = document.getElementById("complete_list");
	//clear the list
	while (dom_mangas_list.firstChild){
		 dom_mangas_list.removeChild(dom_mangas_list.firstChild);
	}
	//create the list
	document.getElementById("toggle_list").click();
});
