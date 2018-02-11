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
      options: [
        { label: 'Operating Systems', value: 'Operating Systems' },
        { label: 'Algorithms', value: 'Algorithms' },
        { label: 'Software Engineering', value: 'Software Engineering' },
        { label: 'Processor Design', value: 'Processor Design' },
      ],
    },
    {
      label: 'Rate',
      type: 'text',
      subtype: 'number',
      name: 'rate',
      hint: 'If you want to tutor for free then type 0 above',
    },
    // {
    //   label: 'Availability',
    //   type: 'select',
    //   name: 'availability',
    //   options: [
    //     { label: 'Monday', value: 'Monday' },
    //     { label: 'Tuesday', value: 'Tuesday' },
    //     { label: 'Wednesday', value: 'Wednesday' },
    //     { label: 'Thursday', value: 'Thursday' },
    //     {label: 'Friday', value: 'Friday'},
    //     {label: 'Saturday', value: 'Saturday'},
    //     {label: 'Sunday', value: 'Saturday'},
    //   ],
    // },

    {
      label: 'Summary',
      type: 'textarea',
      name: 'summary',
      optional: true,
    },
  ],
}



module.exports= {submit_tutor_info_dialog: dialog};
