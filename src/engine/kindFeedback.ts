export function coloursFeedback(avoidedNames: readonly string[]): string {
  return `${avoidedNames.join(" and ")} was not on their wish list this time. One of their favourite shades would win them over.`;
}

export function budgetFeedback(spend: number, budget: number): string {
  return `Materials came to ${spend} coins against a budget of ${budget}. Leftover stock on your shelf is a lovely way to save.`;
}

export function deadlineFeedback(deliveredDay: number, deadlineDay: number): string {
  return `It arrived on day ${deliveredDay}, after the big day on day ${deadlineDay}. Keep an eye on the calendar so your work gets its moment.`;
}
