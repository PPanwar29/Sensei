"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";
import { getOrCreateUser } from "@/lib/checkUser";

export async function updateUser(data) {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	const user = await getOrCreateUser();

	try {
		// Start a transaction to handle both operations
		const result = await db.$transaction(
			async (tx) => {
				// First check if industry exists
				let industryInsight = await tx.industryInsight.findUnique({
					where: {
						industry: data.industry,
					},
				});

				// If industry doesn't exist, create it with default values
				if (!industryInsight) {
					const insights = await generateAIInsights(data.industry);

					// Fix demandLevel to match Prisma enum
					if (insights.demandLevel) {
						insights.demandLevel = insights.demandLevel.toUpperCase();
					}
					// Fix marketOutlook to match Prisma enum
					if (insights.marketOutlook) {
						insights.marketOutlook = insights.marketOutlook.toUpperCase();
					}

					industryInsight = await db.industryInsight.create({
						data: {
							industry: data.industry,
							...insights,
							nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
						},
					});
				}

				// Now update the user
				const updatedUser = await tx.user.update({
					where: {
						id: user.id,
					},
					data: {
						industry: data.industry,
						experience: data.experience,
						bio: data.bio,
						skills: data.skills,
					},
				});

				return { updatedUser, industryInsight };
			},
			{
				timeout: 10000, // default: 5000
			},
		);

		revalidatePath("/");
		return { success: true, ...result };
	} catch (error) {
		console.error("Error updating user and industry:", error.message);
		throw new Error("Failed to update profile" + error.message);
	}
}

export async function getUserOnboardingStatus() {
	const { userId } = await auth();
	if (!userId) throw new Error("Unauthorized");

	try {
		const user = await getOrCreateUser();

		return {
			isOnboarded: !!user?.industry,
		};
	} catch (error) {
		console.error("Error checking onboarding status:", error);
		throw new Error("Failed to check onboarding status");
	}
}
