var textfield = document.getElementById("entry");
textfield.setAttribute("placeholder", "o awen");

function toggle_visible() {
	if (this.classList.contains("text")) {
		this.classList.remove("text");
	}
	else {
		var elements = document.getElementsByClassName("item-indicator");
		Array.from(elements).forEach(function(element) {
			element.classList.remove("text");
		});
		this.classList.add("text");
	}
}

function set_results(entry, tp_en, en_tp) {
	var selected = document.querySelector("input[type='radio'][name='lang']:checked").value;
	var out = {};
	if (selected == "en")
		out = en_tp;
	else if (selected == "tp")
		out = tp_en;
	else {
		if (en_tp[entry] && tp_en[entry]) {
			return;
		}
		else if (en_tp[entry]) {
			selected = "en";
			out = en_tp;
		}
		else if (tp_en[entry]) {
			selected = "tp";
			out = tp_en;
		}
	}
	output = "";
	if (out[entry]) {
		var card = document.createElement("ul");
		card.setAttribute("class", "card");
		var title = document.createElement("h3");
		title.setAttribute("class", "title");
		title.innerHTML = "Translations of ";
		var translated = document.createElement("span");
		translated.innerHTML = entry;
		title.appendChild(translated);
		card.appendChild(title);
		var legend = document.createElement("div");
		legend.setAttribute("class", "legend");
		var word = document.createElement("span");
		word.innerHTML = "Word ";
		word.setAttribute("class", "word");
		legend.appendChild(word);
		var frequency = document.createElement("span");
		frequency.innerHTML = "Frequency";
		frequency.setAttribute("class", "frequency");
		frequency.setAttribute("title", "Based on the data collected by Sonja Lang");
		legend.appendChild(frequency);
		card.appendChild(legend);
		for (const key in out[entry]) {
			var element = document.createElement("li");
			element.setAttribute("class", "card-item");
			var span = document.createElement("span");
			span.innerHTML = key;
			span.innerHTML += " ";
			span.setAttribute("class", "item-title");
			element.appendChild(span);
			var backtrans = document.createElement("span");
			backtrans.setAttribute("class", "item-backtrans");
			if (selected == "en") {
				for (const back in tp_en[key]) {
					if (backtrans.innerHTML != "")
						backtrans.innerHTML += ", ";
					var backlink = document.createElement("a");
					backlink.setAttribute("class", "item-backlink");
					backlink.setAttribute("href", "#en:" + back);
					backlink.innerHTML = back;
					backtrans.appendChild(backlink);
				}
			}
			else if (selected == "tp") {
				for (const back in en_tp[key]) {
					if (backtrans.innerHTML != "")
						backtrans.innerHTML += ", ";
					var backlink = document.createElement("a");
					backlink.setAttribute("class", "item-backlink");
					backlink.setAttribute("href", "#tp:" + back);
					backlink.innerHTML = back;
					backtrans.appendChild(backlink);
				}
			}
			span.appendChild(backtrans);
			var val = document.createElement("span");
			val.innerHTML = out[entry][key];
			val.setAttribute("title", out[entry][key]);
			val.setAttribute("tabindex", 0);
			indicator = Math.ceil(out[entry][key] / 20);
			if (out[entry][key] <= 20)
				indicator = Math.ceil((out[entry][key] - 10) / 20);
			if (indicator < 0)
				indicator = 0;
			val.setAttribute("class", "item-indicator indicator-" + indicator );
			element.appendChild(val);
			card.appendChild(element);
		}
		var source = document.createElement("div");
		source.setAttribute("class", "source");
		var link = document.createElement("a");
		link.setAttribute("href", "http://tokipona.org/nimi_pu.txt");
		link.innerHTML = "nimi_pu.txt";
		source.appendChild(link);
		source.innerHTML += ", ";
		link.setAttribute("href", "http://tokipona.org/nimi_pi_pu_ala.txt");
		link.innerHTML = "nimi_pi_pu_ala.txt";
		source.appendChild(link);
		source.innerHTML += ", ";
		link.setAttribute("href", "http://tokipona.org/compounds.txt");
		link.innerHTML = "compounds.txt";
		source.appendChild(link);
		source.innerHTML = "Source: " + source.innerHTML;
		card.appendChild(source);
		output = card;
	}
	document.getElementById("results").innerHTML = "";
	document.getElementById("result").innerHTML = "";
	var langs = document.getElementsByClassName("output-lang");
	Array.from(langs).forEach(function(element) {
		element.classList.remove("selected");
	});
	document.getElementById("auto-label").innerHTML = "Detect Language";
	if (output) {
		document.getElementById("results").appendChild(output);
		document.getElementById("result").innerHTML = Object.keys(out[entry])[0];
		if (document.querySelector("input[type='radio'][name='lang']:checked").value == "auto") {
			history.replaceState(null, null, document.location.pathname + "#" + entry);
			if (selected == "en")
				document.getElementById("auto-label").innerHTML = "English - Detected";
			else if (selected == "tp")
				document.getElementById("auto-label").innerHTML = "toki pona - Detected";
		}
		else
			history.replaceState(null, null, document.location.pathname + "#" + selected + ":" + entry);
		if (selected == "en") {
			document.getElementById("out-tp").classList.add("selected");
		}
		else if (selected == "tp") {
			document.getElementById("out-en").classList.add("selected");
		}
		var elements = document.getElementsByClassName("item-indicator");
		Array.from(elements).forEach(function(element) {
			element.onclick = toggle_visible;
			element.onkeyup = toggle_visible;
		});
	}
	else
		history.replaceState(null, null, document.location.pathname);
}

