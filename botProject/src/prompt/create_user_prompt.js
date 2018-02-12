var prompt = {
    attachments:[
        {
            title: 'Do you want to enroll in WolfTutor',
            callback_id: 'create_user_prompt',
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


module.exports= {create_user_prompt: prompt};
