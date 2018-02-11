var prompt = {
    attchments:[
        {
            title: 'Please add your availibility',
            callback_id: 'add_availability_prompt',
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

module.exports= {add_availability_prompt: prompt};
