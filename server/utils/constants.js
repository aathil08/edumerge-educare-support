const ROLES = Object.freeze({
  STUDENT: 'STUDENT',
  STAFF: 'STAFF',
  MANAGER: 'MANAGER',
});

const ROLE_VALUES = Object.values(ROLES);

module.exports = { ROLES, ROLE_VALUES };