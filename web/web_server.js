var express = require('express');
var app = express();

//setting middleware
app.use(express.static(__dirname)); //Serves resources from public folder

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
})

const port = 5000
app.listen(port, () => {
    const s = "0"
    console.log(`JSON.parse(s) = ${JSON.parse(s)}`)
    console.log(`listening on port ${port}`)
})
