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

export function thunderRiskLabel(probabilityOfThunder?: number): {
  label: string;
  level: 'none' | 'low' | 'moderate' | 'high';
} {
  if (probabilityOfThunder === undefined || probabilityOfThunder < 10) {
    return { label: 'Ingen lynrisiko', level: 'none' };
  }
  if (probabilityOfThunder < 30) {
    return { label: 'Lav lynrisiko', level: 'low' };
  }
  if (probabilityOfThunder < 60) {
    return { label: 'Moderat lynrisiko', level: 'moderate' };
  }
  return { label: 'Høy lynrisiko', level: 'high' };
}

export function fogProbabilityLabel(fogAreaFraction?: number): {
  label: string;
  level: 'low' | 'moderate' | 'high';
} {
  if (fogAreaFraction === undefined || fogAreaFraction < 20) {
    return { label: 'Lav sannsynlighet for tåke', level: 'low' };
  }
  if (fogAreaFraction < 60) {
    return { label: 'Moderat sannsynlighet for tåke', level: 'moderate' };
  }
  return { label: 'Høy sannsynlighet for tåke', level: 'high' };
}
