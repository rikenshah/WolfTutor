const become_tutor_prompt = require('./prompt/become_tutor_prompt');
const add_availability_prompt = require('./prompt/add_availability_prompt');
const add_more_availability_prompt = require('./prompt/add_more_availability_prompt');
const add_more_subjects_prompt = require('./prompt/add_more_subjects_prompt');
const create_user_prompt = require('./prompt/create_user_prompt');
const add_scheduling_prompt = require('./prompt/add_scheduling_prompt');
const add_review_prompt = require('./prompt/add_review_prompt');
const tutor_info_prompt = require('./prompt/tutor_info_prompt');
const display_date_prompt = require('./prompt/display_date_prompt');
const review_tutor_prompt = require('./prompt/review_tutor_prompt');
const subject_list_prompt = require('./prompt/subject_list_prompt');
const noreview_schedule_prompt = require('./prompt/noreview_schedule_prompt');
const slot_booking_prompt = require('./prompt/slot_booking_prompt');
const booking_confirmation_prompt = require('./prompt/booking_confirmation_prompt');


module.exports = {
  become_tutor_prompt : become_tutor_prompt.become_tutor_prompt,
  add_availability_prompt : add_availability_prompt.add_availability_prompt,
  add_more_availability_prompt : add_more_availability_prompt.add_more_availability_prompt,
  add_more_subjects_prompt : add_more_subjects_prompt.add_more_subjects_prompt,
  create_user_prompt : create_user_prompt.create_user_prompt,
  add_scheduling_prompt : add_scheduling_prompt.add_scheduling_prompt,
  add_review_prompt : add_review_prompt.add_review_prompt,
  Tutor_Display_Info : tutor_info_prompt.tutor_info_prompt,
  DisplayDate : display_date_prompt.display_date_prompt,
  TutorReview : review_tutor_prompt.review_tutor_prompt,
  SubjectList : subject_list_prompt.subject_list_prompt,
  NoreviewSchedule : noreview_schedule_prompt.noreview_schedule_prompt,
  SlotBooking : slot_booking_prompt.slot_booking_prompt,
  BookingConfirmation : booking_confirmation_prompt.booking_confirmation_prompt
};
