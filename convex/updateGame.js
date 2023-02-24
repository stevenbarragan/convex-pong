import { mutation } from "./_generated/server";

export default mutation(async ({ db }, id, attrs) => {
	await db.patch(id, attrs);
})
