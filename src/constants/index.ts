export const DEPARTPEMENTS = ["CS", "Math", "Physics"] as const;

export const DEPARTPEMENT_OPTIONS = DEPARTPEMENTS.map((dept) => ({
  label: dept,
  value: dept,
}));
