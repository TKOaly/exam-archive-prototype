// @ts-check
/** @typedef {import("knex")} Knex */

/** @param {Knex} knex */
const up = async knex => {
  await knex.schema.alterTable('courses', tb => {
    tb.index('name', 'courses_name_idx')
    tb.index('removed_at', 'courses_removed_at_idx')
  })
  await knex.schema.alterTable('exams', tb => {
    tb.index('course_id', 'exams_course_id_idx')
    tb.index('removed_at', 'exams_removed_at_idx')
    tb.index('upload_date', 'exams_upload_date_idx')
  })
}

/** @param {Knex} knex */
const down = async knex => {
  await knex.schema.alterTable('exams', tb => {
    tb.dropIndex('name', 'courses_name_idx')
    tb.dropIndex('removed_at', 'courses_removed_at_idx')
  })
  await knex.schema.alterTable('courses', tb => {
    tb.dropIndex('course_id', 'exams_course_id_idx')
    tb.dropIndex('removed_at', 'exams_removed_at_idx')
    tb.dropIndex('upload_date', 'exams_upload_date_idx')
  })
}

exports.up = up
exports.down = down
