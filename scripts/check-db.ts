
import { db } from "../server/db";
import { users, events } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
    console.log("Checking database content...");

    try {
        const allUsers = await db.select().from(users);
        console.log(`Found ${allUsers.length} users.`);
        allUsers.forEach(u => {
            console.log(`User: ${u.username} (ID: ${u.id}, Email: ${u.email})`);
        });

        const allEvents = await db.select().from(events);
        console.log(`Found ${allEvents.length} events.`);
        allEvents.forEach(e => {
            console.log(`Event: ${e.name} (ID: ${e.id}, HostUserId: ${e.hostUserId}, HostParticipates: ${e.hostParticipates})`);
        });

        // Check for mismatches
        for (const event of allEvents) {
            if (event.hostUserId) {
                const host = allUsers.find(u => u.id === event.hostUserId);
                if (!host) {
                    console.error(`MISMATCH: Event ${event.name} has hostUserId ${event.hostUserId} but no user found with that ID!`);
                } else {
                    console.log(`MATCH: Event ${event.name} linked to user ${host.username} (ID: ${host.id})`);
                }
            } else {
                console.warn(`Event ${event.name} has NO hostUserId!`);
            }
        }

    } catch (error) {
        console.error("Error querying database:", error);
    }
    process.exit(0);
}

main();
