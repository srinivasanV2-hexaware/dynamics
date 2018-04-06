'use strict';
var https = require('https');
var crmorg = 'https://hexaware2.api.crm8.dynamics.com';//OLD :https://vfs365.api.crm8.dynamics.com
var clientid = '9cd9a017-0ffd-4493-a4da-b9e1722035db';//OLD:  d1f82629-cec9-42b8-8a64-aab98b2d6189
var username = '40140@hexaware.onmicrosoft.com';//OLD :crmadmin@VFS365.onmicrosoft.com
var userpassword = 'Srini_2312';//OLD : Hexaware@123
var tokenendpoint = 'https://login.microsoftonline.com/fe251855-6670-42ad-a88e-2ac8a0b9ef13/oauth2/token';//https://login.windows.net/0b78e424-1823-4673-8d71-295823333a8d/oauth2/token

//set these values to query your crm data
var crmwebapihost = 'hexaware2.api.crm8.dynamics.com';
var crmwebapipath = '/api/data/v9.0/contacts?$select=fullname,contactid'; //basic query to select contacts
var postpathincident='/api/data/v9.0/incidents';
var postpathcontact='/api/data/v9.0/contacts';
//remove https from tokenendpoint url
tokenendpoint = tokenendpoint.toLowerCase().replace('https://','');

//get the authorization endpoint host name
var authhost = tokenendpoint.split('/')[0];

//get the authorization endpoint path
var authpath = '/' + tokenendpoint.split('/').slice(1).join('/');

//build the authorization request
//if you want to learn more about how tokens work, see IETF RFC 6749 - https://tools.ietf.org/html/rfc6749
var reqstring = 'client_id='+clientid;
reqstring+='&resource='+encodeURIComponent(crmorg);
reqstring+='&username='+encodeURIComponent(username);
reqstring+='&password='+encodeURIComponent(userpassword);
reqstring+='&grant_type=password';

module.exports={

//set these values to retrieve the oauth token

getToken : function(first_name, last_name, complaint_desc, phone_number, email_id, complaint_type, callback){
    console.log("GET TOKEN FIRED");
    console.log("First Name Final : "+first_name);
    console.log("Last Name Final : "+last_name);
    console.log("Description Final : "+complaint_desc);
    console.log("Phone Number Final : "+phone_number);
    console.log("Email Id Final : "+email_id);
    console.log("Complaint Type : "+complaint_type);
    var tokenrequestoptions = {
    host: authhost,
    path: authpath,
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(reqstring)
    }
};

//make the token request
var tokenrequest = https.request(tokenrequestoptions, function(response) {
    //make an array to hold the response parts if we get multiple parts
    var responseparts = [];
    response.setEncoding('utf8');
    response.on('data', function(chunk) {
        //add each response chunk to the responseparts array for later
        responseparts.push(chunk);
    });
    response.on('end', function(){
        //once we have all the response parts, concatenate the parts into a single string
        var completeresponse = responseparts.join('');
        //console.log('Response: ' + completeresponse);
        console.log('Token response retrieved . . . '+JSON.stringify(completeresponse));

        //parse the response JSON
        var tokenresponse = JSON.parse(completeresponse);

        //extract the token
        var token = tokenresponse.access_token;

        //pass the token to our data retrieval function

      createContact(token, first_name, last_name, complaint_desc, phone_number, email_id, complaint_type, callback);

        //getData(token);
    });
});
tokenrequest.on('error', function(e) {
    console.error(e);
});

//post the token request data
tokenrequest.write(reqstring);

//close the token request
tokenrequest.end();
}

}


function createContact(token, first_name, last_name, complaint_desc, phone_number, email_id, complaint_type, callback){
    var contactData={
                "emailaddress1": email_id,
                "firstname": first_name,
                "lastname": last_name,
                "telephone1": phone_number
};

    var requestheaders = {
        'Authorization': 'Bearer ' + token,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.maxpagesize=500',
        'Prefer': 'odata.include-annotations=OData.Community.Display.V1.FormattedValue',
        'Prefer': 'return=representation'


    };

    //set the crm request parameters
    var crmrequestoptions = {
        host: crmwebapihost,
        path: postpathcontact,
        method: 'POST',
        headers: requestheaders
    };

    //make the web api request
    var crmrequest = https.request(crmrequestoptions, function(response) {
        //make an array to hold the response parts if we get multiple parts
        var responseparts = [];
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            //add each response chunk to the responseparts array for later
            responseparts.push(chunk);
          //  console.log("CHUNK"+chunk);
        });
        response.on('end', function(){
            //once we have all the response parts, concatenate the parts into a single string
            var completeresponse = responseparts.join('');
            console.log("completeresponse"+completeresponse);
            var contactID=JSON.parse(completeresponse).contactid;
            console.log("--"+contactID);

            createCase(token, contactID, first_name, last_name, complaint_desc, phone_number, email_id, complaint_type, callback);

        });
    });
    crmrequest.on('error', function(e) {
        console.error(e);
    });



    console.log("PARAM"+JSON.stringify(contactData));
    //close the web api request
    crmrequest.end(JSON.stringify(contactData));

}



function createCase(token,contactid, first_name, last_name, complaint_desc, phone_number, email_id, complaint_type, callback){

     var incidentData=
                {"title":complaint_type,
                 "description":complaint_desc,
                 caseorigincode:2483,
                 casetypecode:2,
                 prioritycode:2,
                 severitycode:1,
                 "customerid_contact@odata.bind":"/contacts("+contactid+")"};


    var requestheaders = {
        'Authorization': 'Bearer ' + token,
        'OData-MaxVersion': '4.0',
        'OData-Version': '4.0',
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'odata.maxpagesize=500',
        'Prefer': 'odata.include-annotations=OData.Community.Display.V1.FormattedValue',
        'Prefer': 'return=representation'


    };

    //set the crm request parameters
    var crmrequestoptions = {
        host: crmwebapihost,
        path: postpathincident,
        method: 'POST',
        headers: requestheaders
    };

    //make the web api request
    var crmrequest = https.request(crmrequestoptions, function(response) {
        //make an array to hold the response parts if we get multiple parts
        var responseparts = [];
        response.setEncoding('utf8');
        response.on('data', function(chunk) {
            //add each response chunk to the responseparts array for later
            responseparts.push(chunk);
            console.log("CHUNK"+chunk);
        });
        response.on('end', function(){
            //once we have all the response parts, concatenate the parts into a single string
            var completeresponse = responseparts.join('');

            console.log("--"+JSON.stringify(completeresponse));
            callback(completeresponse);

        });
    });
    crmrequest.on('error', function(e) {
        console.error(e);
    });



    console.log("PARAM"+JSON.stringify(incidentData));
    //close the web api request
    crmrequest.end(JSON.stringify(incidentData));
}
