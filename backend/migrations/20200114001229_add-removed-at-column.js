// @ts-check
/** @typedef {import("knex")} Knex */

/** @param {Knex} knex */
const up = async knex => {
  await knex.schema.alterTable('courses', tb => {
    tb.timestamp('removed_at')
  })
  await knex.schema.alterTable('exams', tb => {
    tb.timestamp('removed_at')
  })
}

/** @param {Knex} knex */
const down = async knex => {
  await knex.schema.alterTable('exams', tb => {
    tb.dropColumn('removed_at')
  })
  await knex.schema.alterTable('courses', tb => {
    tb.dropColumn('removed_at')
  })
}

exports.up = up
exports.down = down
