var express = require('express'),
    app = express(),
    http = require('http'),
    httpServer = http.Server(app);
var DynamicsWebApi = require('dynamics-web-api');
var AuthenticationContext = require('adal-node').AuthenticationContext;

//the following settings should be taken from Azure for your application
//and stored in app settings file or in global variables

//OAuth Token Endpoint
var authorityUrl = 'https://login.microsoftonline.com/7c0c36f5-af83-4c24-8844-9962e0163719/oauth2/token';
//CRM Organization URL
var resource = 'https://hexaware3.api.crm8.dynamics.com';
//Dynamics 365 Client Id when registered in Azure
var clientId = 'aec1810c-b721-4e81-addf-b535c88ae227';
var username = '40140@hexaware.onmicrosoft.com';
var password = 'Srini_2312';

var adalContext = new AuthenticationContext(authorityUrl);

//add a callback as a parameter for your function
function acquireToken(dynamicsWebApiCallback) {
    //a callback for adal-node
    function adalCallback(error, token) {
        if (!error) {
            //call DynamicsWebApi callback only when a token has been retrieved
            dynamicsWebApiCallback(token);
        }
        else {
            console.log('Token has not been retrieved. Error: ' + error.stack);
        }
    }

    //call a necessary function in adal-node object to get a token
    adalContext.acquireTokenWithUsernamePassword(resource, username, password, clientId, adalCallback);
}

//create DynamicsWebApi object
var dynamicsWebApi = new DynamicsWebApi({
    webApiUrl: 'https://hexaware3.api.crm8.dynamics.com/api/data/v9.0/',
    onTokenRefresh: acquireToken
});

//call any function
dynamicsWebApi.executeUnboundFunction("WhoAmI").then(function (response) {
    console.log('Hello Dynamics 365! My id is: ' + response.UserId);
}).catch(function (error) {
    console.log(error.message);
});
app.use(express.static(__dirname));

app.get('/', function (req, res) {
    apicall.getToken("Aventure", "Works", "This is good message", "9176727764", "ursfriendly_sri@yahoo.com", "normal", "createCase");
    res.send("Hello World");
});


app.listen(process.env.PORT || 3000);