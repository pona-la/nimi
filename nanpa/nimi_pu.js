var textfield = document.getElementById("entry");
textfield.setAttribute("placeholder", "o awen");
var entrylabel = document.getElementsByClassName("entry-label")[0];
entrylabel.classList.remove("error");

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

function get_sources(entry, pu, pu_ala, compounds) {
	var sources = [];
	if (pu[entry])
		sources.push("pu");
	if (pu_ala[entry])
		sources.push("pu_ala");
	if (compounds[entry])
		sources.push("compounds");
	return sources;	
}

function set_results(entry, out, sources) {
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
		pu_link = "<a href=\"https://amzn.com/dp/0978292308\">Toki Pona: The Language of Good</a>"
		if (sources.includes("pu") && sources.includes("pu_ala")) {
			var notice = document.createElement("p");
			notice.setAttribute("class", "notice");
			notice.innerHTML = `This word is presented in ${pu_link} with a slightly different meaning. Some speakers may not be familiar with it`;
			card.appendChild(notice);
		}
		else if (sources.includes("pu_ala")) {
			var notice = document.createElement("p");
			notice.setAttribute("class", "notice");
			notice.innerHTML = `This word isn't in ${pu_link}. Some speakers may not be familiar with it.`;
			card.appendChild(notice);
		}
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
		if (sources.includes("pu")) {
			link.setAttribute("href", "http://tokipona.org/nimi_pu.txt");
			link.innerHTML = "nimi_pu.txt";
			source.appendChild(link);
		}
		if (sources.includes("pu_ala")) {
			if (source.innerHTML != "")
				source.innerHTML += ", ";
			link.setAttribute("href", "http://tokipona.org/nimi_pi_pu_ala.txt");
			link.innerHTML = "nimi_pi_pu_ala.txt";
			source.appendChild(link);
		}
		if (sources.includes("compounds")) {
			if (source.innerHTML != "")
				source.innerHTML += ", ";
			link.setAttribute("href", "http://tokipona.org/compounds.txt");
			link.innerHTML = "compounds.txt";
			source.appendChild(link);
		}
		source.innerHTML = "Source: " + source.innerHTML;
		card.appendChild(source);
		output = card;
	}
	document.getElementById("results").innerHTML = "";
	if (output) {
		document.getElementById("results").appendChild(output);
		window.location.hash = "#" + entry;
		var elements = document.getElementsByClassName("item-indicator");
		Array.from(elements).forEach(function(element) {
			element.onclick = toggle_visible;
			element.onkeyup = toggle_visible;
		});
	}
	else
		history.replaceState(null, null, document.location.pathname);
}

function get_suggestions(entry, out, pu, pu_ala, compounds) {
	output = "";
	if (!out[entry] && entry != "") {
		var card = document.createElement("div");
		card.setAttribute("class", "card");
		keys = Object.keys(out).filter(function(item, index) {
			return RegExp(`^${entry}`).test(item); 
		});
		
		var pu_el = document.createElement("ul");
		var pu_ala_el = document.createElement("ul");
		var compounds_el = document.createElement("ul");
		
		Array.from(keys).forEach(function(key) {
			var element = document.createElement("li");
			element.setAttribute("class", "card-item");
			var link = document.createElement("a");
			link.setAttribute("href", "#" + key);
			link.innerHTML = key;
			element.appendChild(link);
			sources = get_sources(key, pu, pu_ala, compounds);
			if (sources.includes("pu"))
				pu_el.appendChild(element);
			else if (sources.includes("pu_ala"))
				pu_ala_el.appendChild(element);
			else if (sources.includes("compounds"))
				compounds_el.appendChild(element);
		});
		if (pu_el.innerHTML != "") {
			pu_el.innerHTML = "<h3>nimi pu</h3>" + pu_el.innerHTML;
			card.appendChild(pu_el);
		}
		if (pu_ala_el.innerHTML != "") {
			pu_ala_el.innerHTML = "<h3>nimi pu ala</h3>" + pu_ala_el.innerHTML;
			card.appendChild(pu_ala_el);
		}
		if (compounds_el.innerHTML != "") {
			compounds_el.innerHTML = "<h3>compounds</h3>" + compounds_el.innerHTML;
			card.appendChild(compounds_el);
		}
		if (keys.length != 0)
			output = card;
	}
	document.getElementById("suggestions").innerHTML = "";
	if (output)
		document.getElementById("suggestions").appendChild(output);
}

Promise.all([
    fetch('nimi_pu.json')
    .then(res => res.json()),
    fetch('nimi_pu_ala.json')
    .then(res=>res.json()),
    fetch('compounds.json')
    .then(res=>res.json())
])
.then(([pu, pu_ala, compounds]) => {
		var out = Object.assign({}, compounds, pu, pu_ala);
		window.addEventListener('hashchange', function(e) {
			entrylabel.classList.remove("loaded");
			var entry = decodeURIComponent(window.location.hash.substring(1));
			document.getElementById("entry").value = entry;
			document.getElementById("suggestions").innerHTML = "";
			var sources = get_sources(entry, pu, pu_ala, compounds);
			set_results(entry, out, sources);
			entrylabel.classList.add("loaded");
		});
		document.getElementById("entry").addEventListener('input', function(e) {
			entrylabel.classList.remove("loaded");
			var entry = e.target.value;
			get_suggestions(entry, out, pu, pu_ala, compounds);
			var sources = get_sources(entry, pu, pu_ala, compounds);
			set_results(entry, out, sources);
			entrylabel.classList.add("loaded");
		});
		if (window.location.hash) {
			var entry = decodeURIComponent(window.location.hash.substring(1));
			document.getElementById("entry").value = entry;
			var sources = get_sources(entry, pu, pu_ala, compounds);
			set_results(entry, out, sources);
		}
		textfield.removeAttribute("disabled");
		textfield.setAttribute("placeholder", "o alasa e nimi");
		entrylabel.classList.add("loaded");
		textfield.focus();
}).catch(err => {
	textfield.setAttribute("placeholder", err);
	entrylabel.classList.add("error");
	console.log(err)
});
