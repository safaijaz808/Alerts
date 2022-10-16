const http = require("http");
const app = require("./app");
const server = http.createServer(app);
const User = require("./model/users");
const Token = require("./model/tokens");
const Check = require('./model/checks');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./middleware/auth");
var helpers = require('./lib/helpers');

const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome 🙌 ");
  });

app.post('/register', async function(req,res){
    try {
        // Get user input
        const { Name, phone, password } = req.body;
    
        // Validate user input
        if (!(Name && phone && password)) {
          res.status(400).send("All input is required");
        }
    
        // check if user already exist
        // Validate if user exist in our database
        const oldUser = await User.findOne({phone });
    
        if (oldUser) {
          return res.status(409).send("User Already Exist. Please Login");
        }
    
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await User.create({
          Name,
          phone, // sanitize: convert email to lowercase
          password: encryptedPassword,
        });
    
        // Create token
        const token = jwt.sign(
          { user_id: user._id, phone },
          process.env.TOKEN_KEY,
          {
            expiresIn: "2h",
          }
        );
        // save user token
        user.token = token;
    
        // return new user
        res.status(201).json(user);
      } catch (err) {
        console.log(err);
      }

});


app.post('/login', async function(req,res){
    try {
        // Get user input
        const { phone, password } = req.body;
    
        // Validate user input
        if (!(phone && password)) {
          res.status(400).send("All input is required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ phone });
    
        if (user && (await bcrypt.compare(password, user.password))) {
          // Create token
          const token = jwt.sign(
            { user_id: user._id, phone },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
    
          // save user token
          user.token = token;
    
          // user
          res.status(200).json(user);
        }
        //res.status(400).send("Invalid Credentials");
      } catch (err) {
        console.log(err);
      }

});

app.get('/getUser', async function(req, res){

    try{
    const {phone} = req.body;
    if(!phone){
        res.status(404).send("Invalid number");
    }
      else{  // Lookup the user
        const user = await User.findOne({ phone });
    
        if (user && (phone == user.phone)) {

         //delete(user.password);
          res.status(200).json(user);
        }
        else{
        res.status(400).send("Invalid Credentials");
        }
    }
      } catch (err) {
        console.log(err);
      }
});

app.put('/modifyUser', async function(req, res){
    try{
        const {Name, phone, password} = req.body;

        //now if the phone number is not  valid
        if(!phone){
            res.status(400).send("Phone number is not valid");
        }
            if(Name || password) //if the name and password is valid
            {
                //find the user
                const user = await User.findOne({ phone });
                if (user && (phone == user.phone)) { //if the phone matches with the phone in db
                    // Store the new updates
                    const newuser= await user.updateOne({
                        Name: Name,
                        phone, // sanitize: convert email to lowercase
                        password: await bcrypt.hash(password,10),
                      });
                      res.status(200).json(newuser);
                }
                else{
                    res.status(400).send("user not found")
                }
        }

    }
    catch{
        res.status(404).send("Something went wrong");
    }

});

app.delete('/deleteUser', async function(req, res){
    try{
        const {phone} = req.body;
        if(phone){
            //find the user
            await User.findOneAndRemove({ phone });
            //delete(user);
            res.status(200).send("User removed successfully");
        }
        else{
            res.status(400).send("invalid number");
        } 
    }
    catch(err){
        res.status(404).send(err);

    }

});

//let's work on the tokens here
app.post('/postToken', async function(req, res){
    
    try{
        const {phone, password} = req.body;
        if (!(phone && password)) {
            res.status(400).send("All input is required");
        }
      // Validate if user exist in our database
        const user = await User.findOne({ phone });
  
        if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
            // If valid, create a new token with a random name. Set an expiration date 1 hour in the future.
            var tokenId = helpers.createRandomString(20);
            var expires = Date.now() + 1000 * 60 * 60;
            const token = await Token.create({
            'phone' : phone,
            'id' : tokenId,
            'expires' : expires
              });
              res.status(200).json(token);
    }
}catch (err) {
    res.status(400).send(err);
}   
});

app.get('/getToken', async function(req, res){
    try{
    var id = req.body.id || req.query.id || req.headers["x-access-id"];
    if(id){
        // Lookup the token
        const token = await Token.findOne({ id });
        if (token && (id == token.id)) {

            //delete(user.password);
             res.status(200).json(token);
           }
           else{
           res.status(400).send("Invalid token");
           }

    }}
    catch(err){
        res.status(400).send(err);
    }

});

//////////////start from here

app.put('/extendToken', async function(req, res){
    try{
        const {id, extend}=req.body;
        if(id && extend){
             const token = await Token.findOne({id});
             if(token && (id==token.id)){
                token.expires = Date.now() + 1000 * 60 * 60;
                const newtoken = await token.updateOne({
                    id, 
                    expires:token.expires
                });
                res.status(200).json(newtoken);      
        }
        else{
            res.status(400).send("Id not found");
        }
    }
}catch(err){
    res.status(200).send(err);
}
});

app.delete('/deleteToken', async function(req, res){
    try{
        const {id} = req.body;
        if(id){
            //find the user
            await Token.findOneAndRemove({ id });
            //delete(user);
            res.status(200).send("Token removed successfully");
        }
        else{
            res.status(400).send("invalid id");
        } 
    }
    catch(err){
        res.status(404).send(err);

    }

});

///////////create check routes here

app.post('/createCheck', async function(req, res){

    try{
        const {protocol, url, method, successCodes, timeoutSeconds, id } = req.body;
        if(protocol && url && method && successCodes && timeoutSeconds && id){
            //first we look up the token data we need to match the token with the phone so we can access the user data based on phone
            var tokendata = await Token.findOne({id});           
            if(tokendata && (id == tokendata.id)){
                const phone = tokendata.phone;
                const user = await User.findOne({phone});
                if(user && (phone == user.phone)){
                    if(user.check.length < 5){
                        var checkId = helpers.createRandomString(20);
                        const checkObject = await Check.create({
                            'checkid' : checkId,
                            'phone' : phone,
                            'protocol' : protocol,
                            'url' : url,
                            'method' : method,
                            'successCodes' : successCodes,
                            'timeoutSeconds' : timeoutSeconds
                          });
                          if(checkObject){
                            user.check.push(checkId);
                            await user.updateOne( { "check":user.check});
                            helpers.sendTwilioSms(phone, 'check created for ' +user.Name+' with checkid ' +checkId, function(err){
                                console.log("this was the error", err);
                            });
                            res.status(200).json(user.check); 
                        }
            }else{
                res.status(400).send("number of checks exceeded");}
        }
    }else{
        res.status(400).send("The token is invalid");
    }
}
}catch(err){
        res.status(400).send(err);
    } 
});


app.get('/listChecks', async function(req, res){
    try{
        var checkid = req.body.checkid;
        if(checkid){
            // Lookup the check
            var checkData= await Check.findOne({checkid});
            console.log("checkdata is", checkData);
            if(checkData && (checkid == checkData.checkid)){
            // Get the token that sent the request
            var id = req.body.token;
            console.log("token is", id);
            // Verify that the given token is valid and belongs to the user who created the check
            const tokenData = await Token.findOne({id});
            console.log("token data is", tokenData);
            if(tokenData && (tokenData.phone == checkData.phone))
            {
                res.status(200).json(checkData);
            }else{
                res.status(400).send("Invalid Token");
            }
        } else {
            res.status(404).send("Inforamtion does not match");
         }
     } else {
        res.status(400).send({'Error' : 'Missing required field, or field invalid'});
     }

    }catch(err){
        res.status(400).send(err);
    }

});

app.put('/modifyChecks', async function(req,res){
    try{
        var {checkid , protocol, url, method, successCodes, timeoutSeconds} = req.body; 
       // Error if id is invalid
        if(checkid){
        // Error if nothing is sent to update
            if(protocol || url || method || successCodes || timeoutSeconds){
            // Lookup the check
            const checkData = await Check.findOne({checkid});
            if(checkData && (checkid == checkData.checkid)){
                // Get the token that sent the request
                var id = req.headers["token"];
                // Verify that the given token is valid and belongs to the user who created the check
                const tokenData = await Token.findOne({id});
                console.log("token data is", tokenData);
                if(tokenData &&(tokenData.phone == checkData.phone)){
                    // Update check data where necessary
                    // Store the new updates
                    const newcheckData = await checkData.updateOne({
                        checkid,
                        protocol: protocol, 
                        url: url,
                        method: method,
                        successCodes: successCodes,
                        timeoutSeconds: timeoutSeconds

                    });
                    if(newcheckData){
                        res.status(200).json(newcheckData);
                    } else {
                        res.status(500).send({'Error' : 'Could not update the check.'});
                    }
                } else {
                    res.status(403).send("error");
                }
            } else {
                res.status(400).send({'Error' : 'Check ID did not exist.'});
            }
        } else {
            res.status(400).send({'Error' : 'Missing fields to update.'});
        }
        } else {
        res.status(400).send({'Error' : 'Missing required field.'});
        }
    }catch(err){
        res.status(400).send(err);
    }

});

app.delete('/deleteChecks', async function(req, res){
    try{
        var checkid = req.body.id; 
        if(checkid){
            // Lookup the check
            const checkData = await Check.findOne({checkid});
            console.log("this is the checkdata", checkData);
            const phone = checkData.phone;
            console.log("this is the user phone", phone);
            if(checkData && (checkid == checkData.checkid)){
                
                // Get the token that sent the request
                var id = req.headers["token"];
                // Verify that the given token is valid and belongs to the user who created the check
                const tokenData = await Token.findOne({id});
                console.log("this is the tokendata", tokenData);
                if(tokenData && (tokenData.phone == checkData.phone)){
                    // Delete the check data
                    await checkData.deleteOne({checkid});
                    // Lookup the user's object to get all their checks
                    const user = await User.findOne({phone});
                    console.log(user);
                    if(user){
                            //var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                            // Remove the deleted check from their list of checks
                            var checkPosition = user.check.indexOf(checkid);
                            if(checkPosition > -1){
                                user.check.splice(checkPosition,1);
                                // Re-save the user's data
                                //user.check = userChecks;
                                await user.updateOne( { "check":user.check});
                                console.log(user.check.length);
                                res.status(200).json(user.check)
                            } else {
                                res.status(500).send({"Error" : "Could not find the check on the user's object, so could not remove it."});
                            }
                        } else {
                        res.status(500).send({"Error" : "Could not find the user who created the check, so could not remove the check from the list of checks on their user object."});
                         }
                } else {
                    res.status(500).send({"Error" : "Could not delete the check data."})
                }
                
            } else {
                res.status(403).send("error");
            }
        } else {
            res.status(400).send({"Error" : "The check ID specified could not be found"});
        }
}catch(err){
        res.status(400).send(err);
    }

});

/*app.get("/gatherallChecks", async function(req, res){
    try{
        const checksData = await Check.find();
        console.log(checksData.length);
        if(checksData && checksData.length > 0){
            checksData.forEach(checks => {
                console.log(checks);
                if(checks){
                validateCheckData(checks);
                }else{
                    res.status(400).send("error reading one of the checks data");
                }
                //res.status(200).json(checks);

            });
        }else{
            res.status(400).send("Could not find any checks to process");
        }
         //res.status(200).json(checksData);

    }catch(err){
        res.status(400).send(err);
    }

});

validateCheckData = function(checks){
    checks = typeof(checks) == 'object' && checks !== null ? checks : {};
  checks.id = typeof(checks.id) == 'string' && checks.id.trim().length == 20 ? checks.id.trim() : false;
  checks.phone = typeof(checks.phone) == 'string' && checks.phone.trim().length == 10 ? checks.phone.trim() : false;
  checks.protocol = typeof(checks.protocol) == 'string' && ['http'].indexOf(checks.protocol) > -1 ? checks.protocol : false;
  checks.url = typeof(checks.url) == 'string' && checks.url.trim().length > 0 ? checks.url.trim() : false;
  checks.method = typeof(checks.method) == 'string' &&  ['post','get','put','delete'].indexOf(checks.method) > -1 ? checks.method : false;
  checks.successCodes = typeof(checks.successCodes) == 'object' && checks.successCodes instanceof Array && checks.successCodes.length > 0 ? checks.successCodes : false;
  checks.timeoutSeconds = typeof(checks.timeoutSeconds) == 'number' && checks.timeoutSeconds % 1 === 0 && checks.timeoutSeconds >= 1 && checks.timeoutSeconds <= 5 ? checks.timeoutSeconds : false;
  // Set the keys that may not be set (if the workers have never seen this check before)
  checks.state = typeof(checks.state) == 'string' && ['up','down'].indexOf(checks.state) > -1 ? checks.state : 'down';
  checks.lastChecked = typeof(checks.lastChecked) == 'number' && checks.lastChecked > 0 ? checks.lastChecked : false;

  // If all checks pass, pass the data along to the next step in the process
  if(checks.id &&
  checks.userPhone &&
  checks.protocol &&
  checks.url &&
  checks.method &&
  checks.successCodes &&
  checks.timeoutSeconds){
    performCheck(checks);
  } else {
    // If checks fail, log the error and fail silently
    console.log("Error: one of the checks is not properly formatted. Skipping.");
  }

};

performCheck = function(checks){

    // Prepare the intial check outcome
    var checkOutcome = {
      'error' : false,
      'responseCode' : false
    };
  
    // Mark that the outcome has not been sent yet
    var outcomeSent = false;
  
    // Parse the hostname and path out of the originalCheckData
    var parsedUrl = url.parse(checks.protocol+'://'+checks.url, true);
    var hostName = parsedUrl.hostname;
    var path = parsedUrl.path; // Using path not pathname because we want the query string
  
    // Construct the request
    var requestDetails = {
      'protocol' : originalCheckData.protocol+':',
      'hostname' : hostName,
      'method' : originalCheckData.method.toUpperCase(),
      'path' : path,
      'timeout' : originalCheckData.timeoutSeconds * 1000
    };
  
    // Instantiate the request object (using either the http or https module)
    var _moduleToUse = checks.protocol == 'http' ? http : https;
    var req = _moduleToUse.request(requestDetails,function(res){
        // Grab the status of the sent request
        var status =  res.statusCode;
  
        // Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;
        if(!outcomeSent){
          workers.processCheckOutcome(checks,checkOutcome);
          outcomeSent = true;
        }
    });
  
    // Bind to the error event so it doesn't get thrown
    req.on('error',function(e){
      // Update the checkOutcome and pass the data along
      checkOutcome.error = {'error' : true, 'value' : e};
      if(!outcomeSent){
        workers.processCheckOutcome(checks,checkOutcome);
        outcomeSent = true;
      }
    });
  
    // Bind to the timeout event
    req.on('timeout',function(){
      // Update the checkOutcome and pass the data along
      checkOutcome.error = {'error' : true, 'value' : 'timeout'};
      if(!outcomeSent){
        workers.processCheckOutcome(checks,checkOutcome);
        outcomeSent = true;
      }
    });
  
    // End the request
    req.end();
  };*/

// server listening 
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});