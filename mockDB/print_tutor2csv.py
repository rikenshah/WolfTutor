from pymongo import MongoClient
from dotenv import load_dotenv
import os
import random
import datetime

def main():
    """
    Access documents in a collection
    Can be used to calculate average ratings of tutor
    """

    #------ Connect to Database ------
    database = 'admin' #heroku_d754621w == database that is connected to heroku

    DIR = os.path.dirname(os.getcwd())
    load_dotenv(DIR + '/.env')

    URI = os.getenv('MONICA_MLAB_URI')
    #client = MongoClient() #defaults to localhost on port 27017
    client = MongoClient(URI) #or use the mlab URI


    #------ point to a database ------
    db = client[database] #or client.database

    #------ access a database collection ------
    

    #------ find all ratings given to a tutor ------
    tutor_list = db.tutor.find()
    user_list = db.user.find()
    user_name = {}
    print 'User ID, User Name,   GPA, Avg Rating,  review rating 1, review rating 2, review rating 3, review rating 4, review rating 5, review rating 6, review rating 7'
    for user in user_list:
        user_name[user['user_id']] = user['name']

    for tutor in tutor_list:
        line = tutor['user_id'] + ', ' + user_name[tutor['user_id']] +', ' + str(tutor['gpa'])
        for review in tutor['reviews']:
            line = line + ', ' + str(review['rating'])
        print line
        



   

if __name__ == "__main__":
    main()