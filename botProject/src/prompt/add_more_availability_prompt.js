var prompt = [
    {
        title: 'Do you want to add your availibility?',
        callback_id: 'tutor_add_availibility',
        attachment_type: 'default',
        actions: [
            {
                "name":"yes",
                "text": "Yes",
                "value": "yes",
                "type": "button",
            },
            {
                "name":"no",
                "text": "No",
                "value": "no",
                "type": "button",
            }
        ]
    }
]
module.exports= {add_more_availability_prompt: prompt};
