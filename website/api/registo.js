// Guarda um email na lista de espera (segmento Resend "Morada AO - Lista de espera").
const SEGMENTO = '16a21ae4-5096-4a2b-87d5-eb8bc75f3a63';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const { email, empresa } = req.body || {};
  // Campo escondido: só robôs o preenchem.
  if (empresa) return res.status(200).json({ ok: true });
  if (typeof email !== 'string' || email.length > 254 || !EMAIL.test(email.trim())) {
    return res.status(400).json({ erro: 'Email inválido' });
  }

  const r = await fetch('https://api.resend.com/contacts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), unsubscribed: false, segments: [{ id: SEGMENTO }] }),
  });
  if (r.ok) return res.status(200).json({ ok: true });

  const texto = await r.text();
  if (r.status === 409 || /already exists/i.test(texto)) return res.status(200).json({ ok: true });
  console.error('resend', r.status, texto);
  return res.status(502).json({ erro: 'Não foi possível registar' });
};
