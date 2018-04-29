from statistics import mean
import random
from writeToExcel import writeToExcel

class User():
    def __init__(self, id_, name):
        '''
        id_: 9-char user id (alpha and numeric)
        name: string name of user
        '''
        self.id_ = id_
        self.name = name

    def getID(self):
        return self.id_

    def getName(self):
        return self.name

class Tutor(User):
    def __init__(self, id_, name, reviews, gpa):
        '''
        id_: 9-char user id (alpha and numeric)
        name: string name of user
        reviews: list of reviews [{rating: number 1-5, user_id: id_ of reviewee}]
        '''
        self.id_ = id_
        self.name = name
        self.gpa = gpa
        if len(reviews) > 0:
            self.rating = mean([review['rating'] for review in reviews])
        else:
            self.rating = 0

    def getID(self):
            return self.id_

    def getName(self):
        return self.name

    def getGPA(self):
        return self.gpa

    def getRating(self):
        return self.rating


def histogram(bins, data, low, high):
    '''
    bins: number of histogram values starting at 0
    data: list of numerical values to normalize in histogram
    low: lowest numerical data value
    high: highest numerical data value
    '''
    step = (high - low) / (bins)

    histogram = [0]*(bins+1)

    for x in data:
        val = int((x - low) / step)
        histogram[val] += 1
    
    return histogram


def main():
    title = "test2"
    NUM_USERS_TO_CREATE = 1000
    NUM_TUTORS_TO_CREATE = 1000 #less or equal to users
    MAX_NUM_REVIEWS = 20
    LOW_GPA = 2.5
    HIGH_GPA = 4.0
    allUsers = []
    allTutors = []
    uapp = allUsers.append
    tapp = allTutors.append

    # CREATE USERS & TUTORS
    charList = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3','4','5','6','7','8','9']
    used = [] 
    for user in range(NUM_USERS_TO_CREATE):
        #random sampling without replacement
        id_ = "".join(random.sample(charList, 9)) #9 = length of original user_id for myself
        while id_ in used:
            id_ = "".join(random.sample(charList, 9))
        used.append(id_)

        name = "User " + str(user + 1)
        uapp(User(id_, name))
        

    for j in range(NUM_TUTORS_TO_CREATE):
        user = random.sample(allUsers, 1)[0]
        num_of_reviews = random.randint(0, MAX_NUM_REVIEWS)
        gpa = round(random.uniform(LOW_GPA, HIGH_GPA), 1) #float with 1 decimal

        # REVIEWS
        reviews = []
        for k in range(num_of_reviews):
            random_user_id = random.choice(used)
            while random_user_id == user.getID():   #make sure they can't review themselves
                random_user_id = random.choice(used)
            rating = random.randint(1, 5)

            reviews.append({
                "rating": rating,
                "user_id": random_user_id
                })

        tutor = Tutor(user.getID(), user.getName(), reviews, gpa)
        tapp(tutor)


    # WRITE TO EXCEL
    histGPA = histogram(15, [tutor.getGPA() for tutor in allTutors], LOW_GPA, HIGH_GPA)
    histRating = histogram(40, [tutor.getRating() for tutor in allTutors], 1, 5)
    writeToExcel("gpa-" + title, histGPA, NUM_TUTORS_TO_CREATE)
    writeToExcel("ratings-" + title, histRating, NUM_TUTORS_TO_CREATE)
        
if __name__ == "__main__":
    main()