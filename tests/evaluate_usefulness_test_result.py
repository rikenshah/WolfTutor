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
print '----Known: top K tutors ID base on gpa-first----'
print tutor_topK


test_gpa_data = json.load(open('../gpa_data.json'))
tutor_gpa_counter = collections.defaultdict(int)
for tutor in test_gpa_data:
	tutor_gpa_counter[tutor['user_id']] += 1
print '----Test Results: top K tutor ID base on gpa-first----'
print tutor_gpa_counter

correct_in_topK = 0
for tutorID in tutor_gpa_counter.keys():
	if tutorID in tutor_topK:
		correct_in_topK += tutor_gpa_counter[tutorID]
accracy = correct_in_topK * 100.0/len(test_gpa_data)

print '--------------------'
print 'The accuracy of gpa-first is: ' + str(accracy) + '%'