function get_suggestions(entry, tp_en, en_tp) {
	var selected = document.querySelector("input[type='radio'][name='lang']:checked").value;
	var out = {};
	if (selected == "en")
		out = en_tp;
	else if (selected == "tp")
		out = tp_en;
	else {
		return;
	}
	output = "";
	if (!out[entry] && entry != "") {
		var card = document.createElement("div");
		card.setAttribute("class", "card");
		keys = Object.keys(out).filter(function(item, index) {
			return RegExp(`^${entry}`).test(item); 
		});
		
		Array.from(keys).forEach(function(key) {
			var element = document.createElement("li");
			element.setAttribute("class", "card-item");
			var link = document.createElement("a");
			link.setAttribute("href", "#" + selected + ":" + key);
			link.innerHTML = key;
			element.appendChild(link);
			card.appendChild(element);
		});
		if (keys.length != 0)
			output = card;
	}
	document.getElementById("suggestions").innerHTML = "";
	if (output)
		document.getElementById("suggestions").appendChild(output);
}

Promise.all([
    fetch('tp-en.json')
    .then(res => res.json()),
    fetch('en-tp.json')
    .then(res=>res.json())
])
.then(([tp_en, en_tp]) => {
		var lang = document.querySelector("input[type='radio'][name='lang']:checked").value;
		window.addEventListener('hashchange', function(e) {
			var entry = "";
			if (decodeURIComponent(window.location.hash.substring(1)).includes(":")) {
				lang = decodeURIComponent(window.location.hash.substring(1)).split(":")[0];
				entry = decodeURIComponent(window.location.hash.substring(1)).split(":")[1];
			}
			else
				entry = decodeURIComponent(window.location.hash.substring(1));
			document.getElementById("entry").value = entry;
			document.getElementById("suggestions").innerHTML = "";
			document.querySelector(`input[type='radio'][name='lang']#${lang}`).checked = true;
			set_results(entry, tp_en, en_tp);
		});
		document.getElementById("entry").addEventListener('input', function(e) {
			var entry = e.target.value;
			get_suggestions(entry, tp_en, en_tp);
			set_results(entry, tp_en, en_tp);
		});
		var rad = document.getElementsByName("lang");
		var prev = null;
		for (var i = 0; i < rad.length; i++) {
			rad[i].addEventListener('change', function() {
				if (this !== prev) {
					prev = this;
				}
				var entry = document.getElementById("entry").value;
				get_suggestions(entry, tp_en, en_tp);
				set_results(entry, tp_en, en_tp);
			});
		}
		if (window.location.hash) {
			var entry = "";
			if (decodeURIComponent(window.location.hash.substring(1)).includes(":")) {
				lang = decodeURIComponent(window.location.hash.substring(1)).split(":")[0];
				entry = decodeURIComponent(window.location.hash.substring(1)).split(":")[1];
			}
			else
				entry = decodeURIComponent(window.location.hash.substring(1));
			document.getElementById("entry").value = entry;
			document.querySelector(`input[type='radio'][name='lang']#${lang}`).checked = true;
			set_results(entry, tp_en, en_tp);
		}
		textfield.removeAttribute("disabled");
		textfield.setAttribute("placeholder", "o alasa e nimi");
		textfield.focus();
}).catch(err => {
	textfield.setAttribute("placeholder", err);
	console.log(err)
});
