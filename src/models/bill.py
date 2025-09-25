from src.models.table import Table

class Bill:
    def __init__(self, table: Table, tax_rate=0.20, service_rate=0.15, tip_rate=0.10):
        self.table = table
        self.tax_rate = tax_rate
        self.service_rate = service_rate
        self.tip_rate = tip_rate

    def calculate_subtotal(self) -> float:
        """Subtotal = sum of all orders at the table (before charges)."""
        return self.table.calculate_subtotal()

    def calculate_total(self) -> float:
        """Final total = subtotal + tax + service + tip."""
        subtotal = self.calculate_subtotal()
        tax = subtotal * self.tax_rate
        service = subtotal * self.service_rate
        tip = subtotal * self.tip_rate
        return subtotal + tax + service + tip

    def breakdown(self) -> dict:
        """Return detailed breakdown as a dictionary."""
        subtotal = self.calculate_subtotal()
        return {
            "subtotal": subtotal,
            "tax": subtotal * self.tax_rate,
            "service": subtotal * self.service_rate,
            "tip": subtotal * self.tip_rate,
            "total": self.calculate_total()
        }

    def __str__(self):
        breakdown = self.breakdown()
        return (
            f"Subtotal: ${breakdown['subtotal']:.2f}\n"
            f"Tax: ${breakdown['tax']:.2f}\n"
            f"Service Charge: ${breakdown['service']:.2f}\n"
            f"Tip: ${breakdown['tip']:.2f}\n"
            f"Total: ${breakdown['total']:.2f}"
        )
