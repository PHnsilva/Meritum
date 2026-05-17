type SendCoinEmailParams = {
  studentName: string;
  studentEmail: string;
  professorName: string;
  amount: number;
  motive: string;
};

type ProfessorSentEmailParams = {
  professorName: string;
  professorEmail: string;
  studentName: string;
  amount: number;
  motive: string;
};

function buildStudentReceiveHtml(p: SendCoinEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Moedas Recebidas</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Voce recebeu moedas!</h2>
    <p>Ola, <strong>${p.studentName}</strong>!</p>
    <p>O professor <strong>${p.professorName}</strong> enviou <strong>${p.amount} moedas</strong> para voce.</p>
    <div style="background:#f0f9ff;border-left:4px solid #2563eb;padding:16px;margin:24px 0;border-radius:4px">
      <p style="margin:0;color:#1e40af"><strong>Motivo:</strong> ${p.motive}</p>
    </div>
    <p style="color:#64748b;font-size:14px">Acesse o sistema para ver seu saldo atualizado.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildProfessorSentHtml(p: ProfessorSentEmailParams): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Confirmacao de Envio</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Envio de moedas confirmado</h2>
    <p>Ola, <strong>${p.professorName}</strong>!</p>
    <p>Voce enviou <strong>${p.amount} moedas</strong> para o aluno <strong>${p.studentName}</strong>.</p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;margin:24px 0;border-radius:4px">
      <p style="margin:0;color:#15803d"><strong>Motivo registrado:</strong> ${p.motive}</p>
    </div>
    <p style="color:#64748b;font-size:14px">A transacao foi registrada no seu extrato.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildProfessorActivationHtml(name: string, tempPassword: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Ativacao de Conta</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Ativacao de conta — Professor</h2>
    <p>Ola, <strong>${name}</strong>!</p>
    <p>Sua senha temporaria para acesso ao sistema Meritum e:</p>
    <div style="background:#fefce8;border-left:4px solid #ca8a04;padding:16px;margin:24px 0;border-radius:4px;text-align:center">
      <p style="margin:0;font-size:1.5rem;font-weight:700;letter-spacing:0.15em;color:#92400e">${tempPassword}</p>
    </div>
    <p>Ao entrar com essa senha, voce sera solicitado a criar uma senha definitiva.</p>
    <p style="color:#64748b;font-size:14px">Se voce nao solicitou a ativacao, ignore este email.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

async function sendWithNodemailer(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const host = process.env['SMTP_HOST'];
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const from = process.env['SMTP_FROM'] ?? 'meritum@sistema.com';
  const port = Number(process.env['SMTP_PORT'] ?? 587);

  const nodemailer = await import('nodemailer');

  if (!host || !user || !pass) {
    // Ethereal: SMTP de teste — cria conta automaticamente e gera link de preview
    const testAccount = await nodemailer.default.createTestAccount();
    const transporter = nodemailer.default.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
    console.log('[email] Enviado via Ethereal (teste):');
    console.log('  Para:', opts.to);
    console.log('  Assunto:', opts.subject);
    console.log('  Preview:', nodemailer.default.getTestMessageUrl(info));
    return;
  }

  const transporter = nodemailer.default.createTransport({ host, port, auth: { user, pass } });
  await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html });
}

export async function sendCoinReceivedEmail(params: SendCoinEmailParams): Promise<void> {
  try {
    await sendWithNodemailer({
      to: params.studentEmail,
      subject: `Meritum: voce recebeu ${params.amount} moedas!`,
      html: buildStudentReceiveHtml(params)
    });
  } catch (err) {
    console.error('[email] Falha ao notificar aluno:', err);
  }
}

export async function sendProfessorActivationEmail(professorEmail: string, professorName: string, tempPassword: string): Promise<void> {
  try {
    await sendWithNodemailer({
      to: professorEmail,
      subject: 'Meritum: ative sua conta de professor',
      html: buildProfessorActivationHtml(professorName, tempPassword)
    });
  } catch (err) {
    console.error('[email] Falha ao enviar ativacao:', err);
  }
}

export async function sendCoinSentConfirmationEmail(params: ProfessorSentEmailParams): Promise<void> {
  try {
    await sendWithNodemailer({
      to: params.professorEmail,
      subject: `Meritum: envio de ${params.amount} moedas confirmado`,
      html: buildProfessorSentHtml(params)
    });
  } catch (err) {
    console.error('[email] Falha ao notificar professor:', err);
  }
}
