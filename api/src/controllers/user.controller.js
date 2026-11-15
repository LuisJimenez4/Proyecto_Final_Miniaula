import * as userService from '../services/user.service.js';

export const getProfile = async (req, res, next) => {
  const profile = await userService.getProfile(req.user.id);
  res.status(200).json(profile);
};

export const updateProfile = async (req, res, next) => {
  const updatedUser = await userService.updateProfile(req.user.id, req.body);
  res.status(200).json(updatedUser);
};
