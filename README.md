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

We have created a Slack application that can be added to any Slack workspace. We have designed various user query flows with which the user can interact with the application. We have hosted our backend on NodeJS server and for frontend we are using various Slack components like dialog boxes, message menus and other interactive elements. Instead of using the traditional text based chat interface for user interaction, we figured, using interactive elements it becomes easier for user to communicate thoughts more effectively while having full control over the flow of the application.

### Steps to Install and Run (Developer Guide)

1. Make sure `Node.JS` is installed and is working in your machine. (Check using `node -v`).
2. Install `MongoDB` and start the server.
3. Make sure you have a [Slack app](https://api.slack.com/slack-apps) up and running. You will need the various tokens for `.env` file. Note the workspace that you used to make the slack app.
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

The four major use cases of our application are, 
#### 1. Find a tutor

<Details>
    <p>A user can find a tutor on our bot by just typing 'find a tutor'. The user will get the list of all the available subjects from which the user can select one subject. Once a subject is selected we will be returning all the tutors who teach that subject. 
    </p>
</Details>

#### 2. Book a tutor

<Details>
    <p> Once the user finds the tutors who are teaching that subject then the user will have an option to see the reviews and rating of tutors and can book the tutor if he has enough points in his account. Once the session is booked the tutor will be notified of the reservation and both of them can see their reservation by typing 'My reservation' in the slack bot.
    </p>
</Details>

#### 3. Become a tutor

<Details>
    <p> If a user wants to become a tutor, he/she will just type 'become a tutor' and an interactive form will be displayed to the user where he will be asked to fill his availability, subjects he would like to teach, rate which he would like to charge, summary. Once he fills all this information a profile of the tutor is created.
    </p>
</Details>

#### 4. Reward and review the tutor

<Details>
    <p> After the session is over the user(student) will have an option to review and rate the tutor. If the user wil type 'review' a review form will open and the user can rate the tutor and can write a review, so that the other users(students) can see the reviews and select the tutor. The tutor can also set his rates according to the reviews that he gets. We also have an option of keeping the rate to 0 for the tutors who want to teach for free. All the users(tutors and students) of our system can check their rewards(points) by simply asking the bot 'My points' and the bot will show them their current points.
    </p>
</Details>

### Wireframes

#### 1. Find a tutor

#### 2. Book a tutor

#### 3. Become a tutor

![img](Wireframes/become_a_tutor_p1.gif)

##### Part 2
![img](Wireframes/become_a_tutor_p2.gif)

#### 4. Reward and review the tutor

### Architectural Design

<From paper/improvement>

### Design Methodologies and Patterns

We have used agile practices throughout. We used kanban project integration with github to track our progress. Here are some screenshots. 

**Before**
![img](https://github.com/rikenshah/WolfTutor/raw/master/dump/agile.png)

**After**
![img](https://github.com/rikenshah/WolfTutor/raw/master/dump/agileDone.png)

### Evaluation Results 

<Update after evaluation>

### Reports

1. [Feb 1 report](https://github.com/rikenshah/WolfTutor/blob/master/Reports/Report_Feb/team_l_wolftutor_feb_report.pdf) 

### Team Information

[Riken Shah](https://github.com/rikenshah)<br>
[Mateenrehan Shaikh](https://github.com/mateenrehan)<br>
[Himani Arora](https://github.com/hhimani)<br>
[Aaroh Gala](https://github.com/AarohGala)<br>

TA/Mentor : [Ken Tu](https://github.com/HuyTu7)<br>
Professor : [Tim Menzies](https://github.com/timm)<br>