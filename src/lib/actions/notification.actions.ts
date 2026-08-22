'use server';

/**
 * Server Actions for sending abandoned-cart notifications.
 * Uses Resend (or any transactional email service) via the EMAIL_SERVICE_API_KEY env var.
 */

import { writeAuditLog, AUDIT_ACTIONS } from '@/lib/firebase/audit';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface SendReminderPayload {
  adminId: string;
  adminEmail: string;
  cartIds: string[];           // abandoned_carts document IDs
  recipients: {
    cartId: string;
    email: string;
    name: string;
    productTitle: string;
    productSlug: string;
  }[];
  messageTemplate: string;     // may contain $name and $iphone-abandonado placeholders
}

/**
 * Send abandoned-cart reminder emails.
 * Marks each cart document as notified on success.
 */
export async function actionSendAbandonmentReminders(
  payload: SendReminderPayload
): Promise<{ success: boolean; sent: number; error?: string }> {
  const { adminId, adminEmail, recipients, messageTemplate } = payload;
  const apiKey = process.env.EMAIL_SERVICE_API_KEY;
  const fromEmail = process.env.EMAIL_FROM ?? 'noreply@iphoneencuotas.com';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.iphoneencuotas.com';

  if (!apiKey) {
    console.warn('[actionSendAbandonmentReminders] EMAIL_SERVICE_API_KEY not set — mock mode');
  }

  let sent = 0;

  for (const recipient of recipients) {
    const personalizedMessage = messageTemplate
      .replace(/\$name/g, recipient.name)
      .replace(/\$iphone-abandonado/g, recipient.productTitle);

    try {
      if (apiKey) {
        // Send via Resend API
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: recipient.email,
            subject: `¡Tu ${recipient.productTitle} te está esperando!`,
            text: personalizedMessage,
            html: `
              <p>${personalizedMessage.replace(/\n/g, '<br>')}</p>
              <p style="margin-top:24px;">
                <a href="${siteUrl}/${recipient.productSlug}"
                   style="background:#0071E3;color:#fff;padding:12px 24px;border-radius:980px;text-decoration:none;font-weight:600;">
                  Ver mi iPhone
                </a>
              </p>
            `,
          }),
        });

        if (!res.ok) {
          console.error('[actionSendAbandonmentReminders] Resend error:', await res.text());
          continue;
        }
      } else {
        // Mock mode — just log
        console.log(`[Mock email] To: ${recipient.email}\n${personalizedMessage}`);
      }

      // Mark the cart as notified
      await updateDoc(doc(db, 'abandoned_carts', recipient.cartId), {
        notificationSentAt: new Date(),
      });

      sent++;
    } catch (err) {
      console.error(`[actionSendAbandonmentReminders] Failed for ${recipient.email}:`, err);
    }
  }

  await writeAuditLog({
    adminId,
    adminEmail,
    action: AUDIT_ACTIONS.SEND_ABANDONMENT_NOTIFICATION,
    targetId: 'batch',
    targetType: 'order',
    details: { sent, total: recipients.length },
  });

  return { success: sent > 0, sent };
}
