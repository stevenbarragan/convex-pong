import { mutation } from "./_generated/server";

export default mutation(async ({ db }, id, coordenates) => {
	await db.patch(id, coordenates);
})
