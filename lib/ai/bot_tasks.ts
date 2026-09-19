import { prisma } from "@/lib/db";

/**
 * Registers an ongoing task for an autonomous bot in PostgreSQL via Prisma.
 * Returns the task ID so it can be finished later.
 */
export async function startBotTask(
  userId: string,
  botId: string,
  title: string,
  notes: string = "",
  priority: string = "normal"
): Promise<string | null> {
  try {
    const task = await prisma.task.create({
      data: {
        user_id: userId,
        bot_id: botId,
        title,
        notes,
        priority,
        status: "ongoing",
      },
    });
    return task.id;
  } catch (err) {
    console.error("[BotTasks] Exception starting task:", err);
    return null;
  }
}

/**
 * Marks a bot task as finished.
 */
export async function finishBotTask(taskId: string): Promise<void> {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "finished",
        completed_at: new Date(),
      },
    });
  } catch (err) {
    console.error("[BotTasks] Exception finishing task:", err);
  }
}
