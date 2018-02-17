var dialog = {
  title: 'Create your profile',
  callback_id: 'create_new_user_dialog',
  submit_label: 'Submit',
  elements: [
    {
      label: 'Name',
      type: 'text',
      name: 'user_name',
    },
    {
      label: 'Email',
      type: 'text',
      name: 'email',
    },
    {
      label: 'Phone Number',
      type: 'text',
      name: 'phone',
      optional: true,
    },
  ],
}

module.exports= {create_new_user_dialog : dialog};