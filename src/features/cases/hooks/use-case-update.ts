"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { patchCase } from "@/features/cases/api/client";
import { queryKeys } from "@/lib/query-keys";
import type { CasePatch, SupportCase } from "@/features/cases/types";
import { useToast } from "@/components/ui/toast";

export function useCaseUpdate(id: string, users: { id: string; name: string; initials: string }[]) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [failedPatch, setFailedPatch] = useState<CasePatch | null>(null);
  const mutation = useMutation({
    mutationFn: (patch: CasePatch) => patchCase(id, patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cases.detail(id) });
      const previous = queryClient.getQueryData<SupportCase>(queryKeys.cases.detail(id));
      if (previous) {
        const assignee = "assigneeId" in patch ? users.find((user) => user.id === patch.assigneeId) ?? null : previous.assignee;
        queryClient.setQueryData<SupportCase>(queryKeys.cases.detail(id), {
          ...previous, ...("status" in patch ? { status: patch.status! } : {}), ...("priority" in patch ? { priority: patch.priority! } : {}),
          ...("assigneeId" in patch ? { assignee } : {}), updatedAt: new Date().toISOString(),
        });
      }
      setFailedPatch(null);
      return { previous };
    },
    onError: (error, patch, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.cases.detail(id), context.previous);
      setFailedPatch(patch);
      toast("Couldn't update this case", "Your previous value has been restored.", "error");
      void error;
    },
    onSuccess: (updated) => {
      setFailedPatch(null);
      queryClient.setQueryData(queryKeys.cases.detail(id), updated);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cases.all });
      toast("Case updated", undefined, "success");
    },
  });
  return { ...mutation, failedPatch, retry: () => { if (failedPatch) mutation.mutate(failedPatch); } };
}
