import { Inngest } from "inngest";

export const inngest = new Inngest({
	id: "sensei",
	name: "Sensei",
	credentials: {
		gemini: {
			apiKey: process.env.GEMINI_API_KEY,
		},
	},
});
