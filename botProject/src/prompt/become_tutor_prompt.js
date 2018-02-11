var become_tutor_prompt = {
    attachments:[
        {
            title: 'Do you want become a tutor',
            callback_id: 'become_tutor_prompt',
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
}


module.exports= {become_tutor_prompt: become_tutor_prompt};
