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
      options: [
        { label: 'Operating Systems', value: 'Operating Systems' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Processor Design', value: 'Processor Design' },
      ],
    },
    {
      label: 'Subject',
      type: 'select',
      name: 'subject2',
      hint: 'Enter more subjects (optional)',
      optional: true,
      options: [
        { label: 'Operating Systems', value: 'Operating Systems' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Processor Design', value: 'Processor Design' },
      ],
    },
    {
      label: 'Subject',
      type: 'select',
      name: 'subject3',
      hint: 'Enter more subjects (optional)',
      optional: true,
      options: [
        { label: 'Operating Systems', value: 'Operating Systems' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Processor Design', value: 'Processor Design' },
      ],
    },
    {
      label: 'Subject',
      type: 'select',
      name: 'subject4',
      hint: 'Enter more subjects (optional)',
      optional: true,
      options: [
        { label: 'Operating Systems', value: 'Operating Systems' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Processor Design', value: 'Processor Design' },
      ],
    },
    {
      label: 'Subject',
      type: 'select',
      name: 'subject5',
      hint: 'Enter more subjects (optional)',
      optional: true,
      options: [
        { label: 'Operating Systems', value: 'Operating Systems' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Processor Design', value: 'Processor Design' },
      ],
    },
  ],
}

module.exports= {add_more_subjects_dialog: dialog};
