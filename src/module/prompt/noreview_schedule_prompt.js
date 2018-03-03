const noreview_schedule = (tutor_reviews) => 
{

    console.log(tutor_reviews);
    const details = 
    
    [
      {
        title: 'No reviews for this tutor available! Do you still want to book?',
        callback_id: 'schedule_now',
        attachment_type: 'default',
        actions: 
        [
          {
            "name": "schedule",
            "text": "Schedule",
            "value": tutor_reviews,
            "type": "button",
          }
        ]
      }
    ]

    return (details);
};



module.exports = 
{
  noreview_schedule
};