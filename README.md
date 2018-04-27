# CSC 510 - Software Engineering Spring 2018

# WolfTutor - Group P

## Contact Information

[Zachery DeLong](https://github.com/zacherypd)  &ensp; email:  zpdelong@ncsu.edu <br>
[Monica Metro](https://github.com/mgmetro4) &ensp; &ensp; email:  mgmetro@ncsu.edu <br>
[Zhangqi Zha](https://github.com/zhazhangqi)   &ensp;&ensp;&ensp;&ensp; email: zzha@ncsu.edu

## About WolfTutor
We present a peer to peer collaborative tutoring system that is based on peer reviews and rewards earned through tutoring. According to our preliminary studies, the current proportion of students who need outside tutoring for clarifications of conceptual doubts, is considerable. A platform designed for students where they can help each other to clear such doubts and help them perform better would be much appreciated. Although students have many resources available in the university like open office hours of TA, professor, etc. , still many students hesitate to ask TA/Professor the doubts and queries that they have. Also, they are more comfortable in asking silly doubts to their peers without the fear of losing marks. Hence, the system to facilitate this process and maintained by students themselves would create a positive impact in the campus community.

------------------------------------------------------------------------------------------------------------------------------------

## How to Use
With the application's server up and running:

1. Signup for the bot service (see Signup below).

2. Follow instructions for user use cases depending on what type of user you would like to be. Wolftutor has two types of users: students and tutors. Users are automatically students at signup, but can choose to become a tutor.

 ### Signup
 
<ol>
  <li> Go to the Slack page hosting the app and register a slack username.</li>  

  <li> Click on the bot application found under the left App panel.
    <details><summary>Picture</summary><center>![img]()</center></details>
  </li><br>

  <li> Type <code>hi</code> into the bot chat box and send.</li><br>

  <li> Click <code>Yes</code> after the Wolftutor bot responds.
    <details><summary>Picture</summary><center>![img]()</center></details>
  </li>
</ol>

 ### Student Use Cases:
 
<ul>
  <li> <b>Find a tutor</b> - Type <code>find a tutor</code> into bot chat box. Students will first select the desired subject, then a tutor quality preference if any. The bot will return the tutors in a recommended order. </li>

  <li> <b>See the reviews for a tutor</b> - click <code>Reviews</code> under a tutor's displayed information
    <details><summary>Picture</summary><center>![img]()</center></details>
  </li>

  <li> <b>Schedule a 30 minute tutoring session</b> - Click <code>Schedule</code> under a tutor's displayed information. Next, click <code>Book</code> on the time slot you desire.
    <details><summary>Picture</summary><center>![img]()</center></details>
  </li>

  <li> <b>Review tutor from last session</b> (students have until the end of the day to review their tutor) - Type <code>Review</code> into the bot chat box. Next, enter review fields as prompted and <code>Submit</code>. </li>

  <li> <b>View past reservation history</b> - Type <code>history</code> or <code>reservation history</code> into the bot chat box. Displays tutor and subject reservation history. </li>

  <li> <b>View currently scheduled tutoring sessions</b> - Type <code>my reservations</code> into bot chat box. </li>

  <li> <b>View point balance</b> - Type <code>rewards</code> into bot chat box</li>
  
  <li> <b>Buy more points</b> - Type <code>buy</code> into bot chat box</li>   


</ul>

### Additional Tutor Use Cases:
<ul>
  <li> <b>Become a tutor</b> - Type <code>become a tutor</code> into bot chat box. </li>
  <li> <b>View tutoring subjects given to WolfTutor</b> - Type <code>my subjects</code> or just <code>subjects</code></li>
  <li> <b>View tutoring availability given to WolfTutor</b> - Type <code>my availability</code> or just <code>availability</code></li>
  <li> <b>Redeem points</b> - Type <code>redeem</code> into bot chat box</li>   
</ul>

## Local Development Setup Instructions
1. Setup the repository and the environmental variables file
2. Install mongoDB and set up the database
3. Install Node.js and ngrok
2. Setup the Slack page
6. Start the WolfTutor server

### The Repository
1. Clone the git repository from https://github.com/NCSU-CSC510-Group-E/WolfTutor.git 
2. Open the .env.example file and save it as .env. This is the environmental variables configuration file.

### MongoDB
1. Download the [Community Server](https://www.mongodb.com/download-center#community) edition of mongoDB.
2. Make sure the /bin path is added to your system's environmental variables.
3. Run the server via `mongod`. (mongod.exe found in mongo's /bin directory)
4. Use 'MongoDB Compass Community' to connect to your server running on the default port. Add the collection `Subject` to the `admin` database. Add at least one document (a course subject) to the new collection as `name: 'Subject'`. These will be the course subjects available to WolfTutor users. After adding the documents, you may close Compass.
5. Add the URI of the mongo database to the <code>MONGO_CONNECTION_STRING</code> variable of the .env file. For local host using default port 27020, it should be <code>mongodb://localhost:27020/<database name></code>

### Node.js and ngrok
1. Download and install [Node.js](https://nodejs.org/en/download/). You can check if node is installed via `node -v`.
2. In your command prompt, go to the project repository and run `npm install` and then run `npm update` to ensure all packages are installed and up-to-date.
3. Install ngrok via `npm install ngrok`. 
4. With your mongoDB server running, stat ngrok via `ngrok http 3000` for port 3000.
5. The URL given by ngrok will be added to the Slack app as detailed in the Slack Page section.  (The ngrok URL is found at the 'Forwarding' field and looks like <code> https://<characters>.ngrok.io</code>)

### Slack Page
1. Create a [Slack Workspace](https://slack.com/create#email)
2. Create a new Slack App at [Slack API](https://api.slack.com/apps)
3. While in the new app's settings, under the `Settings` side-panel, click on `Basic Information`. Copy the `Verification Token` found under `App Credentials` and paste it into the `SLACK_VERIFICATION_TOKEN` of the .env file.
4. Go to the `Bot Users` side-panel and `Add a Bot User`. Make sure `Always Show My Bot as Online` is turned on and `Add Bot User`. The bot is responsible for interacting with the NodeJS application via the interactive elements (buttons, prompts, etc.)..
5. Go to the `OAuth & Permissions` side-panel and `Save Changes` after adding the following `Scopes`. Then, `Install App to Workspace` (at the top).
     - Add a bot user with the username @<bot_name>
     - Post to specific channels in Slack
     - Access user’s public channels
     - Access information about user’s public channels
     - Send messages as <app_name>
     - Send messages as user
     - Access content in user’s private channels
     - Access content in user’s direct messages
     - Access information about user’s direct messages
     - Modify user’s direct messages
     - Access your workspace’s profile information
     - View email addresses of people on this workspace
6. Add the `OAuth Access Token` available after installing the bot to the `SLACK_ACCESS_TOKEN` field of the .env file
7. Add the `Bot User OAuth Access Token` available after installing the bot to the `BOT_TOKEN` field of the .env file
8. Go to the `Interactive Components` side-panel and `Enable Interactive Components`. Add the running ngrok URL to both the `Request URL` and `Options Load URL`. Add `/message` to the end of the URLs and `Enable Interactive Components`.
 
 ### Start the server
 1. Navigate back to your WolfTutor directory and start the server with `npm start`. 
 2. To check if the server is running, viewing your localhost in the browser should show a WolfTutor title page.
 
------------------------------------------------------------------------------------------------------------------------------------


## Production Setup Instructions
<p>Production setup is the same as local development, with a few exceptions:</p>
<ul>
 <li>Instead of using ngrok to connect Slack to the database, use the home URL of the app and add <code>/message</code> to the end.</li>
 <li>Make sure you use the correct URI for your mongo database</li>
 <li>In your git repository, the .gitignore will need to be altered with these changes:
 <ul>
  <li>Remove .env from the .gitignore</li>
  <li>Make sure package.json and package-lock.json are not in the .gitignore</li>
  </ul></li>
</ul>

------------------------------------------------------------------------------------------------------------------------------------

## Architectural Design

![img](https://github.com/rikenshah/WolfTutor/blob/master/Reports/pictures/Architecture_final.png)
