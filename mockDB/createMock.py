from pymongo import MongoClient
from dotenv import load_dotenv
import os
import random

def main():
    """
    Create a user with random stats, 
    then make that user a tutor of one subject at one availability
    """
    NUM_USERS_TO_CREATE = 1  
    MAX_PAY_RATE = 30

    #------ Connect to Database ------
    database = 'heroku_d754621w' #heroku_d754621w == database that is connected to heroku

    DIR = os.path.dirname(os.getcwd())
    load_dotenv(DIR + '/.env')

    URI = os.getenv('MONICA_MLAB_URI')

    #client = MongoClient() #defaults to localhost on port 27017
    client = MongoClient(URI) #or use the mlab URI


    #------ point to a database ------
    db = client[database] #or client.database

    #------ access a database collection ------
    #coll = db['user'] #or db.collection




    #------ CREATE DOCUMENTS ------
    """
    'If you attempt to add documents to a collection that does not exist, 
      MongoDB will create the collection for you.'
    Document IDs are automatically added if one is not presented
    """

    #------create users ------

    print("Creating Users...")
    print()


    subjects = ['Operating Systems', 'Algorithms']
    days = ['Sunday', 'Monday, Tuesday, Wednesday, Thursday, Friday, Saturday']
    degrees = ['Bachelors', 'Masters', 'Associate', 'High School GED']
    majors = ['Computer Science', 'Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering']

    charList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
    used = ['U9SNMABGR', 'UA2E6JQSF']

    for user in range(NUM_USERS_TO_CREATE):
        coll = db.user

        #random sampling without replacement
        id_ = "".join(random.sample(charList, 9)) #9 = length of original user_id for myself
        while id_ in used:
            id_ = "".join(random.sample(charList, 9))
        used.append(id_)

        name = "User " + str(user + 1)
        email = "tutor" + str(user + 1) + "@ncsu.edu"
        __v = 0
        

        coll.insert_one(
            {
                "user_id": id_,
                "name": name,
                "email": email,
                "phone": "",
                "points": 100,
                "__v": 0
            }
        )

        # ------ create tutor after creating user ------
        print("Creating Tutors...")
        print()
        coll = db.tutor
        

        subject = random.choice(subjects) #random element chosen
        day = random.choice(days)
        rate = random.randint(0, MAX_PAY_RATE)
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
                        "day": day,
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
                "__v": 0
            }
        )

if __name__ == "__main__":
    main()




"""
--------- EXTRA DB INFO ---------

reservation
{
    "_id": {
        "$oid": "5ac7d9359aac8500140e48d9"
    },
    "userid": "U9SNMABGR",
    "tutorid": "0N7AJED92",
    "date": "Apr 08 2018 00:00:00 GMT-0500",
    "day": "Sunday",
    "from": "1030",
    "to": "1100",
    "active": "yes",
    "__v": 0
}
"""
