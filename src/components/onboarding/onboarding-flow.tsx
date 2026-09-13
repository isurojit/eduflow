"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, GraduationCap, School, Plus, X } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { cn } from "@/lib/utils/cn";
import { collegeSubjects, schoolSubjects } from "@/data/syllabus/starter";
import { onboardingSchema, type OnboardingValues } from "@/features/onboarding/schema";
import { useEduFlowStore } from "@/store/use-eduflow-store";

const classes = ["Class 6","Class 7","Class 8","Class 9","Class 10","Class 11","Class 12"];
const boards = ["CBSE","ICSE","State Board","Other"];
const courses = ["B.Tech","BCA","B.Sc","BBA","B.Com","BA","MCA","MBA","M.Sc","M.Tech","MBBS","Other"];
const branches = ["Computer Science","Information Technology","Mechanical Engineering","Electrical Engineering","Electronics","Civil Engineering","Data Science","Artificial Intelligence","Commerce","Finance","Economics","Other"];

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-medium text-[#B8AAAE]">{label}</span>{children}{error && <span className="mt-1.5 block text-xs text-[#D56A80]">{error}</span>}</label>;
}
const inputClass = "focus-ring min-h-12 w-full border border-white/[0.09] bg-[#11090B] px-4 text-sm text-[#F7F2F3] outline-none transition placeholder:text-[#665b5f] focus:border-[#78152A]";

