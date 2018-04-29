from pymongo import MongoClient
# from dotenv import load_dotenv
from bson import json_util
import os
import random
import datetime
import json
# Make it work for Python 2+3 and with Unicode
import io
try:
    to_unicode = unicode
except NameError:
    to_unicode = str


class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()

def main():
    """
    Create a user with random stats, 
    then make that user a tutor of one subject at one availability
    """
    NUM_USERS_TO_CREATE = 200 
    MAX_PAY_RATE = 30
    MAX_NUM_REVIEWS = 50  #keep less than num of total users
    #for random dates of reviews
    YEARS_LOWER_BOUND = 2017
    YEARS_UPPER_BOUND = 2018
    LOW_GPA = 1.0
    HIGH_GPA = 4.0
    subjects = ["Operating Systems", "Algorithms", "AI", "Data Mining"]


    print("Creating Users...")
   
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    degrees = ['Bachelors', 'Masters', 'Associate', 'High School GED']
    majors = ['Computer Science', 'Computer Engineering', 'Electrical Engineering', 'Mechanical Engineering', 'Chemical Engineering']

    charList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
    used = [] 
    json_user = []
    for userNO in range(NUM_USERS_TO_CREATE):
        #random sampling without replacement
        id_ = "".join(random.sample(charList, 9)) #9 = length of original user_id for myself
        while id_ in used:
            id_ = "".join(random.sample(charList, 9))
        used.append(id_)

        name = "User" + str(userNO + 1)
        email = "tutor" + str(userNO +1) + "@ncsu.edu"
        

        json_user.append(
            {
                "user_id": id_,
                "name": name,
                "email": email,
                "phone": "",
                "points": 100
            }
        )
    # user_file_name = 'user_' + str(datetime.datetime.now()) + '.js'    
    with io.open('userlist.json', 'w', encoding='utf8') as outfile:
        str_ = json.dumps(json_user,
                      indent=4, sort_keys=True,
                      separators=(',', ': '), ensure_ascii=False)
        outfile.write(to_unicode(str_))

    # ------ create tutors after creating users ------
    print("Creating Tutors...")

    json_tutor = []
    for tutor in used: #used[1:]: avoid yourself if you are the first tutor
        day = random.choice(days)
        rate = random.randint(0, MAX_PAY_RATE)
        degree = random.choice(degrees)
        major = random.choice(majors)
        num_of_reviews = random.randint(0, MAX_NUM_REVIEWS)
        gpa = round(random.uniform(LOW_GPA, HIGH_GPA), 3) #float with 1 decimal

        # REVIEWS
        reviews = []
        sum_review_rating = 0
        for k in range(num_of_reviews):
            random_user_id = random.choice(used)
            #make sure they can't review themselves
            while random_user_id == tutor:
                random_user_id = random.choice(used)
            rating = random.randint(1, 5)
            sum_review_rating += rating
            rating_text = "" #can add a list of possible responses?
            random_date = datetime.datetime(random.randint(YEARS_LOWER_BOUND, YEARS_UPPER_BOUND), random.randint(1, 12), random.randint(1, 28))

            reviews.append({
                "text": rating_text,
                "rating": rating,
                "user_id": random_user_id,
                "date": random_date
                })

        #AVAILABILITY
        #randomly choose time between 700 and 2230 hours
        time1 = int(str(random.randint(7, 15)) + random.choice(['00', '30']))
        time2 = int(str(random.randint(11, 22)) + random.choice(['00', '30']))
        while time2 < time1:
            time1 = int(str(random.randint(7, 15)) + random.choice(['00', '30']))
            time2 = int(str(random.randint(11, 22)) + random.choice(['00', '30']))
        if num_of_reviews: 
            AvgRating = round(sum_review_rating*1.0/num_of_reviews,3)   
        else: AvgRating = 0
        json_tutor.append(
            {   "AvgRating": AvgRating,
                "subjects": [
                    {
                        "name": subjects[0]
                    },
                    {
                        "name": subjects[1]
                    },
                    {
                        "name": subjects[2]
                    },
                    {
                        "name": subjects[3]
                    }
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
                "reviews": reviews,
                "user_id": tutor,
                "major": major,
                "degree": degree,
                "gpa": gpa,
                "rate": rate,
                "summary": "",
            }
        )
    # tutor_file_name = 'tutor_' + str(datetime.datetime.now()) + '.js'    
    with io.open('tutorlist.json', 'w', encoding='utf8') as outfile:
        str_ = json.dumps(json_tutor, default=json_util.default, 
                      indent=4, sort_keys=True,
                      separators=(',', ': '), ensure_ascii=False)
        outfile.write(to_unicode(str_))

    # export good tutors into csv file base on gpa scores
    user_name = {}
    title = 'UserID,Name,GPA,AvgRating,'
    for i, u in enumerate(json_user):
        user_name[u['user_id']] = u['name']
        title = title + 'Rating' + str(i+1) + ','
        

    with open("tutorlist_gpa.csv", "w") as gpa_text_file:
        gpa_text_file.write(title+'\n')
        
        json_tutor.sort(key=lambda x: x['gpa'], reverse=True)
        
        for tutor in json_tutor:
            line = tutor['user_id'] + ',' + user_name[tutor['user_id']] +',' + str(tutor['gpa']) + ',' + str(tutor['AvgRating']) + ','
            for review in tutor['reviews']:
                line = line + str(review['rating']) + ','
            gpa_text_file.write(line+'\n')
    
    with open("tutorlist_Avgrating.csv", "w") as rating_text_file:
        rating_text_file.write(title+'\n')
        
        json_tutor.sort(key=lambda x: x['AvgRating'], reverse=True)
        
        for tutor in json_tutor:
            line = tutor['user_id'] + ',' + user_name[tutor['user_id']] +',' + str(tutor['gpa']) + ',' + str(tutor['AvgRating']) + ','
            for review in tutor['reviews']:
                line = line + str(review['rating']) + ','
            rating_text_file.write(line+'\n')

if __name__ == "__main__":
    main()