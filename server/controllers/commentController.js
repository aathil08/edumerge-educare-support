const asyncHandler = require('../utils/asyncHandler');
const commentService = require('../services/commentService');
const { validateCommentInput } = require('../utils/commentValidation');

const add = asyncHandler(async (req, res) => {
  const input = validateCommentInput(req.body);
  const comment = await commentService.addComment(req.user, req.params.id, input);
  res.status(201).json({ success: true, data: { comment } });
});

const list = asyncHandler(async (req, res) => {
  const comments = await commentService.listComments(req.user, req.params.id);
  res.status(200).json({ success: true, data: { comments } });
});

const activity = asyncHandler(async (req, res) => {
  const activities = await commentService.listActivity(req.user, req.params.id);
  res.status(200).json({ success: true, data: { activities } });
});

module.exports = { add, list, activity };