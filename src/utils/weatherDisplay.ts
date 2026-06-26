export function degreesToCompass(degrees: number): string {
  const directions = [
    'N', 'NNØ', 'NØ', 'ØNØ',
    'Ø', 'ØSØ', 'SØ', 'SSØ',
    'S', 'SSV', 'SV', 'VSV',
    'V', 'VNV', 'NV', 'NNV',
  ];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function formatUpdatedAt(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function windSpeedLabel(speedMs: number): {
  label: string;
  level: 'calm' | 'moderate' | 'strong' | 'severe';
} {
  if (speedMs < 5) return { label: 'Svak vind', level: 'calm' };
  if (speedMs < 11) return { label: 'Moderat vind', level: 'moderate' };
  if (speedMs < 17) return { label: 'Sterk vind', level: 'strong' };
  return { label: 'Sterk kuling+', level: 'severe' };
}
