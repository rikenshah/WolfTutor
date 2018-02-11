var prompt = {
    title: 'Do you want to add more availability options?',
    callback_id: 'add_more_availability_prompt',
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
module.exports= {add_more_availability_prompt: prompt};
