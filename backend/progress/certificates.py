import io

from django.utils import timezone
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.pdfgen import canvas

from content.models import Lesson


def check_and_issue_certificate(student, course):
    """
    Student shu course'dagi barcha darslarni tugatganmi tekshiradi,
    agar shunday bo'lsa va sertifikat hali yo'q bo'lsa — yaratadi.
    """
    from .models import LessonProgress, Certificate

    total = Lesson.objects.filter(module__course=course, is_published=True).count()
    if total == 0:
        return None

    completed = LessonProgress.objects.filter(
        student=student,
        lesson__module__course=course,
        status=LessonProgress.Status.COMPLETED,
    ).count()

    if completed >= total:
        cert, created = Certificate.objects.get_or_create(student=student, course=course)
        return cert
    return None


def generate_certificate_pdf(certificate):
    """Sertifikat uchun bezakli PDF yaratadi va BytesIO buffer qaytaradi."""
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)

    primary = colors.HexColor('#4338ca')
    gold = colors.HexColor('#c9a227')
    dark = colors.HexColor('#1f2937')
    gray = colors.HexColor('#6b7280')
    bg_wash = colors.HexColor('#f7f6fd')

    center_x = width / 2

    # --- Fon (juda yengil rang) ---
    c.setFillColor(bg_wash)
    c.rect(0, 0, width, height, fill=1, stroke=0)

    # --- Tashqi qalin (indigo) va ichki yupqa (oltin) ramka ---
    margin = 1.0 * cm
    c.setStrokeColor(primary)
    c.setLineWidth(4)
    c.rect(margin, margin, width - 2 * margin, height - 2 * margin, fill=0, stroke=1)

    inner_margin = margin + 0.35 * cm
    c.setStrokeColor(gold)
    c.setLineWidth(1.2)
    c.rect(inner_margin, inner_margin, width - 2 * inner_margin, height - 2 * inner_margin, fill=0, stroke=1)

    # --- Burchak bezaklari ---
    def corner_flourish(x, y, dx, dy):
        c.setStrokeColor(gold)
        c.setLineWidth(1.5)
        c.line(x, y, x + dx * 1.3 * cm, y)
        c.line(x, y, x, y + dy * 1.3 * cm)

    corner_flourish(inner_margin, height - inner_margin, 1, -1)
    corner_flourish(width - inner_margin, height - inner_margin, -1, -1)
    corner_flourish(inner_margin, inner_margin, 1, 1)
    corner_flourish(width - inner_margin, inner_margin, -1, 1)

    # --- Kichik brend yozuvi ---
    c.setFont('Helvetica', 11)
    c.setFillColor(gold)
    c.drawCentredString(center_x, height - 3.0 * cm, "E N G L I S H   W I T H   D I Y O R A")

    # --- Sarlavha ---
    c.setFont('Times-Bold', 34)
    c.setFillColor(dark)
    c.drawCentredString(center_x, height - 4.4 * cm, "Certificate of Completion")

    # --- Sarlavha ostidagi bezakli chiziq + olmoscha ---
    line_y = height - 5.0 * cm
    c.setStrokeColor(gold)
    c.setLineWidth(1)
    c.line(center_x - 3 * cm, line_y, center_x - 0.6 * cm, line_y)
    c.line(center_x + 0.6 * cm, line_y, center_x + 3 * cm, line_y)

    d = 0.12 * cm
    c.setFillColor(gold)
    p = c.beginPath()
    p.moveTo(center_x, line_y + d)
    p.lineTo(center_x + d, line_y)
    p.lineTo(center_x, line_y - d)
    p.lineTo(center_x - d, line_y)
    p.close()
    c.drawPath(p, fill=1, stroke=0)

    # --- "Berildi" matni ---
    c.setFont('Times-Italic', 13)
    c.setFillColor(gray)
    c.drawCentredString(center_x, height - 6.6 * cm, "This is proudly presented to")

    # --- Ism (markaziy element) ---
    student_name = certificate.student.full_name or certificate.student.username
    c.setFont('Times-BoldItalic', 30)
    c.setFillColor(primary)
    c.drawCentredString(center_x, height - 8.1 * cm, student_name)

    name_width = c.stringWidth(student_name, 'Times-BoldItalic', 30)
    c.setStrokeColor(gold)
    c.setLineWidth(0.8)
    c.line(
        center_x - name_width / 2 - 0.3 * cm, height - 8.5 * cm,
        center_x + name_width / 2 + 0.3 * cm, height - 8.5 * cm,
    )

    # --- Kurs nomi ---
    c.setFont('Times-Roman', 13)
    c.setFillColor(dark)
    c.drawCentredString(center_x, height - 9.8 * cm, "for successfully completing the course")

    c.setFont('Times-Bold', 19)
    c.setFillColor(dark)
    c.drawCentredString(center_x, height - 11.0 * cm, certificate.course.title)

    # --- Muhr (medal + ribbon) — pastda o'ngda ---
    seal_x = width - 4.3 * cm
    seal_y = 3.6 * cm
    seal_r = 1.4 * cm

    c.setFillColor(gold)
    c.circle(seal_x, seal_y, seal_r, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.circle(seal_x, seal_y, seal_r - 0.18 * cm, fill=1, stroke=0)
    c.setStrokeColor(gold)
    c.setLineWidth(1.2)
    c.circle(seal_x, seal_y, seal_r - 0.18 * cm, fill=0, stroke=1)

    c.setFont('Helvetica-Bold', 9)
    c.setFillColor(primary)
    c.drawCentredString(seal_x, seal_y + 0.12 * cm, "DIO")
    c.setFont('Helvetica', 6)
    c.drawCentredString(seal_x, seal_y - 0.35 * cm, "ENGLISH")

    c.setFillColor(gold)
    ribbon_left = c.beginPath()
    ribbon_left.moveTo(seal_x - 0.55 * cm, seal_y - seal_r + 0.1 * cm)
    ribbon_left.lineTo(seal_x - 0.1 * cm, seal_y - seal_r - 1.1 * cm)
    ribbon_left.lineTo(seal_x - 0.55 * cm, seal_y - seal_r - 0.6 * cm)
    ribbon_left.close()
    c.drawPath(ribbon_left, fill=1, stroke=0)

    ribbon_right = c.beginPath()
    ribbon_right.moveTo(seal_x + 0.55 * cm, seal_y - seal_r + 0.1 * cm)
    ribbon_right.lineTo(seal_x + 0.1 * cm, seal_y - seal_r - 1.1 * cm)
    ribbon_right.lineTo(seal_x + 0.55 * cm, seal_y - seal_r - 0.6 * cm)
    ribbon_right.close()
    c.drawPath(ribbon_right, fill=1, stroke=0)

    # --- Imzo chizig'i — pastda chapda ---
    sig_x = 4.5 * cm
    sig_y = 3.6 * cm
    c.setStrokeColor(dark)
    c.setLineWidth(0.8)
    c.line(sig_x - 2.8 * cm, sig_y, sig_x + 2.8 * cm, sig_y)
    c.setFont('Helvetica', 9)
    c.setFillColor(gray)
    c.drawCentredString(sig_x, sig_y - 0.45 * cm, "Founder, Diyora")

    # --- Sana va sertifikat raqami ---
    c.setFont('Helvetica', 9)
    c.setFillColor(gray)
    issued_date = certificate.issued_at.strftime('%B %d, %Y')
    c.drawCentredString(
        center_x, 1.7 * cm,
        f"Issued on {issued_date}  ·  Certificate No. {certificate.certificate_number}",
    )

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer