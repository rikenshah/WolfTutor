from pymongo import MongoClient

client = MongoClient() #defaults to localhost on port 27017

#### point to a database ####
db = client['database'] #or client.databse

#### access a database collection ####
#coll = db.collection or db['collection']




#### CREATE DOCUMENTS ####
"""
'If you attempt to add documents to a collection that does not exist, 
  MongoDB will create the collection for you.'
"""
#coll.insert_one(
# "name": "subject"
#
# )
