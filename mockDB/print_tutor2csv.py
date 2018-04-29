from pymongo import MongoClient
from dotenv import load_dotenv
import os
import random
import datetime

def main():
    """
    acess to database collection 'tutor' and 'user', output to a formated csv file to easy compare user interface data. 
    """

    #------ Connect to Database ------
    database = 'admin' 

    # DIR = os.path.dirname(os.getcwd())
    # load_dotenv(DIR + '/.env')

    # URI = os.getenv('MONICA_MLAB_URI')
    client = MongoClient() #defaults to localhost on port 27017
    # client = MongoClient(URI) #or use the mlab URI


    #------ point to a database ------
    db = client[database] #or client.database

    #------ access a database collection ------
    

    #------ find all ratings given to a tutor ------
    tutor_list = db.tutor.find()
    user_list = db.user.find()
    user_name = {}
    #------ print out the header of file ---------
    print 'User ID, User Name,   GPA, Avg Rating,  review rating 1, review rating 2, review rating 3, review rating 4, review rating 5, review rating 6, review rating 7'
    #------ building a dict from id to name ------
    for user in user_list:
        user_name[user['user_id']] = user['name']

    for tutor in tutor_list:
        line = tutor['user_id'] + ', ' + user_name[tutor['user_id']] +', ' + str(tutor['gpa'])
        for review in tutor['reviews']:
            line = line + ', ' + str(review['rating'])
        print line
        


if __name__ == "__main__":
    main()