const tutor_review_display = (tutor_reviews) => 
{

    // console.log("Inside review_tutor_prompyt", tutor_reviews);
    const details = 
    [
      {
        attachment_type: 'default',
        callback_id: 'schedule_now',
        fields: 
        [
          {
              "title": 'Review',
              "value": tutor_reviews[1],
              "short": true,
          },
          {
              "title": 'Rating',
              "value": tutor_reviews[2],
              "short": true,
          },
        ],
        actions: 
        [
          {
            "name": "Schedule",
            "text": "Schedule",
            "value": tutor_reviews[0],
            "type": "button",
          }, 
        ]

      }
    ]

    return (details);
};

module.exports = 
{
    tutor_review_display
};