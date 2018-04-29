var prompt = [
    {
        title: 'Please provide information about your expertise',
        callback_id: 'tutor_features_prompt',
        attachment_type: 'default',
        actions: [{
            "name":"add",
            "text": "Add",
            "value": "add",
            "type": "button"
        }]
    }
]


module.exports= {tutor_features_prompt: prompt};
