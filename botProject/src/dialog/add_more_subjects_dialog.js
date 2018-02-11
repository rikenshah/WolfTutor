var dialog = {
  title: 'Add Subjects',
  callback_id: 'add_more_subjects_dialog',
  submit_label: 'Submit',
  elements: [
    {
      label: 'Subject',
      type: 'text',
      name: 'subject1',
      hint: 'Enter more subjects (optional)',
      optional: true,
    },
    {
      label: 'Subject',
      type: 'text',
      name: 'subject2',
      hint: 'Enter more subjects (optional)',
      optional: true,
    },
    {
      label: 'Subject',
      type: 'text',
      name: 'subject3',
      hint: 'Enter more subjects (optional)',
      optional: true,
    },
    {
      label: 'Subject',
      type: 'text',
      name: 'subject4',
      hint: 'Enter more subjects (optional)',
      optional: true,
    },
    {
      label: 'Subject',
      type: 'text',
      name: 'subject5',
      hint: 'Enter more subjects (optional)',
      optional: true,
    },
  ],
}

module.exports= {add_more_subjects_dialog: dialog};