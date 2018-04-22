import json
import collections
data = json.load(open('../gpa_data.json'))
tutor_counter = collections.defaultdict(int)
for tutor in data:
	tutor_counter[tutor['user_id']] += 1
print tutor_counter

# data = json.load(open('../ind_data.json'))
# tutor_counter = collections.defaultdict(int)
# for tutor in data:
# 	tutor_counter[tutor['user_id']] += 1
# print tutor_counter