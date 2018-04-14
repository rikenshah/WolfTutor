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
    database = 'heroku_d754621w' #heroku_d754621w == database that is connected to heroku

    DIR = os.path.dirname(os.getcwd())
    load_dotenv(DIR + '/.env')

    URI = os.getenv('MONICA_MLAB_URI')

    #client = MongoClient() #defaults to localhost on port 27017
    client = MongoClient(URI) #or use the mlab URI


    #------ point to a database ------
    db = client[database] #or client.database

    #------ access a database collection ------
    coll = db['tutor'] #or db.collection

    #------ find all ratings given to a tutor ------
    collList = coll.find()
    for tutor in collList:
        print(tutor['user_id'])
        for review in tutor['reviews']:
            print(review['rating'])
        print()
        



   

if __name__ == "__main__":
    main()