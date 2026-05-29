export function startTimer(label) {
  const startedAt = performance.now();

  return {
    end(step = "total") {
      const duration = Math.round(performance.now() - startedAt);
      console.log(`[timing] ${label} ${step}: ${duration}ms`);
      return duration;
    }
  };
}
