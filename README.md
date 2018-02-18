# WolfTutor
Software Engineering Spring 2018 project

### Problem Statement

We present a peer to peer collaborative tutoring system that is based on peer reviews and rewards earned through tutoring. According to our preliminary studies, the current proportion of students who need outside tutoring for clarifications of conceptual doubts, is considerable. A platform designed for students where they can help each other to clear such doubts and help them perform better would be much appreciated. Although students have many resources available in the university like open office hours of TA, professor, etc. , still many students hesitate to ask TA/Professor the doubts and queries that they have. Also, they are more comfortable in asking silly doubts to their peers without the fear of losing marks. Hence, the system to facilitate this process and maintained by students themselves would create a positive impact in the campus community. 

### Goals

1. Provide high quality tutoring through the platform that we build which will help students clear their concepts and succeed in the course.
2. Tutors will get experience of teaching and will increase their confidence and will enhance their subject skills.
3. Tutors can share their success tips which can help student excel in that particular course.
4. Our project will also help tutors in earning points which they can use to get tangible things on campus.

### Bot's description

### Steps to Install and Run

1. Make sure `Node.JS` is installed and is working in your machine. (Check using `node -v`).
2. Install `MongoDB` and start the server.
3. Make sure you have a [Slack app](https://api.slack.com/slack-apps) up and running. You will need the various tokens for `.env` file. Note the worspace that you used to make the slack app.
4. Clone the repo, using `git clone https://github.com/rikenshah/WolfTutor`.
5. Change to that directory `cd WolfTutor/botProject`.
6. Download node packages using `npm install && npm update`.
7. Rename `.env.example` to `.env`.
8. Add appropriate tokens in `.env`. The four things you will need are,
    ```
    SLACK_ACCESS_TOKEN='Enter your slack access token here'
    PORT=3000
    SLACK_VERIFICATION_TOKEN='Enter your slack app verification token'
    BOT_TOKEN='Enter your bot token here'
    MONGO_CONNECTION_STRING='Enter your mongo db url'
    ```
10. Start the server using, `node src/slack_bot.js`. This will start the server at `localhost:3000`.
11. Now, since you are runnning a server locally, we need a tunneling service like `ngrok` to tunnel requests sent from slack to localserver.
12. Start the tunnel using `ngrok http 3000` ([see documentation](https://ngrok.com/docs)). This will start the service and tunnel the traffic from slack to localurl. Note the `http://<something>.ngrok.io` url when you start the service.
13. Add the `ngrok url` that you noted in previous step under `Interactive Elements` settings in Slack App settings. This will tell slack where to send the post request.
14. Reinstall the app to your workspace. And start communicating with the app via direct messages.

### Use Cases

### Storyboard (Optional)

### Architectural Design

### Evaluation

### Team Information

### Reports
