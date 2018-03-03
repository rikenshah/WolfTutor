var prompt = {
    attachments:[
        {
            title: 'Click here to rate your last session',
            callback_id: 'add_review_prompt',
            attachment_type: 'default',
            actions: [
                {
                    "name":"ok",
                    "text": "Ok",
                    "value": "ok",
                    "type": "button",
                }
            ]
        }
    ]
}
module.exports= {add_review_prompt: prompt};
