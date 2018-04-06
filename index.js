var express = require('express'),
    app = express(),
    http = require('http'),
    httpServer = http.Server(app);
var apicall = require("./apicall");
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    apicall.getToken("Aventure","Works","This is good message","9176727764","ursfriendly_sri@yahoo.com","normal","createCase");
    res.send("Hello World");
});


app.listen(process.env.PORT||3000);