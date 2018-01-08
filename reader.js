const node = new Ipfs({ repo: 'ipfs-' + Math.random() })
node.once('ready', () => {
	if( window.location.hash.length > 1 ) {
		hash = window.location.hash.substr(1)

		// Load the index within the hash.
		// The structure of a manga series should go something like this:

		// manga/
		//   Ch1/
		//     001.jpg
		//     ...
		//   Ch2/
		//   index.json
		//   toc.json
		//   cover.jpg

		// index.json should contain a single object with metadata about the given series.
		// toc.json should contain a list of all chapters (in order), with metadata on each chapter.

		loadIndex(hash)
	}
	window.addEventListener("hashchange", function() {
		document.body.classList.remove("online")
		document.body.classList.add("loading")
		document.getElementById("status").innerHTML="Loading…"
		if(window.location.hash.length > 1) {
			loadIndex(window.location.hash.substr(1))
		} else {
			document.getElementById("status").innerHTML="Offline"
			document.getElementById("status").innerHTML= 'Node status: offline'
		}
	})
})



function loadIndex(hash) {
	node.files.cat(hash + "/index.json", function(err, data) {
		if(err) {
			return console.error('Error - ipfs files cat', err)
		}
		index = JSON.parse(data)
		console.log(index)

		document.getElementById("title").innerHTML = index.name ? index.name : ""
		document.getElementById("author").innerHTML = index.author ? index.author : ""
		document.getElementById("artist").innerHTML = index.artist ? index.artist : ""
		document.getElementById("type").innerHTML = index.type ? index.type : ""
		document.getElementById("status").innerHTML = index.status ? index.status : ""
		document.getElementById("description").innerHTML = index.desc ? index.desc : ""

		altnames = document.createElement("ul")
		for( var i = 0; i < index.alt_names.length; i++ ) {
			altnames.innerHTML += "<li>" + index.alt_names[i] + "</li>"
		}
		document.getElementById("altnames").appendChild(altnames)

		genres = document.createElement("ul")
		for( var i = 0; i < index.genres.length; i++ ) {
			genres.innerHTML += "<li>" + index.genres[i] + "</li>"
		}
		document.getElementById("genres").appendChild(genres)

		console.log('Online status: online')
		document.body.classList.remove("loading")
		document.body.classList.add("online")

		getImage(hash + "/" + index.cover, function(image) {
			img = document.createElement("img")
			img.src = image
			document.getElementById("coverimg").appendChild(img)
		})

		node.files.cat(hash+"/toc.json", function(err, data) {
			chaps = document.getElementById("chapters")
			chapters = JSON.parse(data)
			for( var i = 0; i < chapters.length; i++ ) {
				item = document.createElement("li")
				chap = document.createElement("a")
				chap.innerText = chapters[i].title
				chap.addEventListener("click", function() {
					getChapter(hash, chapters[i].folder)
				})

				item.appendChild(chap)
				chaps.appendChild(item)
			}
		})
	})
}

function getImage(hash, callback) {
	if (typeof hash === "string" && typeof callback === "function" ) {
		node.files.cat(hash, function(err, data) {
			if(err) {
				return console.error('Error - ipfs files cat', err)
			}
			mediatype = "image/"
			switch ( index.cover.substr(index.cover.lastIndexOf('.') + 1) ) {
				case 'png':
					mediatype += "png"
				case 'gif':
					mediatype += "gif"
				case 'jpg':
				case 'jpeg':
					mediatype += "jpeg"
				default:
					mediatype = ""
			}
			callback( "data:" + mediatype + ";base64," + data.toString('base64') )
		})
	}
}

function getChapter(hash, folder) {
}
