const subjectsModel = require('../../model/subject');

module.exports= {
  add_more_subjects_dialog : function(callback){
  subjectsModel.get_all_subjects(function(res){
    subjects = [];
    res.forEach(function(s){
      subjects.push({label:s.name,value:s.name})
    });
    // console.log(subjects);
    var dialog = {
      title: 'Add Subjects',
      callback_id: 'add_more_subjects_dialog',
      submit_label: 'Submit',
      elements: [
        {
          label: 'Subject',
          type: 'select',
          name: 'subject1',
          hint: 'Enter more subjects (optional)',
          optional: true,
          options: subjects,
        },
        {
          label: 'Subject',
          type: 'select',
          name: 'subject2',
          hint: 'Enter more subjects (optional)',
          optional: true,
          options: subjects,
        },
        {
          label: 'Subject',
          type: 'select',
          name: 'subject3',
          hint: 'Enter more subjects (optional)',
          optional: true,
          options: subjects,
        },
        {
          label: 'Subject',
          type: 'select',
          name: 'subject4',
          hint: 'Enter more subjects (optional)',
          optional: true,
          options: subjects,
        },
        {
          label: 'Subject',
          type: 'select',
          name: 'subject5',
          hint: 'Enter more subjects (optional)',
          optional: true,
          options: subjects,
        },
      ],
    }
    callback(dialog);
  });
  }//end of function
}
