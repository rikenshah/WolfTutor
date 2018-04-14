module.exports= {
    submit_tutor_features_dialog: function(callback){
        var dialog = {
            title: 'Tell us about yourself',
            callback_id: 'submit_tutor_features_dialog',
            submit_label: 'Submit',
            elements: [{
                label: 'GPA',
                type: 'text',
                subtype: 'number',
                name: 'gpa'
            }]
        };
        callback(dialog);
    }//End of function
};
