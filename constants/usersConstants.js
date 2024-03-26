module.exports.ACCESS_LEVELS = {
  create: 'CREATE',
  read: 'READ',
  update: 'UPDATE',
  delete: 'DELETE',
};
const levels = this.ACCESS_LEVELS;

module.exports.roles = {
  admin: {
    value: 'admin',
    accessLevels: [levels.create, levels.read, levels.update, levels.delete],
  },
  driver: {
    value: 'driver',
    accessLevels: [levels.create, levels.read, levels.update],
  },
  company: {
    value: 'company',
    accessLevels: [levels.create, levels.read, levels.update],
  },
};
