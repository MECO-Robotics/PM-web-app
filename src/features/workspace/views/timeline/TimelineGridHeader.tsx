import type React from "react";

import { TimelineGridHeaderContent } from "./components/TimelineGridHeaderContent";
import type { TimelineGridHeaderProps } from "./timelineGridHeaderTypes";

export const TimelineGridHeader: React.FC<TimelineGridHeaderProps> = (props) => {
  return <TimelineGridHeaderContent {...props} />;
};
