const waitersApp = (db) => {

  const getRole = async (waiterName) => {
    const name = waiterName.name;
    if (name) {
      const waiter = await db.oneOrNone(
        `select role from waiter_registration where waiter_name = '${name}'`
      );
      const role = waiter.role;

      if (role === "waiter") return "waiter";
      else if (role === "admin") return "admin";
      else return null;
    }
  };

  let waitersId;

  const setWaiterId = async (waiterName) => {
    const availableWaiter = await db.oneOrNone(
      `select waiter_id from waiter_registration where waiter_name = $1`,
      waiterName
    );
    waitersId = availableWaiter.waiter_id;
  };

  const selectShift = async (shift) => {
    const checksShift = Array.isArray(shift);

    if (!checksShift || shift.length < 3) {
      return null;
    } else if (checksShift && shift.length >= 3 && shift.length <= 5) {
      shift.forEach(async (oneShift) => {
        const checkHelper = await selectShiftHelper(waitersId, oneShift);
        if (checkHelper) {
          await db.none(
            `insert into availability (waiter_id, waiter_shift) values ('${waitersId}', '${oneShift}')`
          );
        }
      });
    } else {
      return false;
    }
  };

  const selectShiftHelper = async (id, shift) => {
    const availability = await db.any(
      `select * from availability where waiter_id = ${id} and waiter_shift = '${shift}'`
    );
    return availability.length === 0;
  };

  const availableWaiters = async () =>
    await db.manyOrNone(
       `SELECT waiter_registration.waiter_name, shifts.day, waiter_registration.waiter_id 
        FROM waiter_registration INNER JOIN availability 
        ON waiter_registration.waiter_id = availability.waiter_id 
        INNER JOIN shifts ON availability.waiter_shift = shifts.day`
    );

  const updateSelectedDay = async (shift) =>
    await db.none(
      `delete from availability where waiter_shift = '${shift}' and waiter_id = '${waitersId}'`
    );

  const shifts = async () =>
    await db.manyOrNone(
      `select waiter_shift from availability where waiter_id = '${waitersId}'`
    );

  const weekDays = async () => await db.any("select day from shifts");

  const deleteWaiter = async (data) =>
    await db.any(
      `delete from availability where waiter_id = '${data.waiterId}' and waiter_shift = '${data.day}'`
    );

  const deleteWaiters = async () =>
    await db.any("delete from availability");

  return {
    getRole,
    setWaiterId,
    selectShift,
    availableWaiters,
    updateSelectedDay,
    weekDays,
    shifts,
    deleteWaiter,
    deleteWaiters,
  };
};

export default waitersApp;
