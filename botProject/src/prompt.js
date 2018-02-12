const become_tutor_prompt = require('./prompt/become_tutor_prompt');
const add_availability_prompt = require('./prompt/add_availability_prompt');
const add_more_availability_prompt = require('./prompt/add_more_availability_prompt');
const add_more_subjects_prompt = require('./prompt/add_more_subjects_prompt');
const add_review_prompt = require('./prompt/add_review_prompt');

module.exports = {
  become_tutor_prompt : become_tutor_prompt.become_tutor_prompt,
  add_availability_prompt : add_availability_prompt.add_availability_prompt,
  add_more_availability_prompt : add_more_availability_prompt.add_more_availability_prompt,
  add_more_subjects_prompt : add_more_subjects_prompt.add_more_subjects_prompt,
  add_review_prompt : add_review_prompt.add_review_prompt
};
