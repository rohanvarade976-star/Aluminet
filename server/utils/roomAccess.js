const StudyGroup = require('../models/StudyGroup');

const OBJECT_ID = /^[0-9a-f]{24}$/i;
const DIRECT_ROOM = /^([0-9a-f]{24})_([0-9a-f]{24})$/i;

/**
 * Decide whether a user may read, join or write to a chat room.
 *
 *   <idA>_<idB>   direct room: user must be one of the two ids
 *   group:<id>    study group room: user must be a member of that group
 *   user:<id>     personal room: only that same user
 *   anything else denied
 *
 * Admins get no special access here; they may only read rooms through
 * admin endpoints. Fails closed on any error.
 *
 * @param {{ _id: any }} user  req.user or socket.user
 * @param {string} room
 * @returns {Promise<boolean>}
 */
async function canAccessRoom(user, room) {
  try {
    if (!user || !user._id || typeof room !== 'string') return false;
    const userId = user._id.toString().toLowerCase();

    const direct = DIRECT_ROOM.exec(room);
    if (direct) {
      return direct[1].toLowerCase() === userId || direct[2].toLowerCase() === userId;
    }

    if (room.startsWith('group:')) {
      const groupId = room.slice('group:'.length);
      if (!OBJECT_ID.test(groupId)) return false;
      return !!(await StudyGroup.exists({ _id: groupId, members: user._id }));
    }

    if (room.startsWith('user:')) {
      const targetId = room.slice('user:'.length);
      return OBJECT_ID.test(targetId) && targetId.toLowerCase() === userId;
    }

    return false;
  } catch (err) {
    console.error('canAccessRoom error:', err.message);
    return false;
  }
}

module.exports = { canAccessRoom };
