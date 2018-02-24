const booking_confirmation = (title_value, value_value) => 
{

    // console.log("Inside booking_confirmation", title_value, value_value);
    const details = 
    [
      {

        title: title_value,
        callback_id: 'save_booking',
        attachment_type: 'default',
        actions: 
        [
          {
              "name": "yes",
              "text": "Yes",
              "value": value_value + " yes",
              "type": "button",
          },
          {
              "name": "no",
              "text": "No",
              "value": value_value + " no",
              "type": "button",
          }
        ]
      }
    ]


    return (details);
};

module.exports = 
{
  booking_confirmation
};

