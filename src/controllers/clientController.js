import { Client } from '../db/models/Client.js';

export const getAllClients = async (req, res, next) => {
  try {
    const clients = await Client.find({}, 'name publicKey createdAt updatedAt').sort({ createdAt: -1 });
    res.json(clients);
  } catch (error) {
    next(error);
  }
};
