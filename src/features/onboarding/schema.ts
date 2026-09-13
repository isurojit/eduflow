import { z } from "zod";

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  educationLevel: z.enum(["school", "college"]),
  classGrade: z.string().optional(),
  board: z.string().optional(),
  collegeName: z.string().optional(),
  course: z.string().optional(),
  year: z.string().optional(),
  semester: z.string().optional(),
  branch: z.string().optional(),
  subjects: z.array(z.string()).min(1, "Choose at least one subject."),
}).superRefine((data, ctx) => {
  if (data.educationLevel === "school") {
    if (!data.classGrade) ctx.addIssue({ code: "custom", path: ["classGrade"], message: "Choose your class." });
    if (!data.board) ctx.addIssue({ code: "custom", path: ["board"], message: "Choose your board." });
  }
  if (data.educationLevel === "college") {
    (["collegeName", "course", "year", "semester", "branch"] as const).forEach((field) => {
      if (!data[field]?.trim()) ctx.addIssue({ code: "custom", path: [field], message: "This field is required." });
    });
  }
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
