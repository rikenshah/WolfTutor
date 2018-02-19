var prompt = [
  {
    title: 'Do you want to schedule a tutoring session?',
    callback_id: 'schedule_now',
    attachment_type: 'default',
    actions: [
        {
            "name":"Schedule",
            "text": "Schedule",
            "value": "schedule",
            "type": "button",
        },
        // {
        //     "name":"no",
        //     "text": "No",
        //     "value": "no",
        //     "type": "button",
        // }
    ]
  }
]

module.exports= {add_scheduling_prompt: prompt};