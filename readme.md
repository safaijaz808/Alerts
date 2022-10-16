//creating an uptime monitor, which basically gets URL's from users and alerts them when the URL is down or when it comes back up
//no npm pacakges will be used, just a number of built in node modules
/*we'll create RESTful Api's:
    1. to handle GET, POST, PUT, DELETE requests
    2. connect/create/delete a user
    3. it'll allow users to signup/signin which will give them a token to use for authentication)
    4. the user can be bale to logout and api invalidates the token
    5. a signed-up user can create a check to see if the given url is up/down
    6. a signed-in user can edit/delete any of his checks
    7. a task should be processed in the background at appropriate times, and send alerts when a check chnages it state (up or goes down)*/
//integrate sms alert feature (we'll use twilio) for this, we won't use 3rd party library to integrate to twilio, we'll craft our own http request to do the task
//signup and signin features
//we'll use a mongodb

//we created ssl certificate in the https directory and now we'll set up the server using the ssl certificate

//in order for us to handle checks we need to create background workers 