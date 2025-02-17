self.addEventListener("message", (event) => {
	if (event.data.type == "generate") {
		console.log(NAI.datasets);
	}
});