export function OnboardingFlow() {
  const router = useRouter();
  const completeOnboarding = useEduFlowStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(1);
  const [customSubject, setCustomSubject] = useState("");
  const [direction, setDirection] = useState(1);
  const { register, control, watch, setValue, trigger, handleSubmit, formState: { errors } } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
    defaultValues: { name: "", educationLevel: "school", subjects: [], classGrade: "", board: "", collegeName: "", course: "", year: "", semester: "", branch: "" },
  });
  const level = watch("educationLevel");
  const subjects = watch("subjects") ?? [];
  const subjectOptions = useMemo(() => level === "school" ? schoolSubjects : collegeSubjects, [level]);

  const next = async () => {
    const fields: (keyof OnboardingValues)[] = step === 1 ? ["name"] : step === 2 ? ["educationLevel"] : step === 3 ? (level === "school" ? ["classGrade","board"] : ["collegeName","course","year","semester","branch"]) : ["subjects"];
    if (!(await trigger(fields))) return;
    setDirection(1); setStep((s) => Math.min(4, s + 1));
  };
  const back = () => { setDirection(-1); setStep((s) => Math.max(1, s - 1)); };
  const toggleSubject = (name: string) => setValue("subjects", subjects.includes(name) ? subjects.filter((s) => s !== name) : [...subjects, name], { shouldValidate: true });
  const addCustom = () => {
    const clean = customSubject.trim();
    if (!clean) return;
    const standardMatch = subjectOptions.find((subject) => subject.toLowerCase() === clean.toLowerCase());
    const normalized = standardMatch ?? clean;
    if (!subjects.some((subject) => subject.toLowerCase() === normalized.toLowerCase())) {
      setValue("subjects", [...subjects, normalized], { shouldValidate: true });
    }
    setCustomSubject("");
  };
  const submit = handleSubmit((values) => { completeOnboarding(values); router.replace("/dashboard"); });

  return <main className="min-h-screen px-5 py-5 sm:px-8 lg:px-12">
    <div className="mx-auto max-w-[1180px]">
      <header className="flex items-center justify-between border-b border-white/[0.07] pb-5"><Logo/><span className="text-xs text-[#807478]">Step {step} of 4</span></header>
      <div className="mt-4 h-px bg-white/[0.05]"><motion.div animate={{ width: `${step * 25}%` }} className="h-px bg-[#A81736]" /></div>
      <div className="grid min-h-[calc(100dvh-115px)] items-center py-8 sm:py-10 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
        <aside className="mb-10 lg:mb-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.23em] text-[#A81736]">Set up your study space</p>
          <h1 className="mt-4 max-w-md font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.03] tracking-[-.045em] sm:text-5xl">
            A few details, then EduFlow can feel like yours.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-[#807478]">We only create starter content for supported subjects. Custom subjects stay yours to shape, so nothing is presented as an official syllabus when it is not.</p>
        </aside>

        <section className="relative min-h-[560px] border-l sm:min-h-[520px] border-white/[0.07] pl-0 lg:pl-12">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={step} custom={direction} initial={{ opacity:0, x: direction * 18, filter:"blur(4px)" }} animate={{ opacity:1,x:0,filter:"blur(0px)" }} exit={{ opacity:0,x:direction * -12,filter:"blur(3px)" }} transition={{ duration:.25 }}>
              {step === 1 && <div className="max-w-xl"><p className="text-xs text-[#807478]">01 / About you</p><h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-.035em] sm:text-3xl">What should we call you?</h2><p className="mt-2 text-sm text-[#807478]">Your name is used for the dashboard and study summaries.</p><div className="mt-8"><Field label="Your name" error={errors.name?.message}><input autoFocus {...register("name")} className={inputClass} placeholder="e.g. Aisha Khan" /></Field></div></div>}
              {step === 2 && <div><p className="text-xs text-[#807478]">02 / Education level</p><h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-.035em] sm:text-3xl">Where are you studying right now?</h2><div className="mt-8 grid gap-4 sm:grid-cols-2">
                <Controller control={control} name="educationLevel" render={({ field }) => <>{([ ["school",School,"School","Classes 6–12 · board-based study"], ["college",GraduationCap,"College","Degree · semester · branch"] ] as const).map(([value,Icon,title,copy]) => <button type="button" key={value} onClick={() => { field.onChange(value); setValue("subjects", []); }} className={cn("focus-ring min-h-44 border p-5 text-left transition", field.value === value ? "border-[#78152A] bg-[#180C10]" : "border-white/[0.08] bg-[#0d090a] hover:border-white/15")}><div className="flex items-start justify-between"><Icon className="size-6 text-[#C52845]"/>{field.value === value && <Check className="size-4 text-[#D9A5B0]"/>}</div><p className="mt-10 text-lg font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-[#807478]">{copy}</p></button>)}</>} />
              </div></div>}
              {step === 3 && <div><p className="text-xs text-[#807478]">03 / Academic details</p><h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-.035em] sm:text-3xl">Tell us how your course is structured.</h2><div className="mt-8 grid gap-5 sm:grid-cols-2">
                {level === "school" ? <><Field label="Class / Grade" error={errors.classGrade?.message}><select {...register("classGrade")} className={inputClass}><option value="">Select class</option>{classes.map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Board" error={errors.board?.message}><select {...register("board")} className={inputClass}><option value="">Select board</option>{boards.map(x=><option key={x}>{x}</option>)}</select></Field></> : <>
                  <Field label="College name" error={errors.collegeName?.message}><input {...register("collegeName")} className={inputClass} placeholder="College / university" /></Field>
                  <Field label="Course / Degree" error={errors.course?.message}><select {...register("course")} className={inputClass}><option value="">Select course</option>{courses.map(x=><option key={x}>{x}</option>)}</select></Field>
                  <Field label="Year" error={errors.year?.message}><select {...register("year")} className={inputClass}><option value="">Select year</option>{["1st Year","2nd Year","3rd Year","4th Year","5th Year"].map(x=><option key={x}>{x}</option>)}</select></Field>
                  <Field label="Semester" error={errors.semester?.message}><select {...register("semester")} className={inputClass}><option value="">Select semester</option>{Array.from({length:10},(_,i)=>`Semester ${i+1}`).map(x=><option key={x}>{x}</option>)}</select></Field>
                  <div className="sm:col-span-2"><Field label="Stream / Branch" error={errors.branch?.message}><select {...register("branch")} className={inputClass}><option value="">Select branch</option>{branches.map(x=><option key={x}>{x}</option>)}</select></Field></div>
                </>}
              </div></div>}
              {step === 4 && <div><p className="text-xs text-[#807478]">04 / Subjects</p><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="mt-4 text-[1.7rem] font-semibold tracking-[-.035em] sm:text-3xl">Choose what you&apos;re studying.</h2><p className="mt-2 text-sm text-[#807478]">Pick as many as you need. You can change this later.</p></div><span className="text-xs text-[#B8AAAE]">{subjects.length} selected</span></div>
                <div className="mt-7 flex max-h-[280px] flex-wrap content-start gap-2 overflow-y-auto pr-2">{subjectOptions.map(name => <button type="button" key={name} onClick={()=>toggleSubject(name)} className={cn("focus-ring min-h-11 border px-4 text-sm transition", subjects.includes(name) ? "border-[#78152A] bg-[#4A0D1A]/45 text-white" : "border-white/[0.08] text-[#B8AAAE] hover:border-white/15")}>{subjects.includes(name) && <Check className="mr-2 inline size-3.5"/>}{name}</button>)}{subjects.filter(s=>!subjectOptions.includes(s)).map(name=><button type="button" key={name} onClick={()=>toggleSubject(name)} className="focus-ring min-h-11 border border-[#78152A] bg-[#4A0D1A]/45 px-4 text-sm">{name}<X className="ml-2 inline size-3.5"/></button>)}</div>
                <div className="mt-5 flex gap-2"><input value={customSubject} onChange={e=>setCustomSubject(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addCustom();}}} className={inputClass} placeholder="Add a custom subject"/><button type="button" onClick={addCustom} className="focus-ring grid min-w-12 place-items-center border border-white/[0.1] bg-[#180C10] hover:border-[#78152A]" aria-label="Add custom subject"><Plus className="size-4"/></button></div>{errors.subjects?.message && <p className="mt-2 text-xs text-[#D56A80]">{errors.subjects.message}</p>}
              </div>}
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-0 left-0 flex w-full items-center justify-between pt-8 lg:left-12 lg:w-[calc(100%-3rem)]">
            <button type="button" onClick={step === 1 ? ()=>router.push("/") : back} className="focus-ring inline-flex min-h-11 items-center gap-2 px-2 text-sm text-[#807478] transition hover:text-white"><ArrowLeft className="size-4"/>{step === 1 ? "Back home" : "Back"}</button>
            {step < 4 ? <button type="button" onClick={next} className="focus-ring inline-flex min-h-12 items-center gap-3 rounded-full bg-[#A81736] px-6 text-sm font-semibold transition hover:bg-[#C52845]">Continue <ArrowRight className="size-4"/></button> : <button type="button" onClick={submit} className="focus-ring inline-flex min-h-12 items-center gap-3 rounded-full bg-[#A81736] px-6 text-sm font-semibold transition hover:bg-[#C52845]">Create my dashboard <ArrowRight className="size-4"/></button>}
          </div>
        </section>
      </div>
    </div>
  </main>;
}
