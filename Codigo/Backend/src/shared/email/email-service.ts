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

function resolveFrontendUrl(): string {
  return process.env['FRONTEND_URL'] ?? 'http://localhost:5173';
}

/**
 * Layout base compartilhado por todos os e-mails do Meritum.
 * Cada e-mail fornece apenas o título da aba, o título visível e o corpo.
 */
function renderEmailLayout(tabTitle: string, heading: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><title>Meritum - ${tabTitle}</title></head>
<body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:32px">
    <h1 style="color:#2563eb;margin-top:0">Meritum</h1>
    <h2 style="color:#1e293b">${heading}</h2>
    ${bodyHtml}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
    <p style="color:#94a3b8;font-size:12px">Sistema de Moeda Estudantil - Meritum</p>
  </div>
</body>
</html>`;
}

/** Caixa de destaque colorida usada para motivo, código, senha etc. */
function highlightBox(accentColor: string, backgroundColor: string, innerHtml: string, centered = false): string {
  const align = centered ? 'text-align:center' : '';
  return `
    <div style="background:${backgroundColor};border-left:4px solid ${accentColor};padding:16px;margin:24px 0;border-radius:4px;${align}">
      ${innerHtml}
    </div>`;
}

/** Botão de call-to-action apontando para o frontend. */
function ctaButton(label: string, path: string): string {
  return `
    <div style="text-align:center;margin:32px 0">
      <a href="${resolveFrontendUrl()}${path}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600">
        ${label}
      </a>
    </div>`;
}

/** Bloco de cupom (código + QR code embutido) compartilhado entre aluno e parceiro. */
function couponBlock(label: string, code: string, qrContentId: string, accentColor: string, backgroundColor: string, textColor: string): string {
  return `
    <div style="background:${backgroundColor};border-left:4px solid ${accentColor};padding:20px;margin:24px 0;border-radius:4px;text-align:center">
      <p style="margin:0 0 12px;font-size:0.85rem;color:${textColor}">${label}</p>
      <p style="margin:0 0 20px;font-size:2rem;font-weight:700;letter-spacing:0.25em;color:${textColor}">${code}</p>
      <img src="cid:${qrContentId}" alt="QR Code" style="width:180px;height:180px;border:2px solid ${accentColor};border-radius:4px" />
    </div>`;
}

function buildStudentReceiveHtml(p: SendCoinEmailParams): string {
  return renderEmailLayout('Moedas Recebidas', 'Voce recebeu moedas!', `
    <p>Ola, <strong>${p.studentName}</strong>!</p>
    <p>O professor <strong>${p.professorName}</strong> enviou <strong>${p.amount} moedas</strong> para voce.</p>
    ${highlightBox('#2563eb', '#f0f9ff', `<p style="margin:0;color:#1e40af"><strong>Motivo:</strong> ${p.motive}</p>`)}
    <p style="color:#64748b;font-size:14px">Acesse o sistema para ver seu saldo atualizado.</p>`);
}

function buildProfessorSentHtml(p: ProfessorSentEmailParams): string {
  return renderEmailLayout('Confirmacao de Envio', 'Envio de moedas confirmado', `
    <p>Ola, <strong>${p.professorName}</strong>!</p>
    <p>Voce enviou <strong>${p.amount} moedas</strong> para o aluno <strong>${p.studentName}</strong>.</p>
    ${highlightBox('#16a34a', '#f0fdf4', `<p style="margin:0;color:#15803d"><strong>Motivo registrado:</strong> ${p.motive}</p>`)}
    <p style="color:#64748b;font-size:14px">A transacao foi registrada no seu extrato.</p>`);
}

function buildProfessorActivationHtml(name: string, tempPassword: string): string {
  return renderEmailLayout('Ativacao de Conta', 'Ativacao de conta — Professor', `
    <p>Ola, <strong>${name}</strong>!</p>
    <p>Sua senha temporaria para acesso ao sistema Meritum e:</p>
    ${highlightBox('#ca8a04', '#fefce8',
      `<p style="margin:0;font-size:1.5rem;font-weight:700;letter-spacing:0.15em;color:#92400e">${tempPassword}</p>`, true)}
    <p>Ao entrar com essa senha, voce sera solicitado a criar uma senha definitiva.</p>
    <p style="color:#64748b;font-size:14px">Se voce nao solicitou a ativacao, ignore este email.</p>`);
}

function buildRegistrationReceivedHtml(name: string, entityDescription: string): string {
  return renderEmailLayout('Cadastro Recebido', 'Solicitacao recebida!', `
    <p>Ola, <strong>${name}</strong>!</p>
    <p>Recebemos a solicitacao de cadastro ${entityDescription} no sistema Meritum.</p>
    <p>Nossa equipe ira analisar e, apos a aprovacao, voce recebera um novo email confirmando o acesso.</p>
    <p style="color:#64748b;font-size:14px">Caso nao tenha feito esta solicitacao, ignore este email.</p>`);
}

function buildApprovalHtml(name: string, approvalMessage: string): string {
  return renderEmailLayout('Conta Aprovada', 'Sua conta foi aprovada!', `
    <p>Ola, <strong>${name}</strong>!</p>
    <p>${approvalMessage}</p>
    <p>Voce ja pode acessar o sistema com o email e senha informados no cadastro.</p>
    ${ctaButton('Acessar o sistema', '/login')}
    <p style="color:#64748b;font-size:14px">Se voce nao se cadastrou, ignore este email.</p>`);
}

function buildStudentCouponHtml(studentName: string, advantageTitle: string, partnerName: string, coinCost: number, code: string): string {
  return renderEmailLayout('Cupom de Resgate', 'Seu cupom de resgate', `
    <p>Ola, <strong>${studentName}</strong>!</p>
    <p>Voce resgatou a vantagem <strong>${advantageTitle}</strong> oferecida por <strong>${partnerName}</strong> por <strong>${coinCost} moedas</strong>.</p>
    <p>Apresente o codigo e o QR code abaixo no estabelecimento para utilizar sua vantagem:</p>
    ${couponBlock('CODIGO DO CUPOM', code, 'qrcode-student', '#92400e', '#fefce8', '#92400e')}
    <p style="color:#64748b;font-size:14px">Guarde este email. O codigo e unico e sera verificado pelo parceiro no momento da troca.</p>`);
}

function buildPartnerRedemptionHtml(partnerName: string, studentName: string, advantageTitle: string, coinCost: number, code: string): string {
  return renderEmailLayout('Nova Troca', 'Nova troca realizada', `
    <p>Ola, <strong>${partnerName}</strong>!</p>
    <p>O aluno <strong>${studentName}</strong> resgatou a vantagem <strong>${advantageTitle}</strong> por <strong>${coinCost} moedas</strong>.</p>
    <p>Quando o aluno apresentar o cupom, verifique o codigo e o QR code abaixo:</p>
    ${couponBlock('CODIGO DO CUPOM A VERIFICAR', code, 'qrcode-partner', '#16a34a', '#f0fdf4', '#15803d')}
    <p style="color:#64748b;font-size:14px">Confirme que o codigo apresentado pelo aluno corresponde ao codigo acima e o QR code combina antes de realizar a troca.</p>`);
}

function buildStudentWelcomeHtml(studentName: string, institutionName: string): string {
  return renderEmailLayout('Bem-vindo!', 'Bem-vindo ao Meritum!', `
    <p>Ola, <strong>${studentName}</strong>!</p>
    <p>Sua conta no sistema Meritum foi criada com sucesso pela instituicao <strong>${institutionName}</strong>.</p>
    <p>Voce ja pode acessar o sistema para:</p>
    <ul style="color:#64748b;font-size:14px">
      <li>Ver seu saldo de moedas</li>
      <li>Consultar seu historico de recebimentos</li>
      <li>Resgatar vantagens com seus professores</li>
    </ul>
    ${ctaButton('Acessar o sistema', '/login')}
    <p style="color:#64748b;font-size:14px">Se voce nao criou esta conta, ignore este email.</p>`);
}

type EmailAttachment = {
  filename: string;
  content: Buffer;
  /** Referenciado no HTML via cid:<contentId> para imagens embutidas (ex.: QR code). */
  contentId?: string;
};

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
};

function resolveFrom(): string {
  return process.env['MAIL_FROM'] ?? process.env['SMTP_FROM'] ?? 'Meritum <onboarding@resend.dev>';
}

/** Gera o anexo de QR Code do cupom, embutido no HTML via cid:<contentId>. */
async function buildQrCodeAttachment(code: string, contentId: string): Promise<EmailAttachment> {
  const content = await QRCode.toBuffer(code, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });
  return { filename: 'qrcode.png', content, contentId };
}

/**
 * Envia e-mail escolhendo o provedor pela variável de ambiente, nesta ordem:
 *   1. RESEND_API_KEY       -> Resend (HTTP na porta 443; funciona no Render, que bloqueia as portas SMTP 25/465/587).
 *   2. SMTP_HOST/USER/PASS  -> nodemailer via SMTP (dev local ou hosts sem bloqueio de porta).
 *   3. nenhum dos dois      -> Ethereal (conta de teste; NÃO entrega e-mail real, apenas gera link de preview).
 */
async function sendEmail(opts: SendEmailOptions): Promise<void> {
  const from = resolveFrom();
  const resendApiKey = process.env['RESEND_API_KEY'];

  if (resendApiKey) {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentId: a.contentId
      }))
    });
    if (error) {
      throw new Error(`[Resend] ${error.name}: ${error.message}`);
    }
    console.log(`[email] Enviado via Resend para ${opts.to} | assunto: ${opts.subject} | id: ${data?.id}`);
    return;
  }

  const host = process.env['SMTP_HOST'];
  const user = process.env['SMTP_USER'];
  const pass = process.env['SMTP_PASS'];
  const port = Number(process.env['SMTP_PORT'] ?? 587);

  const nodemailer = await import('nodemailer');
  // nodemailer usa "cid" no lugar de "contentId" para imagens embutidas.
  const attachments = opts.attachments?.map((a) => ({
    filename: a.filename,
    content: a.content,
    cid: a.contentId
  }));

  if (!host || !user || !pass) {
    // Ethereal: SMTP de teste — cria conta automaticamente e gera link de preview
    const testAccount = await nodemailer.default.createTestAccount();
    const transporter = nodemailer.default.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, attachments });
    console.log('[email] Enviado via Ethereal (teste):');
    console.log('  Para:', opts.to);
    console.log('  Assunto:', opts.subject);
    console.log('  Preview:', nodemailer.default.getTestMessageUrl(info));
    return;
  }

  const transporter = nodemailer.default.createTransport({ host, port, auth: { user, pass } });
  const info = await transporter.sendMail({ from, to: opts.to, subject: opts.subject, html: opts.html, attachments });
  console.log(`[email] Enviado via SMTP (${host}:${port}) para ${opts.to} | assunto: ${opts.subject} | messageId: ${info.messageId}`);
}

/**
 * Envia o e-mail sem propagar exceções: falha de e-mail não deve
 * derrubar o fluxo de negócio que a disparou (padrão de todos os envios).
 */
async function sendEmailSafely(errorLabel: string, opts: SendEmailOptions): Promise<void> {
  try {
    await sendEmail(opts);
  } catch (err) {
    console.error(`[email] ${errorLabel}:`, err);
  }
}

export async function sendStudentCouponEmail(studentEmail: string, studentName: string, advantageTitle: string, partnerName: string, coinCost: number, code: string): Promise<void> {
  try {
    const qrAttachment = await buildQrCodeAttachment(code, 'qrcode-student');
    await sendEmail({
      to: studentEmail,
      subject: `Meritum: cupom de resgate — ${advantageTitle}`,
      html: buildStudentCouponHtml(studentName, advantageTitle, partnerName, coinCost, code),
      attachments: [qrAttachment]
    });
  } catch (err) {
    console.error('[email] Falha ao enviar cupom ao aluno:', err);
  }
}

export async function sendPartnerRedemptionEmail(partnerEmail: string, partnerName: string, studentName: string, advantageTitle: string, coinCost: number, code: string): Promise<void> {
  try {
    const qrAttachment = await buildQrCodeAttachment(code, 'qrcode-partner');
    await sendEmail({
      to: partnerEmail,
      subject: `Meritum: nova troca — ${advantageTitle}`,
      html: buildPartnerRedemptionHtml(partnerName, studentName, advantageTitle, coinCost, code),
      attachments: [qrAttachment]
    });
  } catch (err) {
    console.error('[email] Falha ao notificar parceiro da troca:', err);
  }
}

export async function sendCoinReceivedEmail(params: SendCoinEmailParams): Promise<void> {
  await sendEmailSafely('Falha ao notificar aluno', {
    to: params.studentEmail,
    subject: `Meritum: voce recebeu ${params.amount} moedas!`,
    html: buildStudentReceiveHtml(params)
  });
}

export async function sendProfessorActivationEmail(professorEmail: string, professorName: string, tempPassword: string): Promise<void> {
  await sendEmailSafely('Falha ao enviar ativacao', {
    to: professorEmail,
    subject: 'Meritum: ative sua conta de professor',
    html: buildProfessorActivationHtml(professorName, tempPassword)
  });
}

export async function sendPartnerRegistrationEmail(partnerEmail: string, partnerName: string): Promise<void> {
  await sendEmailSafely('Falha ao confirmar registro de parceiro', {
    to: partnerEmail,
    subject: 'Meritum: solicitacao de cadastro recebida',
    html: buildRegistrationReceivedHtml(partnerName, 'da sua empresa como parceira')
  });
}

export async function sendPartnerApprovalEmail(partnerEmail: string, partnerName: string): Promise<void> {
  await sendEmailSafely('Falha ao notificar aprovacao de parceiro', {
    to: partnerEmail,
    subject: 'Meritum: sua conta de empresa parceira foi aprovada',
    html: buildApprovalHtml(partnerName, 'Sua solicitacao de cadastro como empresa parceira no sistema Meritum foi <strong>aprovada</strong>.')
  });
}

export async function sendInstitutionRegistrationEmail(email: string, name: string): Promise<void> {
  await sendEmailSafely('Falha ao confirmar registro de instituicao', {
    to: email,
    subject: 'Meritum: solicitacao de cadastro recebida',
    html: buildRegistrationReceivedHtml(name, 'da sua instituicao')
  });
}

export async function sendInstitutionApprovalEmail(email: string, name: string): Promise<void> {
  await sendEmailSafely('Falha ao notificar aprovacao de instituicao', {
    to: email,
    subject: 'Meritum: sua conta de instituicao foi aprovada',
    html: buildApprovalHtml(name, 'A solicitacao de cadastro da sua instituicao no sistema Meritum foi <strong>aprovada</strong>.')
  });
}

export async function sendCoinSentConfirmationEmail(params: ProfessorSentEmailParams): Promise<void> {
  await sendEmailSafely('Falha ao notificar professor', {
    to: params.professorEmail,
    subject: `Meritum: envio de ${params.amount} moedas confirmado`,
    html: buildProfessorSentHtml(params)
  });
}

export async function sendStudentWelcomeEmail(studentEmail: string, studentName: string, institutionName: string): Promise<void> {
  await sendEmailSafely('Falha ao enviar email de boas-vindas ao aluno', {
    to: studentEmail,
    subject: 'Meritum: bem-vindo ao sistema!',
    html: buildStudentWelcomeHtml(studentName, institutionName)
  });
}
