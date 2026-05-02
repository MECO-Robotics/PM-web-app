import type { InteractiveTutorialChapter } from "@/app/interactiveTutorial/interactiveTutorialTypes";

import { operationsChapter } from "@/app/interactiveTutorialData/operationsChapter";
import { outreachChapter } from "@/app/interactiveTutorialData/outreachChapter";
import { planningChapter } from "@/app/interactiveTutorialData/planningChapter";

export const INTERACTIVE_TUTORIAL_CHAPTERS: InteractiveTutorialChapter[] = [
  planningChapter,
  operationsChapter,
  outreachChapter,
];
