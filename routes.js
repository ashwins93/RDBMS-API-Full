const express = require('express');
const router = express.Router();

const db = require('knex')(require('./knexfile').development);

function sendError(res, status, message) {
  return res.status(status).json({ message });
}

router
  .route('/cohorts')
  .get(function(_, res, next) {
    db('cohorts')
      .then(data => {
        res.status(200).json(data);
      })
      .catch(next);
  })
  .post(function(req, res, next) {
    if (!req.body.name)
      return sendError(res, 400, 'You need to provide a name');

    db('cohorts')
      .insert({ name: req.body.name })
      .then(data => {
        res
          .status(201)
          .json({ message: 'Cohort created successfully', id: data });
      })
      .catch(next);
  });

router
  .route('/cohorts/:id')
  .get(function(req, res, next) {
    db('cohorts')
      .where({ id: req.params.id })
      .then(data => {
        if (!data)
          return sendError(
            res,
            404,
            'The cohort with specified ID cannot be found',
          );
        res.status(200).json(data);
      })
      .catch(next);
  })
  .put(function(req, res, next) {
    if (!req.body.name)
      return sendError(res, 400, 'You need to provide a name to update');

    db('cohorts')
      .update({ name: req.body.name })
      .where({ id: req.params.id })
      .then(data => {
        if (!data)
          return sendError(
            res,
            404,
            'The cohort with the specified ID cannot be found',
          );

        res
          .status(200)
          .json({ message: 'Record updated successfully', count: data });
      })
      .catch(next);
  })
  .delete(function(req, res, next) {
    db('cohorts')
      .delete()
      .where({ id: req.params.id })
      .then(data => {
        if (!data)
          return sendError(
            res,
            404,
            'The cohort with the specified ID cannot be found',
          );

        res
          .status(200)
          .json({ message: 'Record deleted successfully', count: data });
      })
      .catch(next);
  });

router.route('/cohorts/:id/students').get(function(req, res, next) {
  db.select({
    id: 'students.id',
    student_name: 'students.name',
    cohort_name: 'cohorts.name',
  })
    .from('cohorts')
    .innerJoin('students', 'students.cohort_id', 'cohorts.id')
    .where('cohorts.id', req.params.id)
    .then(data => {
      if (!data)
        return sendError(
          res,
          404,
          'The cohort with the specified ID cannot be found',
        );

      res.status(200).json(data);
    })
    .catch(next);
});

router
  .route('/students')
  .get(function(_, res, next) {
    db('students')
      .then(data => {
        res.status(200).json(data);
      })
      .catch(next);
  })
  .post(function(req, res, next) {
    if (!req.body.name)
      return sendError(res, 400, 'You need to provide a name');

    const newStudent = {
      name: req.body.name,
    };

    if (req.body.cohort_id) newStudent.cohort_id = req.body.cohort_id;

    db('students')
      .insert(newStudent)
      .then(data => {
        res
          .status(201)
          .json({ message: 'Student created successfully', id: data });
      })
      .catch(next);
  });

router
  .route('/students/:id')
  .get(function(req, res, next) {
    db('students')
      .where({ id: req.params.id })
      .then(data => {
        if (!data)
          return sendError(
            res,
            404,
            'The student with specified ID cannot be found',
          );
        res.status(200).json(data);
      })
      .catch(next);
  })
  .put(function(req, res, next) {
    const { name, cohort_id } = req.body;
    if (!name && !cohort_id)
      return sendError(
        res,
        400,
        'You need to provide a name or cohort_id to update',
      );

    const updatedObj = {};

    if (name) updatedObj.name = name;
    if (cohort_id) updatedObj.cohort_id = cohort_id;

    db('students')
      .update(updatedObj)
      .where({ id: req.params.id })
      .then(data => {
        if (!data)
          return sendError(
            res,
            404,
            'The student with the specified ID cannot be found',
          );

        res
          .status(200)
          .json({ message: 'Record updated successfully', count: data });
      })
      .catch(next);
  })
  .delete(function(req, res, next) {
    db('students')
      .delete()
      .where({ id: req.params.id })
      .then(data => {
        if (!data)
          return sendError(
            res,
            404,
            'The student with the specified ID cannot be found',
          );

        res
          .status(200)
          .json({ message: 'Record deleted successfully', count: data });
      })
      .catch(next);
  });

module.exports = router;
