// @ts-check
/** @typedef {import("knex")} Knex */

const { onUpdateTrigger } = require('../knexfile')

/**
 * @param {Knex} knex
 */
const up = async knex => {
  await knex.schema.createTable('courses', table => {
    table.increments('id')
    table.text('name').notNullable()
    // audit timestamps
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated_at')
  })

  await knex.schema.createTable('exams', table => {
    table.increments('id')
    table.integer('course_id').unsigned()
    table
      .foreign('course_id')
      .references('id')
      .inTable('courses')
      .onDelete('cascade')
      .onUpdate('cascade')
    table.text('file_name').notNullable()
    table.text('mime_type').notNullable()
    table.text('file_path').notNullable()
    table.timestamp('upload_date').notNullable()
    // audit timestamps
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated_at')
  })

  await knex.raw(onUpdateTrigger('courses'))
  await knex.raw(onUpdateTrigger('exams'))
}

/**
 * @param {Knex} knex
 */
const down = async knex => {
  await knex.schema.dropTable('exams')
  await knex.schema.dropTable('courses')
}

exports.up = up
exports.down = down
