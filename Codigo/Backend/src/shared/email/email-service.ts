import QRCode from 'qrcode';

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

function buildPartnerRegistrationHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Cadastro Recebido</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Solicitacao recebida!</h2>
    <p>Ola, <strong>${name}</strong>!</p>
    <p>Recebemos a solicitacao de cadastro da sua empresa como parceira no sistema Meritum.</p>
    <p>Nossa equipe ira analisar e, apos a aprovacao, voce recebera um novo email confirmando o acesso.</p>
    <p style="color:#64748b;font-size:14px">Caso nao tenha feito esta solicitacao, ignore este email.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildPartnerApprovalHtml(name: string): string {
  const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Conta Aprovada</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Sua conta foi aprovada!</h2>
    <p>Ola, <strong>${name}</strong>!</p>
    <p>Sua solicitacao de cadastro como empresa parceira no sistema Meritum foi <strong>aprovada</strong>.</p>
    <p>Voce ja pode acessar o sistema com o email e senha informados no cadastro.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${frontendUrl}/login" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
        Acessar o sistema
      </a>
    </div>
    <p style="color:#64748b;font-size:14px">Se voce nao se cadastrou, ignore este email.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildStudentCouponHtml(studentName: string, advantageTitle: string, partnerName: string, coinCost: number, code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Cupom de Resgate</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Seu cupom de resgate</h2>
    <p>Ola, <strong>${studentName}</strong>!</p>
    <p>Voce resgatou a vantagem <strong>${advantageTitle}</strong> oferecida por <strong>${partnerName}</strong> por <strong>${coinCost} moedas</strong>.</p>
    <p>Apresente o codigo e o QR code abaixo no estabelecimento para utilizar sua vantagem:</p>
    <div style="background:#fefce8;border-left:4px solid #ca8a04;padding:20px;margin:24px 0;border-radius:4px;text-align:center">
      <p style="margin:0 0 12px;font-size:0.85rem;color:#78350f">CODIGO DO CUPOM</p>
      <p style="margin:0 0 20px;font-size:2rem;font-weight:700;letter-spacing:0.25em;color:#92400e">${code}</p>
      <img src="cid:qrcode-student" alt="QR Code" style="width:180px;height:180px;border:2px solid #92400e;border-radius:4px" />
    </div>
    <p style="color:#64748b;font-size:14px">Guarde este email. O codigo e unico e sera verificado pelo parceiro no momento da troca.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildPartnerRedemptionHtml(partnerName: string, studentName: string, advantageTitle: string, coinCost: number, code: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Nova Troca</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Nova troca realizada</h2>
    <p>Ola, <strong>${partnerName}</strong>!</p>
    <p>O aluno <strong>${studentName}</strong> resgatou a vantagem <strong>${advantageTitle}</strong> por <strong>${coinCost} moedas</strong>.</p>
    <p>Quando o aluno apresentar o cupom, verifique o codigo e o QR code abaixo:</p>
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:20px;margin:24px 0;border-radius:4px;text-align:center">
      <p style="margin:0 0 12px;font-size:0.85rem;color:#15803d">CODIGO DO CUPOM A VERIFICAR</p>
      <p style="margin:0 0 20px;font-size:2rem;font-weight:700;letter-spacing:0.25em;color:#166534">${code}</p>
      <img src="cid:qrcode-partner" alt="QR Code" style="width:180px;height:180px;border:2px solid #16a34a;border-radius:4px" />
    </div>
    <p style="color:#64748b;font-size:14px">Confirme que o codigo apresentado pelo aluno corresponde ao codigo acima e o QR code combina antes de realizar a troca.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildInstitutionRegistrationHtml(name: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Cadastro Recebido</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Solicitacao recebida!</h2>
    <p>Ola, <strong>${name}</strong>!</p>
    <p>Recebemos a solicitacao de cadastro da sua instituicao no sistema Meritum.</p>
    <p>Nossa equipe ira analisar e, apos a aprovacao, voce recebera um novo email confirmando o acesso.</p>
    <p style="color:#64748b;font-size:14px">Caso nao tenha feito esta solicitacao, ignore este email.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildInstitutionApprovalHtml(name: string): string {
  const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Conta Aprovada</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Sua conta foi aprovada!</h2>
    <p>Ola, <strong>${name}</strong>!</p>
    <p>A solicitacao de cadastro da sua instituicao no sistema Meritum foi <strong>aprovada</strong>.</p>
    <p>Voce ja pode acessar o sistema com o email e senha informados no cadastro.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="${frontendUrl}/login" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
        Acessar o sistema
      </a>
    </div>
    <p style="color:#64748b;font-size:14px">Se voce nao se cadastrou, ignore este email.</p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

function buildStudentWelcomeHtml(studentName: string, institutionName: string): string {
  const frontendUrl = process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - Bem-vindo!</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">Bem-vindo ao Meritum!</h2>
    <p>Ola, <strong>${studentName}</strong>!</p>
    <p>Sua conta no sistema Meritum foi criada com sucesso pela instituicao <strong>${institutionName}</strong>.</p>
    <p>Voce ja pode acessar o sistema para:</p>
    <ul style="color:#64748b;font-size:14px">
      <li>Ver seu saldo de moedas</li>
      <li>Consultar seu historico de recebimentos</li>
      <li>Resgatar vantagens com seus professores</li>
    </ul>
    <div style="text-align:center;margin:32px 0">
      <a href="${frontendUrl}/login" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
        Acessar o sistema
      </a>
    </div>
    <p style="color:#64748b;font-size:14px">Se voce nao criou esta conta, ignore este email.</p>
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

export async function sendStudentCouponEmail(studentEmail: string, studentName: string, advantageTitle: string, partnerName: string, coinCost: number, code: string): Promise<void> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(code, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const nodemailer = await import('nodemailer');
    const host = process.env['SMTP_HOST'];
    const user = process.env['SMTP_USER'];
    const pass = process.env['SMTP_PASS'];
    const from = process.env['SMTP_FROM'] ?? 'meritum@sistema.com';
    const port = Number(process.env['SMTP_PORT'] ?? 587);

    let transporter: any;
    if (!host || !user || !pass) {
      const testAccount = await nodemailer.default.createTestAccount();
      transporter = nodemailer.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } else {
      transporter = nodemailer.default.createTransport({ host, port, auth: { user, pass } });
    }

    await transporter.sendMail({
      from,
      to: studentEmail,
      subject: `Meritum: cupom de resgate — ${advantageTitle}`,
      html: buildStudentCouponHtml(studentName, advantageTitle, partnerName, coinCost, code),
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode-student'
        }
      ]
    });
  } catch (err) {
    console.error('[email] Falha ao enviar cupom ao aluno:', err);
  }
}

export async function sendPartnerRedemptionEmail(partnerEmail: string, partnerName: string, studentName: string, advantageTitle: string, coinCost: number, code: string): Promise<void> {
  try {
    const qrCodeBuffer = await QRCode.toBuffer(code, {
      width: 200,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    });

    const nodemailer = await import('nodemailer');
    const host = process.env['SMTP_HOST'];
    const user = process.env['SMTP_USER'];
    const pass = process.env['SMTP_PASS'];
    const from = process.env['SMTP_FROM'] ?? 'meritum@sistema.com';
    const port = Number(process.env['SMTP_PORT'] ?? 587);

    let transporter: any;
    if (!host || !user || !pass) {
      const testAccount = await nodemailer.default.createTestAccount();
      transporter = nodemailer.default.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
    } else {
      transporter = nodemailer.default.createTransport({ host, port, auth: { user, pass } });
    }

    await transporter.sendMail({
      from,
      to: partnerEmail,
      subject: `Meritum: nova troca — ${advantageTitle}`,
      html: buildPartnerRedemptionHtml(partnerName, studentName, advantageTitle, coinCost, code),
      attachments: [
        {
          filename: 'qrcode.png',
          content: qrCodeBuffer,
          cid: 'qrcode-partner'
        }
      ]
    });
  } catch (err) {
    console.error('[email] Falha ao notificar parceiro da troca:', err);
  }
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

export async function sendPartnerRegistrationEmail(partnerEmail: string, partnerName: string): Promise<void> {
  try {
    await sendWithNodemailer({
      to: partnerEmail,
      subject: 'Meritum: solicitacao de cadastro recebida',
      html: buildPartnerRegistrationHtml(partnerName)
    });
  } catch (err) {
    console.error('[email] Falha ao confirmar registro de parceiro:', err);
  }
}

export async function sendPartnerApprovalEmail(partnerEmail: string, partnerName: string): Promise<void> {
  try {
    await sendWithNodemailer({
      to: partnerEmail,
      subject: 'Meritum: sua conta de empresa parceira foi aprovada',
      html: buildPartnerApprovalHtml(partnerName)
    });
  } catch (err) {
    console.error('[email] Falha ao notificar aprovacao de parceiro:', err);
  }
}

export async function sendInstitutionRegistrationEmail(email: string, name: string): Promise<void> {
  try {
    await sendWithNodemailer({
      to: email,
      subject: 'Meritum: solicitacao de cadastro recebida',
      html: buildInstitutionRegistrationHtml(name)
    });
  } catch (err) {
    console.error('[email] Falha ao confirmar registro de instituicao:', err);
  }
}

export async function sendInstitutionApprovalEmail(email: string, name: string): Promise<void> {
  try {
    await sendWithNodemailer({
      to: email,
      subject: 'Meritum: sua conta de instituicao foi aprovada',
      html: buildInstitutionApprovalHtml(name)
    });
  } catch (err) {
    console.error('[email] Falha ao notificar aprovacao de instituicao:', err);
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

export async function sendStudentWelcomeEmail(studentEmail: string, studentName: string, institutionName: string): Promise<void> {
  try {
    await sendWithNodemailer({
      to: studentEmail,
      subject: 'Meritum: bem-vindo ao sistema!',
      html: buildStudentWelcomeHtml(studentName, institutionName)
    });
  } catch (err) {
    console.error('[email] Falha ao enviar email de boas-vindas ao aluno:', err);
  }
}
