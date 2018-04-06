from pymongo import MongoClient
from dotenv import load_dotenv
from os import getenv, path
import random

database = heroku_d754621w

DIR = path.dirname(path.getcwd())
load_dotenv(DIR + '.env')
URI = getenv('MONGO_CONNECTION_STRING')

#client = MongoClient() #defaults to localhost on port 27017
client = MongoClient('URI') #or use the mlab URI


#### point to a database ####
db = client['database'] #or client.database

#### access a database collection ####
coll = db['user'] #or db.collection




#### CREATE DOCUMENTS ####
"""
'If you attempt to add documents to a collection that does not exist, 
  MongoDB will create the collection for you.'
Document IDs are automatically added if one is not presented
"""

## create users ##
users = 1 #number of users to add


subjects = ['Operating Systems', 'Algorithms']
days = ['Sunday', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday']
degrees = ['Bachelors', 'Masters', 'Associate', 'High School GED']
majors = ['Computer Science', 'Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering']

charList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
used = ['U9SNMABGR']

for user in range(users):
    coll = db.user

    #random sampling without replacement
    id_ = "".join(random.sample(charList, 9)) #9 = length of original user_id for myself
    while id_ in used:
        id_ = "".join(random.sample(charList, 9))
    used.append(id_)

    name = "User " + user
    email = "tutor" + str(user) + "@ncsu.edu"
    __v = 0
    

    coll.insert_one(
    {
        "user_id": id_,
        "name": name,
        "email": email,
        "phone": "",
        "points": 100,
        "__v": __v
    }
    )

    ## create TUTOR after creating USER ##
    coll = db.tutor
    

    subject = random.choice(subjects)
    day = random.choice(days)
    rate = random.randint(0, 30)
    degree = random.choice(degrees)
    major = random.choice(majors)

    #randomly choose time between 700 and 2230 hours
    time1 = int(str(random.randint(7, 15)) + random.choice(['00', '30']))
    time2 = int(str(random.randint(12, 22)) + random.choice(['00', '30']))
    while time2 < time1:
        time1 = int(str(random.randint(7, 15)) + random.choice(['00', '30']))
        time2 = int(str(random.randint(12, 22)) + random.choice(['00', '30']))

    coll.insert_one(
    {
        "subjects": [
            {
                "name": subject
            }#,
            #{
            #    "name": "Algorithms"
            #}
        ],
        "availability": [ #from 700 am to 2200 pm
            {
                "day": day
                "from": time1,
                "to": time2
            }#,
            # {
            #     "day": "Tuesday",
            #     "from": 800,
            #     "to": 1230
            # }
        ],
        "reviews": [],
        "user_id": id_,
        "major": major,
        "degree": degree,
        "rate": rate,
        "summary": "",
        "__v": __v
    }
    )
