import os
import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Custom canvas that performs two-pass rendering to dynamically compute
    the total page count and draw running headers and footers matching NCET format.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, total_pages):
        # Don't draw headers/footers on page 1 (cover page)
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#475569"))

        # Running Header
        self.drawString(54, A4[1] - 36, "AI Career & Smart Roadmap System (AI CareerPath)")
        self.drawRightString(A4[0] - 54, A4[1] - 36, "Dept. of CSE, NCET")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.75)
        self.line(54, A4[1] - 42, A4[0] - 54, A4[1] - 42)

        # Running Footer
        self.line(54, 46, A4[0] - 54, 46)
        self.drawString(54, 32, "Dept. of CSE, NCET")
        self.drawCentredString(A4[0] / 2.0, 32, "2025-26")
        page_str = f"{self._pageNumber}"
        self.drawRightString(A4[0] - 54, 32, page_str)
        self.restoreState()

print("NumberedCanvas initialized successfully.")
