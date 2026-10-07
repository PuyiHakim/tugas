"use client";

import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, RotateCw } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { AvatarInitials, Skeleton } from "@/components/ui/display";
import { Input, Select, Textarea } from "@/components/ui/fields";
import { useToast } from "@/components/ui/toast";
import { createCase, fetchCustomers, fetchUsers } from "@/features/cases/api/client";
import { createCaseSchema, type CreateCaseInput } from "@/features/cases/schemas/case-schemas";
import { queryKeys } from "@/lib/query-keys";
import { CASE_TAGS } from "@/features/cases/types";

function FieldError({ id, children }: { id: string; children?: string }) { return children ? <p className="field-error" id={id}>{children}</p> : null; }

export function CreateCaseForm() {
  const router = useRouter(); const client = useQueryClient(); const { toast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const customers = useQuery({ queryKey: queryKeys.customers.search(""), queryFn: () => fetchCustomers() });
  const users = useQuery({ queryKey: queryKeys.users.all(), queryFn: fetchUsers });
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema), mode: "onTouched",
    defaultValues: { customerId: "", subject: "", description: "", priority: "medium", assigneeId: null, tags: [] },
  });
  const subjectValue = useWatch({ control, name: "subject" }) ?? "";
  const descriptionValue = useWatch({ control, name: "description" }) ?? "";
  const assigneeValue = useWatch({ control, name: "assigneeId" });
  const selectedTags = useWatch({ control, name: "tags" }) ?? [];
  const mutation = useMutation({
    mutationFn: createCase,
    onSuccess: (created) => { setSubmitError(null); toast("Case created successfully", created.caseNumber, "success"); void client.invalidateQueries({ queryKey: queryKeys.cases.all }); router.push(`/cases/${created.id}`); },
    onError: (error) => { setSubmitError(error instanceof Error ? error.message : "Something went wrong. Your entered information is safe to retry."); },
  });
  const submit = (values: CreateCaseInput) => { setSubmitError(null); mutation.mutate(values); };
  const isBusy = mutation.isPending || isSubmitting;
  return <>
    <Link href="/cases" className="back-link"><ArrowLeft size={15} />Back to cases</Link>
    <PageHeader eyebrow="Cases" title="Create a case" description="Capture the customer context so the right person can take it from here." />
    <form className="create-case-form" noValidate onSubmit={handleSubmit(submit)}>
      <section className="form-section"><div className="form-section-heading"><span className="form-step">01</span><div><h2>Customer request</h2><p>Start with the customer and a clear summary of the issue.</p></div></div>
        <div className="form-field"><label htmlFor="customer">Customer <span className="required-mark">*</span></label><p className="field-hint" id="customer-hint">Select the customer who raised this request.</p>{customers.isPending ? <Skeleton className="skeleton-control" /> : customers.isError ? <div className="inline-warning"><span>We couldn’t load customers.</span><Button variant="quiet" size="small" type="button" onClick={() => void customers.refetch()}>Retry</Button></div> : <Select id="customer" required {...register("customerId")} aria-describedby={`customer-hint${errors.customerId ? " customer-error" : ""}`} aria-invalid={Boolean(errors.customerId)} disabled={isBusy}><option value="">Choose a customer</option>{customers.data?.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</Select>}<FieldError id="customer-error">{errors.customerId?.message}</FieldError></div>
        <div className="form-field"><label htmlFor="subject">Subject <span className="required-mark">*</span></label><Input id="subject" required placeholder="For example, invoice download returns an error" maxLength={120} {...register("subject")} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "subject-error" : undefined} disabled={isBusy} /><div className="field-meta"><FieldError id="subject-error">{errors.subject?.message}</FieldError><span>{subjectValue.length}/120</span></div></div>
        <div className="form-field"><label htmlFor="description">Description <span className="required-mark">*</span></label><p className="field-hint" id="description-hint">Include what happened, what the customer expected, and any useful context.</p><Textarea id="description" required rows={6} placeholder="Describe the request and what the customer has already tried…" maxLength={3000} {...register("description")} aria-invalid={Boolean(errors.description)} aria-describedby={`description-hint${errors.description ? " description-error" : ""}`} disabled={isBusy} /><div className="field-meta"><FieldError id="description-error">{errors.description?.message}</FieldError><span>{descriptionValue.length}/3,000</span></div></div>
      </section>
      <section className="form-section"><div className="form-section-heading"><span className="form-step">02</span><div><h2>Ownership and priority</h2><p>Set an initial priority and route the case to the right teammate.</p></div></div>
        <div className="form-two-columns"><div className="form-field"><label htmlFor="priority">Priority <span className="required-mark">*</span></label><Select id="priority" {...register("priority")} disabled={isBusy}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></Select></div>
          <div className="form-field"><label htmlFor="assignee">Assignee</label><p className="field-hint" id="assignee-hint">You can leave this unassigned.</p>{users.isPending ? <Skeleton className="skeleton-control" /> : users.isError ? <div className="inline-warning"><span>We couldn’t load teammates.</span><Button variant="quiet" size="small" type="button" onClick={() => void users.refetch()}>Retry</Button></div> : <Controller name="assigneeId" control={control} render={({ field }) => <Select id="assignee" name={field.name} ref={field.ref} onBlur={field.onBlur} value={field.value ?? ""} onChange={(event) => field.onChange(event.target.value || null)} aria-describedby="assignee-hint" disabled={isBusy}><option value="">Unassigned</option>{users.data?.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</Select>} />}{assigneeValue && users.data?.find((user) => user.id === assigneeValue) && <span className="assignee-cell selected-assignee"><AvatarInitials initials={users.data.find((user) => user.id === assigneeValue)!.initials} />{users.data.find((user) => user.id === assigneeValue)!.name}</span>}</div></div>
        <fieldset className="tag-fieldset" aria-describedby={errors.tags ? "tags-error" : undefined}><legend>Tags <span className="tag-limit">Choose up to 5</span></legend><div className="tag-options">{CASE_TAGS.map((tag) => <label className={`tag-option ${selectedTags.includes(tag) ? "is-selected" : ""}`} key={tag}><input type="checkbox" checked={selectedTags.includes(tag)} disabled={isBusy || selectedTags.length >= 5 && !selectedTags.includes(tag)} onChange={(event) => setValue("tags", event.target.checked ? [...selectedTags, tag] : selectedTags.filter((selected) => selected !== tag), { shouldValidate: true })} />{tag}</label>)}</div><FieldError id="tags-error">{errors.tags?.message}</FieldError></fieldset>
      </section>
      {submitError && <div className="form-error-banner" role="alert"><span className="form-error-icon">!</span><div><strong>We couldn’t create this case</strong><p>{submitError}</p></div><Button variant="secondary" size="small" type="button" disabled={isBusy} onClick={() => void handleSubmit(submit)()}><RotateCw size={14} />Try again</Button></div>}
      <div className="form-actions"><Button asChild variant="quiet"><Link href="/cases">Cancel</Link></Button><Button type="submit" disabled={isBusy || customers.isPending || customers.isError}>{isBusy ? <><span className="button-spinner" />Creating…</> : "Create case"}</Button></div>
    </form>
  </>;
}
