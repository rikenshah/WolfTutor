const tutor_date_display = (slots_date) => 
{

    // console.log("Inside display_date_prompyt", slots_date);
    const details = 
    [
        {
            "fallback": "If you could read this message, you'd be choosing something fun to do right now.",
            "attachment_type": "default",
            "callback_id": "date_selection",
            "actions": 
            [
                {
                    "name": "date_list",
                    "text": "Pick a date...",
                    "type": "select",
                    "options": slots_date,
                }
            ]
        }
    ]


    return (details);
};

module.exports = 
{
    tutor_date_display
};