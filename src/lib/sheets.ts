export async function sendToSheetForm(p: {
  timestamp: string; 
  nombre: string; 
  email: string; 
  sessionId?: string; 
  userAgent?: string;
  scoreTotal?: number; 
  scoreEstres?: number; 
  scoreAnimo?: number; 
  scoreConfianza?: number;
  safetyQuestionAnswer?: number | string;
  webAppUrl: string;
}) {
  const body = new URLSearchParams({
    timestamp: p.timestamp,
    nombre: p.nombre ?? '',
    email: p.email ?? '',
    sessionId: p.sessionId ?? '',
    userAgent: p.userAgent ?? '',
    scoreTotal: String(p.scoreTotal ?? ''),
    scoreEstres: String(p.scoreEstres ?? ''),
    scoreAnimo: String(p.scoreAnimo ?? ''),
    scoreConfianza: String(p.scoreConfianza ?? ''),
    safetyQuestionAnswer: String(p.safetyQuestionAnswer ?? '')
  }).toString();

  await fetch(p.webAppUrl, {
    method: 'POST',
    mode: 'no-cors', // sin preflight
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body,
    keepalive: true
  });
}