import json
import collections

# choose top K recommended tutors as the accuracy evaluation test
topK = 10

#loading data from generated test data: userlist.json(user table in db), tutorlist.json(tutor table in db).

json_user = json.load(open('userlist.json'))
json_tutor = json.load(open('tutorlist.json'))
user_name = {}
user_index = {}
json_tutor_topK = sorted(json_tutor, key=lambda x: x['gpa'], reverse=True)[:topK+1]

tutor_topK = set()
for tutor in json_tutor_topK:
	tutor_topK.add(tutor['user_id'])
print tutor_topK


test_gpa_data = json.load(open('../gpa_data.json'))
tutor_gpa_counter = collections.defaultdict(int)
for tutor in test_gpa_data:
	tutor_gpa_counter[tutor['user_id']] += 1
print tutor_gpa_counter.keys()

correct_in_topK = 0
for tutorID in tutor_gpa_counter.keys():
	if tutorID in tutor_topK:
		correct_in_topK += tutor_gpa_counter[tutorID]
accracy = correct_in_topK * 100.0/len(test_gpa_data)
print 'The accuracy is: ' + str(accracy) + '%'
# data = json.load(open('../ind_data.json'))
# tutor_counter = collections.defaultdict(int)
# for tutor in data:
# 	tutor_counter[tutor['user_id']] += 1
# print tutor_counter


# with open("good_tutor_gpa.csv", "w") as good_tutor_gpa:
#     title = 'UserID,Name,GPA,'
#         for i, u in enumerate(json_user):
#             user_name[u['user_id']] = u['name']
#             user_index[u['user_id']] = i
#             title = title + 'Rating' + str(i+1) + ','
#         good_tutor_gpa.write(title+'\n')
#         json_tutor.sort(key=lambda x: x['gpa'], reverse=True)
        
#         for tutor in json_tutor:
#             line = tutor['user_id'] + ',' + user_name[tutor['user_id']] +',' + str(tutor['gpa'])
#             lineofreview = ''
#             reviewrating = []
#             for review in tutor['reviews']:
#                 lineofreview = lineofreview + ',' + str(review['rating'])
#                 reviewrating.append(review['rating'])
#             line  = line + lineofreview + ','
#             good_tutor_gpa.write(line+'\n')  