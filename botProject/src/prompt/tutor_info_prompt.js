const tutor_info_display = (json_file) => 
{

    // console.log(json_file);
    const details = 
    {
        "text": "Tutor Details",
        "attachments": 
        [
          {

                "fields": 
                [
                    {
                        "title": 'Name',
                        "value": json_file.name,
                        "short": true,
                    },
                    {
                        "title": 'Email',
                        "value": json_file.email,
                        "short": true,
                    },
                    {
                        "title": 'Major',
                        "value": json_file.major,
                        "short": true,
                    },
                    {
                        "title": 'Degree',
                        "value": json_file.degree,
                        "short": true,
                    },
                    {
                        "title": 'Summary',
                        "value": json_file.summary,
                        "short": true,
                    },
                    {
                        "title": 'Rate',
                        "value": json_file.rate,
                        "short": true,
                    },

                ],

            },
            {
                "fallback": "Review and Scheduling",
                "title": "Review and Scheduling",
                "callback_id": "review_and_scheduling",
                "attachment_type": "default",
                "actions": 
                [
                    {
                        "name": "review",
                        "text": "Review",
                        "type": "button",
                        "value": json_file.user_id,
                    },
                    {
                        "name": "schedule",
                        "text": "Schedule",
                        "type": "button",
                        "value": "schedule " + json_file.user_id,
                    }
                ]
            }
        ]
    }

    return (details);
};



module.exports = 
{
    tutor_info_display
};