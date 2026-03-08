import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllAccountItems,
  createAccountItem,
  updateAccountItem,
  deleteAccountItem,
  bulkCreateAccountItems,
  deleteAllAccountItems,
} from "./db";

export const appRouter = router({
  accountItems: router({
    list: publicProcedure.query(async () => getAllAccountItems()),

    create: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          sortOrder: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        let sortOrder = input.sortOrder ?? 0;
        if (input.sortOrder === undefined) {
          const items = await getAllAccountItems();
          sortOrder =
            items.length > 0 ? Math.max(...items.map((i) => i.sortOrder)) + 1 : 0;
        }
        return createAccountItem({ name: input.name, sortOrder });
      }),

    update: publicProcedure
      .input(
        z.object({
          id: z.number().int(),
          name: z.string().min(1).optional(),
          sortOrder: z.number().int().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAccountItem(id, data);
        return { success: true };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ input }) => {
        await deleteAccountItem(input.id);
        return { success: true };
      }),

    bulkImport: publicProcedure
      .input(
        z.object({
          items: z.array(z.string().min(1)),
          replaceAll: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        if (input.replaceAll) await deleteAllAccountItems();
        const existing = await getAllAccountItems();
        const startOrder =
          existing.length > 0
            ? Math.max(...existing.map((i) => i.sortOrder)) + 1
            : 0;
        const newItems = input.items.map((name, idx) => ({
          name,
          sortOrder: input.replaceAll ? idx : startOrder + idx,
        }));
        await bulkCreateAccountItems(newItems);
        return { count: newItems.length };
      }),
  }),
});

export type AppRouter = typeof appRouter;
