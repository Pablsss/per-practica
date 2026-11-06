import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const attempts=sqliteTable('attempts',{
 id:text('id').primaryKey(),userId:text('user_id').notNull(),examId:text('exam_id').notNull(),answers:text('answers').notNull(),startedAt:text('started_at').notNull(),finishedAt:text('finished_at'),duration:integer('duration').notNull().default(0),status:text('status').notNull().default('in_progress'),correct:integer('correct'),passed:integer('passed')
},t=>[index('attempts_user').on(t.userId,t.startedAt)]);
