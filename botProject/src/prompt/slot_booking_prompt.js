const slot_booking = (title_value, value_value) => 
{

    // console.log("Inside slots_booking", title_value, value_value);
    const details = 
    [
      {
        title: title_value,
        callback_id: 'booking_now',
        attachment_type: 'default',
        actions: 
        [
          {
            "name": "booking",
            "text": "Book",
            "value": value_value,
            "type": "button",
          }
        ]
      }
    ]


    return (details);
};

module.exports = 
{
  slot_booking
};
