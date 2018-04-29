instructions to perform the usefulness test:

1, Python 2.7 run script file 'creat_tutor_students.py' to create test data in the current directory: tutorlist.json contains tutor data in json format, userlist.json contains user data in json format.

2, Run npm test. This will actual perform the usefulness test using test data created in the last step. This will output two json files in ../ directory: gpa_data.json contains test results from gpa-first option, rating_data.json contains test results from rating-first option.

3, Python 2.7 run script file 'evaluate_usefulness_test_result.py' to caculate the test accuracy by counting if the suggested tutor in the known answer.