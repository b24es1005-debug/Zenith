import { handlers } from "@/auth";
import { validateAuthEnvironment } from "@/lib/env";

export const GET = async (...args: Parameters<typeof handlers.GET>) => {
	validateAuthEnvironment();
	return handlers.GET(...args);
};

export const POST = async (...args: Parameters<typeof handlers.POST>) => {
	validateAuthEnvironment();
	return handlers.POST(...args);
};