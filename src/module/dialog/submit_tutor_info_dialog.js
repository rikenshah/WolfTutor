const subjectsModel = require('../../model/subject');

module.exports= {
  submit_tutor_info_dialog: function(callback){
    subjectsModel.get_all_subjects(function(res){
      subjects = [];
      res.forEach(function(s){
        subjects.push({label:s.name,value:s.name})
      });
      console.log(subjects);
      var dialog = {
        title: 'Become a Tutor',
        callback_id: 'submit_tutor_info_dialog',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Major',
            type: 'select',
            name: 'major',
            options: [
                   { label: 'Computer Science', value: 'Computer Science' },
                   { label: 'Computer Engineering', value: 'Computer Engineering' },
                   { label: 'Electrical Engineering', value: 'Electrical Engineering' },
                   { label: 'Mechanical Engineering', value: 'Mechanical Engineering' },
                   { label: 'Chemical Engineering', value: 'Chemical Engineering' },
            ],
          },
          {
            label: 'Degree',
            type: 'select',
            name: 'degree',
            options: [
              { label: 'Bachelors', value: 'Bachelors' },
              { label: 'Masters', value: 'Masters' },
              { label: 'Associate', value: 'Associate' },
              { label: 'High School GED', value: 'High School GED' },
            ],
          },
          {
            label: 'Subjects',
            type: 'select',
            name: 'subject',
            options: subjects,
          },
          {
            label: 'Rate',
            type: 'text',
            subtype: 'number',
            name: 'rate',
            hint: 'If you want to tutor for free then type 0 above',
          },
          {
            label: 'Summary',
            type: 'textarea',
            name: 'summary',
            optional: true,
          },
        ],
      }
      callback(dialog);
    });
  }//End of function
};
