export function reviewSignal(candidates) {
  if (!candidates?.length) return { signal: 'none', margin: null };
  const sorted=[...candidates].sort((a,b)=>Number(b.match_score)-Number(a.match_score));
  const top=sorted[0];
  const second=sorted[1];
  const topScore=Number(top.match_score || 0);
  const secondScore=second ? Number(second.match_score || 0) : null;
  const margin=secondScore === null ? topScore : Math.round((topScore-secondScore)*10000)/10000;
  const needsComponents=Boolean(top.metadata?.likely_requires_components);

  if (needsComponents) return { signal: 'components_review', margin };
  if (topScore < 0.90) return { signal: 'weak', margin };
  if (second && margin < 0.05) return { signal: 'ambiguous_high', margin };
  if (topScore >= 0.95) return { signal: 'unique_high', margin };
  return { signal: 'manual_review', margin };
}

export function formatCandidate(candidate, rank) {
  if (!candidate) return null;
  return {
    rank,
    id: candidate.id,
    name: candidate.candidate_name,
    price: candidate.candidate_price === null ? null : Number(candidate.candidate_price),
    score: Number(candidate.match_score),
    confidence: candidate.metadata?.confidence || null,
    priceSource: candidate.metadata?.price_source || null,
    priceError: candidate.metadata?.price_error || null,
    url: candidate.candidate_url,
    source: candidate.source_url,
    requiresComponents: Boolean(candidate.metadata?.likely_requires_components)
  };
}


export function componentReviewSignal(recipeComponents, candidateGroups) {
  const components = Array.isArray(recipeComponents) ? recipeComponents : [];
  if (!components.length) return { signal: 'incomplete_recipe', covered: 0, total: 0 };

  let covered = 0;
  for (const component of components) {
    if ((candidateGroups.get(component.key) || []).length) covered++;
  }

  if (covered < components.length) {
    return { signal: 'incomplete_recipe', covered, total: components.length };
  }

  let secondaryVariation = false;

  for (const component of components) {
    const list = [...(candidateGroups.get(component.key) || [])]
      .sort((a,b)=>Number(b.match_score)-Number(a.match_score));

    const top = Number(list[0].match_score || 0);
    const second = list[1] ? Number(list[1].match_score || 0) : null;
    const role = component.role || (component.kind === 'accessory' ? 'secondary' : 'structural');

    if (role === 'structural') {
      if (top < 0.90) {
        return { signal: 'wrong_recipe', covered, total: components.length };
      }
      if (second !== null && Math.abs(top-second) < 0.05) {
        return { signal: 'wrong_recipe', covered, total: components.length };
      }
    } else {
      if (top < 0.80) {
        return { signal: 'wrong_recipe', covered, total: components.length };
      }
      if (top < 0.95) secondaryVariation = true;
    }
  }

  if (secondaryVariation) {
    return { signal: 'similar_recipe_match', covered, total: components.length };
  }

  return { signal: 'exact_recipe_match', covered, total: components.length };
}

export function formatComponentCandidate(candidate, rank) {
  if (!candidate) return null;
  return {
    rank,
    id: candidate.id,
    key: candidate.component_key,
    label: candidate.component_label,
    kind: candidate.component_kind,
    quantity: Number(candidate.quantity),
    name: candidate.candidate_name,
    price: candidate.candidate_price === null ? null : Number(candidate.candidate_price),
    score: Number(candidate.match_score),
    confidence: candidate.metadata?.confidence || null,
    priceSource: candidate.metadata?.price_source || null,
    priceError: candidate.metadata?.price_error || null,
    url: candidate.candidate_url,
    source: candidate.source_url
  };
}
