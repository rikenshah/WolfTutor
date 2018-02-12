var dialog = {
  title: 'Please rate your tutor',
  callback_id: 'add_review_dialog',
  submit_label: 'Submit',
  elements: [
    {
      label: 'Rating',
      type: 'select',
      name: 'rating',
      options: [
        { label: '0', value: '0' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' },
        { label: '4', value: '4' },
      ],
    },
    {
      label: 'Review',
      type: 'textarea',
      name: 'review',
      optional: true,
    },
  ],
}

module.exports= {add_review_dialog: dialog};