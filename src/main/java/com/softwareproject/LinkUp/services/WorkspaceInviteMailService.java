package com.softwareproject.LinkUp.services;

import com.softwareproject.LinkUp.entities.User;
import com.softwareproject.LinkUp.entities.Workspace;
import com.softwareproject.LinkUp.enums.WorkspaceRole;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WorkspaceInviteMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.from}")
    private String mailFrom;

    @Value("${FRONTEND_URL:http://localhost:5173}")
    private String frontendUrl;

    public void sendWorkspaceInvite(
            Workspace workspace,
            User invitee,
            User invitedBy,
            WorkspaceRole role,
            String token
    ) throws MessagingException {
        String acceptUrl = frontendUrl.replaceAll("/$", "") + "/team/invite?token=" + token;

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(mailFrom);
        helper.setTo(invitee.getEmail());
        helper.setSubject("You're invited to workspace \"" + workspace.getName() + "\" on LinkUp");

        String inviterName = invitedBy != null ? invitedBy.getName() : "A workspace owner";
        String html = """
                <html><body style="font-family:sans-serif;line-height:1.5">
                <p>Hi %s,</p>
                <p>%s has invited you to join the workspace <strong>%s</strong> as <strong>%s</strong>.</p>
                <p>Sign in to LinkUp with this email address, then accept the invitation:</p>
                <p><a href="%s">Accept invitation</a></p>
                <p style="color:#666;font-size:12px">If the button does not work, copy this link into your browser:<br/>%s</p>
                </body></html>
                """
                .formatted(
                        escapeHtml(invitee.getName()),
                        escapeHtml(inviterName),
                        escapeHtml(workspace.getName()),
                        role.name(),
                        acceptUrl,
                        acceptUrl
                );

        helper.setText(html, true);
        mailSender.send(message);
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
